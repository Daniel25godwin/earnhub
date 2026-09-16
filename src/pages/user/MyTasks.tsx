import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Check, Clock, ListChecks } from 'lucide-react'
import { BottomNav } from '@/components/BottomNav'
import { BackButton } from '@/components/BackButton'
import { StatusBadge } from '@/components/StatusBadge'
import { formatMoney } from '@/lib/format'
import { useWallet } from '@/lib/wallet-store'
import { TASKS, CATEGORY_LABELS, DIFFICULTY_TONE } from '@/data/tasks'

export default function MyTasks() {
  const wallet = useWallet()

  const { completed, remaining, earned } = useMemo(() => {
    const done = TASKS.filter((t) => wallet.isTaskCompleted(t.id))
    return {
      completed: done,
      remaining: TASKS.length - done.length,
      earned: done.reduce((sum, t) => sum + t.rewardAmount, 0),
    }
  }, [wallet])

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8">
      <BackButton />

      <div>
        <p className="text-sm font-medium text-brand-600">My tasks</p>
        <h1 className="text-2xl font-semibold text-slate-900">Everything you&rsquo;ve finished</h1>
        <p className="mt-1 text-sm text-slate-500">
          {completed.length} of {TASKS.length} tasks done.
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">Earned from tasks</p>
          <p className="mt-1 text-xl font-semibold text-success-500">{formatMoney(earned)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">Completed</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{completed.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">Still available</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{remaining}</p>
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {completed.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="rounded-full bg-slate-100 p-3">
              <ListChecks className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">You haven&rsquo;t completed a task yet.</p>
            <Link
              to="/earn"
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
            >
              Find a task
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {completed.map((task) => (
              <li key={task.id}>
                <Link
                  to={`/earn/${task.id}`}
                  className="flex items-center justify-between gap-4 py-3 transition-colors hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-500">
                        {CATEGORY_LABELS[task.categoryKey]}
                      </span>
                      <StatusBadge label={task.difficulty} tone={DIFFICULTY_TONE[task.difficulty]} />
                    </div>
                    <p className="mt-1 truncate text-sm font-medium text-slate-900">{task.title}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="h-3.5 w-3.5" />
                      {task.estimatedMinutes} min
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-success-500">
                      +{formatMoney(task.rewardAmount)}
                    </p>
                    <p className="mt-1 flex items-center justify-end gap-1 text-xs font-medium text-success-500">
                      <Check className="h-3.5 w-3.5" />
                      Completed
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
