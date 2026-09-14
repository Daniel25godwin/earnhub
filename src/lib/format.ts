// Suggested location: src/lib/format.ts

const CURRENCY = 'NGN'

export function formatMoney(cents: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: CURRENCY,
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100)
}

export function formatRelativeTime(iso: string) {
  const diffMs = new Date(iso).getTime() - Date.now()
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const diffMinutes = Math.round(diffMs / 60_000)
  if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, 'minute')
  const diffHours = Math.round(diffMinutes / 60)
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour')
  const diffDays = Math.round(diffHours / 24)
  if (Math.abs(diffDays) < 30) return rtf.format(diffDays, 'day')
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
