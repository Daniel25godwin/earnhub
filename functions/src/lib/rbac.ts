import { HttpsError, type CallableRequest } from 'firebase-functions/v2/https'

export type AppRole = 'user' | 'moderator' | 'admin'

const ROLE_RANK: Record<AppRole, number> = {
  user: 0,
  moderator: 1,
  admin: 2,
}

/**
 * Throws HttpsError('unauthenticated') if there's no signed-in user, or
 * HttpsError('permission-denied') if the caller's custom-claim role is below minRole.
 *
 * Custom claims are only ever set via the admin-setUserRole callable function (itself
 * gated to existing admins), so a client cannot forge `role` by editing a Firestore doc —
 * the mirrored `role` field on the `users/{uid}` document is for querying/display only
 * and is never trusted for authorization decisions.
 *
 * Usage inside a callable function:
 *   export const adjustBalance = onCall(async (request) => {
 *     requireRole(request, 'admin')
 *     ...
 *   })
 */
export function requireRole(request: CallableRequest, minRole: AppRole): { uid: string; role: AppRole } {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in to perform this action.')
  }

  const role = (request.auth.token.role as AppRole | undefined) ?? 'user'

  if (ROLE_RANK[role] < ROLE_RANK[minRole]) {
    throw new HttpsError(
      'permission-denied',
      `This action requires ${minRole} privileges.`
    )
  }

  return { uid: request.auth.uid, role }
}

/** Lighter check for callable functions any signed-in user may call — just asserts auth. */
export function requireAuth(request: CallableRequest): { uid: string } {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in to perform this action.')
  }
  return { uid: request.auth.uid }
}
