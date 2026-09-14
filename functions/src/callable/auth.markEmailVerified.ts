import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { db, adminAuth } from '../lib/admin'
import { requireAuth } from '../lib/rbac'

export const authMarkEmailVerified = onCall(async (request) => {
  const { uid } = requireAuth(request)

  // Re-check against Auth directly (not the possibly-stale ID token claim) —
  // this is the authoritative source right after applyActionCode() succeeds.
  const authUser = await adminAuth.getUser(uid)
  if (!authUser.emailVerified) {
    throw new HttpsError('failed-precondition', 'Email is not verified yet.')
  }

  const userRef = db.collection('users').doc(uid)
  const userDoc = await userRef.get()
  if (!userDoc.exists) {
    throw new HttpsError('not-found', 'Account setup is incomplete. Please finish signing up first.')
  }

  await userRef.update({
    emailVerified: true,
    status: 'active',
    updatedAt: new Date(),
  })

  return { ok: true }
})
