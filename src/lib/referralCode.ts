/**
 * Firebase Auth uids are already globally unique, so deriving the referral code from
 * the uid gives a unique code for free — no reservation/uniqueness-check round trip needed.
 */
export function generateReferralCode(uid: string): string {
  return uid.slice(0, 8).toUpperCase()
}
