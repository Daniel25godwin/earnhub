import { useEffect, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { formatMoney } from '@/lib/format'

/**
 * DEMO / PLACEHOLDER DATA ONLY.
 *
 * These entries are fake and generic — not real users or real transactions.
 * Before shipping this to production, replace `FIRST_NAME_POOL` (and the
 * random-pick logic below) with a real feed of completed payouts, e.g.:
 *
 *   const { data } = useQuery(['recent-withdrawals'], fetchRecentWithdrawals)
 *
 * Names are masked client-side (e.g. "T***e A.") on both fake and real data
 * — keep that masking in place if you wire in a real backend feed too.
 */
type WithdrawalEntry = {
  id: string
  name: string
  method: string
  amount: number
  minutesAgo: number
}

const FIRST_NAME_POOL = [
  'Chidi', 'Aisha', 'Emeka', 'Grace', 'Yusuf', 'Ada', 'Femi', 'Halima',
  'Obinna', 'Zainab', 'Kemi', 'Bola', 'Ifeoma', 'Sani', 'Nkechi', 'Tolu',
]
const LAST_INITIAL_POOL = [
  'A.', 'B.', 'E.', 'K.', 'L.', 'M.', 'N.', 'O.', 'P.', 'R.', 'S.', 'T.',
]

const METHOD_POOL = [
  'via PalmPay', 'via Moniepoint', 'via OPay', 'via Bank Transfer / NIP',
  'via Kuda', 'via USDT (TRC20)',
]

// Masks a first name to "T***e" style — first and last letter kept, middle starred.
function maskName(firstName: string, lastInitial: string) {
  const masked =
    firstName.length <= 2
      ? firstName
      : firstName[0] + '*'.repeat(firstName.length - 2) + firstName[firstName.length - 1]
  return `${masked} ${lastInitial}`
}

// formatMoney divides by 100 (kobo -> naira), so we store amounts x100 to
// display a clean ₦40,000–₦100,000 range.
const MIN_DISPLAY_AMOUNT = 40000
const MAX_DISPLAY_AMOUNT = 100000

function randomEntry(): WithdrawalEntry {
  const firstName = FIRST_NAME_POOL[Math.floor(Math.random() * FIRST_NAME_POOL.length)]
  const lastInitial = LAST_INITIAL_POOL[Math.floor(Math.random() * LAST_INITIAL_POOL.length)]
  const method = METHOD_POOL[Math.floor(Math.random() * METHOD_POOL.length)]
  const displayAmount =
    Math.round(
      (Math.random() * (MAX_DISPLAY_AMOUNT - MIN_DISPLAY_AMOUNT) + MIN_DISPLAY_AMOUNT) / 1000,
    ) * 1000
  return {
    id: `${Date.now()}-${Math.random()}`,
    name: maskName(firstName, lastInitial),
    method,
    amount: displayAmount * 100,
    minutesAgo: Math.floor(Math.random() * 3) + 1,
  }
}

const INITIAL_COUNT = 6
const MAX_ENTRIES = 6
const ADD_INTERVAL_MS = 6000

export function LiveWithdrawals() {
  const [entries, setEntries] = useState<WithdrawalEntry[]>(() =>
    Array.from({ length: INITIAL_COUNT }, randomEntry),
  )

  useEffect(() => {
    const timer = setInterval(() => {
      setEntries((prev) => [randomEntry(), ...prev].slice(0, MAX_ENTRIES))
    }, ADD_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Live withdrawals</h2>
        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          LIVE
        </span>
      </div>

      <div className="mt-3 space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <TrendingUp className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium text-slate-900">{entry.name} withdrew</p>
                <p className="text-xs text-slate-500">
                  {entry.method} · {entry.minutesAgo} min ago
                </p>
              </div>
            </div>
            <p className="text-sm font-semibold text-brand-600">
              {formatMoney(entry.amount)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
