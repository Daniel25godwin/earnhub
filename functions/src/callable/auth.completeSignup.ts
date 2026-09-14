import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { z } from 'zod'
import { db } from '../lib/admin'
import { requireAuth } from '../lib/rbac'
import { normalizeUsername, USERNAME_REGEX } from '../lib/username'
import { generateReferralCode } from '../lib/referralCode'

const inputSchema = z.object({
  username: z
    .string()
    .regex(USERNAME_REGEX, 'Username must be 3-20 characters: letters, numbers, and underscores only'),
})

export const authCompleteSignup = onCall(async (request) => {
  const { uid } = requireAuth(request)

  const parsed = inputSchema.safeParse(request.data)
  if (!parsed.success) {
    throw new HttpsError('invalid-argument', parsed.error.errors[0]?.message ?? 'Invalid input')
  }
  const { username } = parsed.data
  const usernameLower = normalizeUsername(username)

  const email = (request.auth!.token.email as string | undefined) ?? ''
  const emailVerified = (request.auth!.token.email_verified as boolean | undefined) ?? false

  const userRef = db.collection('users').doc(uid)
  const usernameRef = db.collection('usernames').doc(usernameLower)
  const walletRef = db.collection('wallets').doc(uid)

  await db.runTransaction(async (tx) => {
    // All reads must happen before any writes in a Firestore transaction.
    const existingUserDoc = await tx.get(userRef)
    if (existingUserDoc.exists) {
      // Already provisioned (e.g. a retried call after the client saw a transient
      // error but the server call actually succeeded) — no-op rather than error.
      return
    }

    const usernameDoc = await tx.get(usernameRef)
    if (usernameDoc.exists) {
      throw new HttpsError('already-exists', 'That username is taken. Please choose another.')
    }

    const now = new Date()

    tx.set(usernameRef, { uid, createdAt: now })
    tx.set(userRef, {
      username,
      email,
      emailVerified,
      profileImageUrl: null,
      role: 'user',
      status: 'pending_verification',
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

  return { ok: true }
})
