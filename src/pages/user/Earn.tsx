import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Search, Check, Loader2 } from 'lucide-react'
import { BottomNav } from '@/components/BottomNav'
import { BackButton } from '@/components/BackButton'
import { StatusBadge } from '@/components/StatusBadge'
import { Banner468x60 } from '@/components/ads/Banner468x60'
import { formatMoney } from '@/lib/format'
import { useTaskCompletion } from '@/lib/use-task-completion'
import { TASKS, CATEGORY_LABELS, DIFFICULTY_TONE } from '@/data/tasks'

export default function Earn() {
  const [search, setSearch] = useState('')
  const { start, getState } = useTaskCompletion()

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return TASKS
    return TASKS.filter((t) => t.title.toLowerCase().includes(q))
  }, [search])

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8">
      <BackButton />

      <div>
        <p className="text-sm font-medium text-brand-600">Earn</p>
        <h1 className="text-2xl font-semibold text-slate-900">Find a task</h1>
        <p className="mt-1 text-sm text-slate-500">Complete tasks below to add to your balance.</p>
      </div>

      <Banner468x60 />

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks"
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 sm:max-w-sm"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="rounded-full bg-slate-100 p-3">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">No tasks match your search.</p>
            <button
              onClick={() => setSearch('')}
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Clear search
            </button>
          </div>
        ) : (
          <>
            <p className="mb-4 text-xs text-slate-400">
              {filtered.length} task{filtered.length === 1 ? '' : 's'} available
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((task) => {
                const { verifying, showCompleted, secondsLeft } = getState(task.id)

                return (
                  <div
                    key={task.id}
                    className={`group rounded-xl border p-4 transition-colors ${
                      showCompleted
                        ? 'border-slate-200 bg-slate-50 opacity-70'
                        : verifying
                          ? 'border-brand-300 bg-brand-50'
                          : 'border-slate-200 hover:border-brand-300 hover:bg-brand-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Link
                        to={`/earn/${task.id}`}
                        className="text-xs font-medium text-slate-500 hover:text-brand-600"
                      >
                        {CATEGORY_LABELS[task.categoryKey]}
                      </Link>
                      <StatusBadge label={task.difficulty} tone={DIFFICULTY_TONE[task.difficulty]} />
                    </div>

                    <button
                      type="button"
                      onClick={() => start(task)}
                      disabled={showCompleted || verifying}
                      className={`mt-2 w-full text-left ${
                        showCompleted ? 'cursor-default' : verifying ? 'cursor-wait' : ''
                      }`}
                    >
                      <p className="text-sm font-medium text-slate-900 group-hover:text-brand-700">
                        {task.title}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-success-500">
                          +{formatMoney(task.rewardAmount)}
                        </span>
                        {showCompleted ? (
                          <span className="flex items-center gap-1 text-xs font-medium text-success-500">
                            <Check className="h-3.5 w-3.5" />
                            Completed
                          </span>
                        ) : verifying ? (
                          <span className="flex items-center gap-1 text-xs font-medium text-brand-600">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Verifying… {secondsLeft}s
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Clock className="h-3.5 w-3.5" />
                            {task.estimatedMinutes} min
                          </span>
                        )}
                      </div>
                    </button>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
