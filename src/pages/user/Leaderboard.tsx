import { useMemo } from 'react'
import { Trophy } from 'lucide-react'
import { BottomNav } from '@/components/BottomNav'
import { BackButton } from '@/components/BackButton'
import { formatMoney } from '@/lib/format'
import { useWallet } from '@/lib/wallet-store'
import { TASKS } from '@/data/tasks'
import { DEMO_LEADERBOARD, type LeaderboardRow } from '@/data/leaderboard'

const YOU_ID = 'you'
const VISIBLE_COUNT = 30

export default function Leaderboard() {
  const wallet = useWallet()

  const { rows, you, youIsVisible } = useMemo(() => {
    const done = TASKS.filter((t) => wallet.isTaskCompleted(t.id))
    const you: LeaderboardRow = {
      id: YOU_ID,
      name: 'You',
      tasksCompleted: done.length,
      earned: done.reduce((s, t) => s + t.rewardAmount, 0),
    }
    const sorted = [...DEMO_LEADERBOARD, you].sort((a, b) => b.earned - a.earned)
    const rows = sorted.slice(0, VISIBLE_COUNT)
    const youIsVisible = rows.some((r) => r.id === YOU_ID)
    return { rows, you, youIsVisible }
  }, [wallet])

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8">
      <BackButton />

      <div>
        <p className="text-sm font-medium text-brand-600">Leaderboard</p>
        <h1 className="text-2xl font-semibold text-slate-900">Top earners this month</h1>
        <p className="mt-1 text-sm text-slate-500">Ranked by total earned from completed tasks.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <ul className="divide-y divide-slate-100">
          {rows.map((row, i) => {
            const isYou = row.id === YOU_ID
            const rank = i + 1
            return (
              <li
                key={row.id}
                className={`flex items-center gap-3 p-4 ${isYou ? 'bg-brand-50' : ''}`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    rank <= 3 ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {rank <= 3 ? <Trophy className="h-4 w-4" /> : rank}
                </span>

                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-sm font-medium ${
                      isYou ? 'text-brand-700' : 'text-slate-900'
                    }`}
                  >
                    {row.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {row.tasksCompleted} task{row.tasksCompleted === 1 ? '' : 's'}
                  </p>
                </div>

                <p className="shrink-0 text-sm font-semibold text-success-500">
                  {formatMoney(row.earned)}
                </p>
              </li>
            )
          })}

          {!youIsVisible && (
            <li className="flex items-center gap-3 bg-brand-50 p-4">
              <span className="h-8 w-8 shrink-0" aria-hidden="true" />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-brand-700">{you.name}</p>
                <p className="text-xs text-slate-500">
                  {you.tasksCompleted} task{you.tasksCompleted === 1 ? '' : 's'}
                </p>
              </div>

              <p className="shrink-0 text-sm font-semibold text-success-500">
                {formatMoney(you.earned)}
              </p>
            </li>
          )}
        </ul>
      </div>

      <BottomNav />
    </div>
  )
}
