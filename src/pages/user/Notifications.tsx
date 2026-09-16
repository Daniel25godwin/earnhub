import { useMemo, useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { BottomNav } from '@/components/BottomNav'
import { BackButton } from '@/components/BackButton'
import { formatMoney } from '@/lib/format'
import { useWallet } from '@/lib/wallet-store'
import { TASKS } from '@/data/tasks'

const READ_KEY = 'notifications:read'

function loadRead(): string[] {
  try {
    const raw = localStorage.getItem(READ_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

type Notice = { id: string; title: string; body: string }

/**
 * Until there's a real notifications feed on the server, this derives notices
 * from state the client already knows about: tasks that have been credited.
 */
export default function Notifications() {
  const wallet = useWallet()
  const [read, setRead] = useState<string[]>(loadRead)

  const notices = useMemo<Notice[]>(
    () =>
      TASKS.filter((t) => wallet.isTaskCompleted(t.id)).map((t) => ({
        id: `task:${t.id}`,
        title: 'Task credited',
        body: `${formatMoney(t.rewardAmount)} was added for “${t.title}”.`,
      })),
    [wallet],
  )

  const unread = notices.filter((n) => !read.includes(n.id))

  function markAllRead() {
    const all = notices.map((n) => n.id)
    setRead(all)
    try {
      localStorage.setItem(READ_KEY, JSON.stringify(all))
    } catch {
      // ignore storage failures
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8">
      <BackButton />

      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-brand-600">Notifications</p>
          <h1 className="text-2xl font-semibold text-slate-900">Recent activity</h1>
          <p className="mt-1 text-sm text-slate-500">
            {unread.length === 0 ? 'You’re all caught up.' : `${unread.length} unread`}
          </p>
        </div>
        {unread.length > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {notices.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="rounded-full bg-slate-100 p-3">
              <Bell className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">Nothing here yet. Complete a task to get started.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {notices.map((n) => {
              const isUnread = !read.includes(n.id)
              return (
                <li key={n.id} className="flex items-start gap-3 py-3">
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      isUnread ? 'bg-brand-600' : 'bg-transparent'
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">{n.title}</p>
                    <p className="mt-0.5 text-sm text-slate-500">{n.body}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
