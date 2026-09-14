import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { z } from 'zod'
import { db } from '../lib/admin'
import { requireAuth } from '../lib/rbac'

const inputSchema = z.object({
  code: z.string().min(3).max(20),
})

export const applyReferralCode = onCall(async (request) => {
  const { uid } = requireAuth(request)

  const parsed = inputSchema.safeParse(request.data)
  if (!parsed.success) {
    throw new HttpsError('invalid-argument', 'Invalid referral code.')
  }
  const code = parsed.data.code.trim().toUpperCase()

  const referralRef = db.collection('referrals').doc(uid)
  const existing = await referralRef.get()
  if (existing.exists) {
    return { applied: false, reason: 'A referral has already been recorded for this account.' }
  }

  const referrerQuery = await db
    .collection('users')
    .where('referralCode', '==', code)
    .limit(1)
    .get()

  if (referrerQuery.empty) {
    throw new HttpsError('not-found', 'That referral code was not found.')
  }

  const referrerDoc = referrerQuery.docs[0]
  if (referrerDoc.id === uid) {
    throw new HttpsError('invalid-argument', 'You cannot refer yourself.')
  }

  const now = new Date()

  await db.runTransaction(async (tx) => {
    const doubleCheck = await tx.get(referralRef)
    if (doubleCheck.exists) return

    tx.set(referralRef, {
      referrerId: referrerDoc.id,
      status: 'pending',
      signupBonusPaid: false,
      commissionEarned: 0,
      createdAt: now,
      activatedAt: null,
    })
    tx.update(db.collection('users').doc(uid), {
      referredById: referrerDoc.id,
      updatedAt: now,
    })
  })

  return { applied: true }
})
