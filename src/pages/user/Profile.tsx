import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Settings as SettingsIcon, Users, Wallet as WalletIcon } from 'lucide-react'
import { BottomNav } from '@/components/BottomNav'
import { BackButton } from '@/components/BackButton'
import { formatMoney } from '@/lib/format'
import { useWallet } from '@/lib/wallet-store'
import { TASKS } from '@/data/tasks'

// TODO: replace with the signed-in user's real details from the backend.
const USER = { name: 'Your account', email: 'you@example.com' }

const LINKS = [
  { to: '/wallet', label: 'Wallet', hint: 'Balance and history', icon: WalletIcon },
  { to: '/referrals', label: 'Referrals', hint: 'Invite a friend', icon: Users },
  { to: '/settings', label: 'Settings', hint: 'Preferences and account', icon: SettingsIcon },
]

export default function Profile() {
  const wallet = useWallet()

  const { count, earned } = useMemo(() => {
    const done = TASKS.filter((t) => wallet.isTaskCompleted(t.id))
    return { count: done.length, earned: done.reduce((s, t) => s + t.rewardAmount, 0) }
  }, [wallet])

  const initials = USER.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8">
      <BackButton />

      <div>
        <p className="text-sm font-medium text-brand-600">Profile</p>
        <h1 className="text-2xl font-semibold text-slate-900">Your account</h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-50 text-lg font-semibold text-brand-700">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-medium text-slate-900">{USER.name}</p>
            <p className="truncate text-sm text-slate-500">{USER.email}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5">
          <div>
            <p className="text-xs text-slate-500">Tasks completed</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{count}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Earned from tasks</p>
            <p className="mt-1 text-xl font-semibold text-success-500">{formatMoney(earned)}</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {LINKS.map(({ to, label, hint, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-3 border-b border-slate-100 p-4 transition-colors last:border-b-0 hover:bg-slate-50"
          >
            <Icon className="h-5 w-5 shrink-0 text-slate-400" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900">{label}</p>
              <p className="text-xs text-slate-500">{hint}</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
          </Link>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}
