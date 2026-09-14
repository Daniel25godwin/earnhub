import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  collection,
  query,
  where,
  limit,
  getDocs,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { normalizeUsername, USERNAME_REGEX } from '@/lib/username'
import { generateReferralCode } from '@/lib/referralCode'

export class UsernameTakenError extends Error {
  constructor() {
    super('That username is taken. Please choose another.')
    this.name = 'UsernameTakenError'
  }
}

/**
 * Reserves the chosen username and creates users/{uid} + wallets/{uid}, right after
 * email/password signup. Idempotent: safe to call again if a prior attempt failed
 * after the Auth account was created but before this step completed.
 */
export async function completeSignup(
  uid: string,
  username: string,
  email: string,
  emailVerified: boolean
): Promise<void> {
  if (!USERNAME_REGEX.test(username)) {
    throw new Error('Username must be 3-20 characters: letters, numbers, and underscores only')
  }

  const usernameLower = normalizeUsername(username)
  const userRef = doc(db, 'users', uid)
  const usernameRef = doc(db, 'usernames', usernameLower)
  const walletRef = doc(db, 'wallets', uid)

  await runTransaction(db, async (tx) => {
    const existingUserDoc = await tx.get(userRef)
    if (existingUserDoc.exists()) {
      // Already provisioned — no-op so a retried call doesn't error.
      return
    }

    const usernameDoc = await tx.get(usernameRef)
    if (usernameDoc.exists()) {
      throw new UsernameTakenError()
    }

    tx.set(usernameRef, { uid, createdAt: serverTimestamp() })
    tx.set(userRef, {
      username,
      email,
      emailVerified,
      profileImageUrl: null,
      role: 'user',
      status: 'pending_verification',
      referredById: null,
      referralCode: generateReferralCode(uid),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    tx.set(walletRef, {
      availableBalance: 0,
      pendingBalance: 0,
      reservedBalance: 0,
      lifetimeEarnings: 0,
      updatedAt: serverTimestamp(),
    })
  })
}

/**
 * Provisions users/{uid} + wallets/{uid} for Google sign-in accounts, auto-generating
 * a username since Google gives no chance to pick one. No-ops if already provisioned.
 */
export async function ensureUserDoc(
  uid: string,
  email: string,
  photoURL: string | null
): Promise<void> {
  const userRef = doc(db, 'users', uid)
  const alreadyExists = await getDoc(userRef)
  if (alreadyExists.exists()) return

  const baseUsername =
    normalizeUsername((email.split('@')[0] || 'user').replace(/[^a-zA-Z0-9_]/g, '')) || 'user'
  const walletRef = doc(db, 'wallets', uid)

  await runTransaction(db, async (tx) => {
    const doubleCheck = await tx.get(userRef)
    if (doubleCheck.exists()) return

    // All reads must happen before any writes in a Firestore transaction.
    let usernameLower = baseUsername
    let usernameRef = doc(db, 'usernames', usernameLower)
    let usernameDoc = await tx.get(usernameRef)

    let attempts = 0
    while (usernameDoc.exists() && attempts < 5) {
      attempts++
      usernameLower = `${baseUsername}${Math.floor(Math.random() * 10000)}`
      usernameRef = doc(db, 'usernames', usernameLower)
      usernameDoc = await tx.get(usernameRef)
    }

    tx.set(usernameRef, { uid, createdAt: serverTimestamp() })
    tx.set(userRef, {
      username: usernameLower,
      email,
      emailVerified: true, // Google-authenticated emails are pre-verified
      profileImageUrl: photoURL,
      role: 'user',
      status: 'active',
      referredById: null,
      referralCode: generateReferralCode(uid),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    tx.set(walletRef, {
      availableBalance: 0,
      pendingBalance: 0,
      reservedBalance: 0,
      lifetimeEarnings: 0,
      updatedAt: serverTimestamp(),
    })
  })
}

/** Flips users/{uid}.status from pending_verification to active after email verification. */
export async function markEmailVerified(uid: string): Promise<void> {
  const userRef = doc(db, 'users', uid)
  await updateDoc(userRef, {
    emailVerified: true,
    status: 'active',
    updatedAt: serverTimestamp(),
  })
}

/** Records a referral relationship for the current user against a referrer's code. */
export async function applyReferralCode(
  uid: string,
  code: string
): Promise<{ applied: boolean; reason?: string }> {
  const normalizedCode = code.trim().toUpperCase()

  const referralRef = doc(db, 'referrals', uid)
  const existing = await getDoc(referralRef)
  if (existing.exists()) {
    return { applied: false, reason: 'A referral has already been recorded for this account.' }
  }

  const referrerQuery = query(
    collection(db, 'users'),
    where('referralCode', '==', normalizedCode),
    limit(1)
  )
  const referrerSnapshot = await getDocs(referrerQuery)

  if (referrerSnapshot.empty) {
    throw new Error('That referral code was not found.')
  }

  const referrerDoc = referrerSnapshot.docs[0]
  if (referrerDoc.id === uid) {
    throw new Error('You cannot refer yourself.')
  }

  await runTransaction(db, async (tx) => {
    const doubleCheck = await tx.get(referralRef)
    if (doubleCheck.exists()) return

    tx.set(referralRef, {
      referrerId: referrerDoc.id,
      status: 'pending',
      signupBonusPaid: false,
      commissionEarned: 0,
      createdAt: serverTimestamp(),
      activatedAt: null,
    })
    tx.update(doc(db, 'users', uid), {
      referredById: referrerDoc.id,
      updatedAt: serverTimestamp(),
    })
  })

  return { applied: true }
}
