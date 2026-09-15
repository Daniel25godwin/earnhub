import { useEffect, useMemo, useState } from 'react'
import { Clock, Search, Check, Loader2 } from 'lucide-react'
import { BottomNav } from '@/components/BottomNav'
import { BackButton } from '@/components/BackButton'
import { StatusBadge } from '@/components/StatusBadge'
import { Banner468x60 } from '@/components/ads/Banner468x60'
import { formatMoney } from '@/lib/format'
import { useWallet } from '@/lib/wallet-store'
import { TASKS, CATEGORY_LABELS, DIFFICULTY_TONE, type AppTask } from '@/data/tasks'

const SMARTLINK_URL = 'https://www.profitableratecpmnetwork.com/zk8716jj3?key=25f5c645f2a424e49fa4b05c421bf952'
const VERIFY_MS = 30000 // show "verifying" for 30s before the button flips to Completed
const PENDING_KEY = 'earn:pendingVerification'

// startedAt timestamps keyed by task id, persisted to localStorage so the
// 30s countdown survives a full-page redirect/reload from the smartlink —
// not just an in-memory timer, which a navigation would wipe out.
function loadPending(): Record<string, number> {
  try {
    const raw = localStorage.getItem(PENDING_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function savePending(map: Record<string, number>) {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(map))
  } catch {
    // ignore storage failures (private browsing, quota, etc.)
  }
}

export default function Earn() {
  const wallet = useWallet()
  const [search, setSearch] = useState('')
  const [pending, setPending] = useState<Record<string, number>>(() => loadPending())
  const [now, setNow] = useState(() => Date.now())

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return TASKS
    return TASKS.filter((t) => t.title.toLowerCase().includes(q))
  }, [search])

  // Tick once a second: updates the countdown text and drops entries once
  // their 30s window has passed (the task itself was already credited on tap).
  useEffect(() => {
    const id = window.setInterval(() => {
      setNow(Date.now())
      setPending((prev) => {
        const next = { ...prev }
        let changed = false
        for (const [taskId, startedAt] of Object.entries(prev)) {
          if (Date.now() - startedAt >= VERIFY_MS) {
            delete next[taskId]
            changed = true
          }
        }
        if (changed) savePending(next)
        return changed ? next : prev
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [])

  function openSmartlink() {
    const opened = window.open(SMARTLINK_URL, '_blank', 'noopener,noreferrer')
    if (opened) return

    // Popup blocked (common on mobile). Fall back to a synthetic anchor click,
    // which mobile browsers allow because it's still inside the tap handler.
    const a = document.createElement('a')
    a.href = SMARTLINK_URL
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  function handleComplete(task: AppTask) {
    if (wallet.isTaskCompleted(task.id) || pending[task.id]) return

    // Credit right away — before opening the link — so the reward is safe
    // even if the smartlink takes over this tab and unmounts the page.
    // The 30s "verifying" state below is purely a display delay on top of that.
    wallet.creditTask(task)

    const next = { ...pending, [task.id]: Date.now() }
    setPending(next)
    savePending(next)

    openSmartlink()
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8">
      <BackButton />

      {/* Header */}
      <div>
        <p className="text-sm font-medium text-brand-600">Earn</p>
        <h1 className="text-2xl font-semibold text-slate-900">Find a task</h1>
        <p className="mt-1 text-sm text-slate-500">Complete tasks below to add to your balance.</p>
      </div>

      {/* Banner ad */}
      <Banner468x60 />

      {/* Search */}
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

      {/* Task grid */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="rounded-full bg-slate-100 p-3">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">No tasks match your search.</p>
            <button onClick={() => setSearch('')} className="text-sm font-medium text-brand-600 hover:text-brand-700">
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
                const completed = wallet.isTaskCompleted(task.id)
                const startedAt = pending[task.id]
                const verifying = completed && startedAt !== undefined && now - startedAt < VERIFY_MS
                const secondsLeft = verifying ? Math.max(1, Math.ceil((VERIFY_MS - (now - startedAt)) / 1000)) : 0
                const showCompleted = completed && !verifying

                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => handleComplete(task)}
                    disabled={completed || verifying}
                    className={`group rounded-xl border p-4 text-left transition-colors ${
                      showCompleted
                        ? 'cursor-default border-slate-200 bg-slate-50 opacity-70'
                        : verifying
                          ? 'cursor-wait border-brand-300 bg-brand-50'
                          : 'border-slate-200 hover:border-brand-300 hover:bg-brand-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">
                        {CATEGORY_LABELS[task.categoryKey]}
                      </span>
                      <StatusBadge label={task.difficulty} tone={DIFFICULTY_TONE[task.difficulty]} />
                    </div>
                    <p className="mt-2 text-sm font-medium text-slate-900 group-hover:text-brand-700">
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
