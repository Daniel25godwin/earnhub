import { onCall } from 'firebase-functions/v2/https'
import { setGlobalOptions } from 'firebase-functions/v2'
import './lib/admin' // ensures Admin SDK is initialized before any function runs

// Sensible defaults for the whole codebase — override per-function where needed
// (e.g. a scheduled batch job might need a longer timeout).
setGlobalOptions({
  region: 'us-central1',
  maxInstances: 10,
})

/**
 * Smoke-test function confirming the Functions deploy pipeline (build → deploy → invoke)
 * works end-to-end. Safe to remove once real functions are deployed and verified.
 */
export const ping = onCall(() => {
  return { ok: true, timestamp: Date.now() }
})

// ── Auth ─────────────────────────────────────────────────────────────────
export { authCompleteSignup } from './callable/auth.completeSignup'
export { authEnsureUserDoc } from './callable/auth.ensureUserDoc'
export { authMarkEmailVerified } from './callable/auth.markEmailVerified'

// ── Referrals ────────────────────────────────────────────────────────────
export { applyReferralCode } from './callable/referrals.applyReferralCode'

// ── Functions added in later implementation steps ──────────────────────────
// export * from './callable/tasks.startTask'
// export * from './callable/tasks.reportProgress'
// export * from './callable/tasks.submitTask'
// export * from './callable/withdrawals.requestWithdrawal'
// export * from './callable/referrals.getReferralStats'
// export * from './callable/admin.setUserRole'
// export * from './callable/admin.adjustBalance'
// export * from './callable/admin.reviewSubmission'
// export * from './callable/admin.reviewWithdrawal'
// export * from './callable/admin.createTask'
// export * from './scheduled/expireTasks'
// export * from './scheduled/maturePendingBalance'
