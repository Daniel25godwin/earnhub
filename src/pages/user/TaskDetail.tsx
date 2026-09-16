import { Link, useParams } from 'react-router-dom'
import { Check, Clock, Loader2, SearchX } from 'lucide-react'
import { BottomNav } from '@/components/BottomNav'
import { BackButton } from '@/components/BackButton'
import { StatusBadge } from '@/components/StatusBadge'
import { Banner468x60 } from '@/components/ads/Banner468x60'
import { formatMoney } from '@/lib/format'
import { useTaskCompletion } from '@/lib/use-task-completion'
import { TASKS, CATEGORY_LABELS, DIFFICULTY_TONE } from '@/data/tasks'

export default function TaskDetail() {
  const { taskId } = useParams<{ taskId: string }>()
  const { start, getState } = useTaskCompletion()

  const task = TASKS.find((t) => t.id === taskId)

  if (!task) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8">
        <BackButton />
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white py-12 text-center shadow-sm">
          <div className="rounded-full bg-slate-100 p-3">
            <SearchX className="h-5 w-5 text-slate-400" />
          </div>
          <h1 className="text-lg font-semibold text-slate-900">That task doesn&rsquo;t exist</h1>
          <p className="max-w-xs text-sm text-slate-500">
            It may have been removed since you last opened this link.
          </p>
          <Link
            to="/earn"
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            Browse tasks
          </Link>
        </div>
        <BottomNav />
      </div>
    )
  }

  const { verifying, showCompleted, secondsLeft } = getState(task.id)

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8">
      <BackButton />

      <div>
        <p className="text-sm font-medium text-brand-600">{CATEGORY_LABELS[task.categoryKey]}</p>
        <h1 className="text-2xl font-semibold text-slate-900">{task.title}</h1>
      </div>

      <Banner468x60 />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-slate-500">Reward</p>
            <p className="mt-1 text-xl font-semibold text-success-500">
              +{formatMoney(task.rewardAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Time needed</p>
            <p className="mt-1 flex items-center gap-1 text-xl font-semibold text-slate-900">
              <Clock className="h-4 w-4 text-slate-400" />
              {task.estimatedMinutes} min
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Difficulty</p>
            <div className="mt-2">
              <StatusBadge label={task.difficulty} tone={DIFFICULTY_TONE[task.difficulty]} />
            </div>
          </div>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={() => start(task)}
            disabled={showCompleted || verifying}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
              showCompleted
                ? 'cursor-default bg-slate-100 text-slate-500'
                : verifying
                  ? 'cursor-wait bg-brand-50 text-brand-600'
                  : 'bg-brand-600 text-white hover:bg-brand-700'
            }`}
          >
            {showCompleted ? (
              <>
                <Check className="h-4 w-4" />
                Completed
              </>
            ) : verifying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying… {secondsLeft}s
              </>
            ) : (
              'Start task'
            )}
          </button>

          {showCompleted && (
            <p className="mt-3 text-center text-xs text-slate-500">
              You&rsquo;ve already been credited for this task.
            </p>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
