/**
 * Firebase Auth errors come back as `{ code: 'auth/...' }`. Translate the common
 * ones into copy a user can act on; fall back to a generic message for the rest
 * rather than leaking raw Firebase error strings into the UI.
 */
export function getFirebaseAuthErrorMessage(error: unknown): string {
  const code = (error as { code?: string } | undefined)?.code

  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try logging in instead.'
    case 'auth/invalid-email':
      return 'That email address looks invalid.'
    case 'auth/weak-password':
      return 'Please choose a stronger password.'
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.'
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled.'
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.'
    case 'auth/expired-action-code':
      return 'This link has expired. Please request a new one.'
    case 'auth/invalid-action-code':
      return 'This link is invalid or has already been used.'
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact support if you think this is a mistake.'
    default:
      return 'Something went wrong. Please try again.'
  }
}
