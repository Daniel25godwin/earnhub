import { onCall } from 'firebase-functions/v2/https'
import { db } from '../lib/admin'
import { requireAuth } from '../lib/rbac'
import { normalizeUsername } from '../lib/username'
import { generateReferralCode } from '../lib/referralCode'

export const authEnsureUserDoc = onCall(async (request) => {
  const { uid } = requireAuth(request)

  const userRef = db.collection('users').doc(uid)
  const alreadyExists = await userRef.get()
  if (alreadyExists.exists) {
    return { created: false }
  }

  const email = (request.auth!.token.email as string | undefined) ?? ''
  const photoURL = (request.auth!.token.picture as string | undefined) ?? null
  const baseUsername =
    normalizeUsername((email.split('@')[0] || 'user').replace(/[^a-zA-Z0-9_]/g, '')) || 'user'

  const walletRef = db.collection('wallets').doc(uid)

  await db.runTransaction(async (tx) => {
    const doubleCheck = await tx.get(userRef)
    if (doubleCheck.exists) return

    // Try the base username first, then append a random numeric suffix on collision.
    // All reads happen before any writes, per Firestore transaction rules.
    let usernameLower = baseUsername
    let usernameRef = db.collection('usernames').doc(usernameLower)
    let usernameDoc = await tx.get(usernameRef)

    let attempts = 0
    while (usernameDoc.exists && attempts < 5) {
      attempts++
      usernameLower = `${baseUsername}${Math.floor(Math.random() * 10000)}`
      usernameRef = db.collection('usernames').doc(usernameLower)
      usernameDoc = await tx.get(usernameRef)
    }

    const now = new Date()

    tx.set(usernameRef, { uid, createdAt: now })
    tx.set(userRef, {
      username: usernameLower,
      email,
      emailVerified: true, // Google-authenticated emails are pre-verified
      profileImageUrl: photoURL,
      role: 'user',
      status: 'active',
      referredById: null,
      referralCode: generateReferralCode(uid),
      createdAt: now,
      updatedAt: now,
    })
    tx.set(walletRef, {
      availableBalance: 0,
      pendingBalance: 0,
      reservedBalance: 0,
      lifetimeEarnings: 0,
      updatedAt: now,
    })
  })

  return { created: true }
})
