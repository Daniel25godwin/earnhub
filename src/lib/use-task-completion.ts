import { useCallback, useEffect, useState } from 'react'
import { useWallet } from '@/lib/wallet-store'
import type { AppTask } from '@/data/tasks'

export const SMARTLINK_URL =
  'https://www.profitableratecpmnetwork.com/zk8716jj3?key=25f5c645f2a424e49fa4b05c421bf952'
export const VERIFY_MS = 30000

const PENDING_KEY = 'earn:pendingVerification'

// startedAt timestamps keyed by task id, persisted to localStorage so the
// countdown survives a full-page redirect/reload from the smartlink.
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

export type TaskUiState = {
  completed: boolean
  verifying: boolean
  showCompleted: boolean
  secondsLeft: number
}

/**
 * Drives the three button states a task can be in (idle / verifying / completed)
 * and owns the smartlink hand-off. Shared by the Earn grid and Task detail so
 * the two screens can't disagree about what a task's state is.
 */
export function useTaskCompletion() {
  const wallet = useWallet()
  const [pending, setPending] = useState<Record<string, number>>(loadPending)
  const [now, setNow] = useState(() => Date.now())

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

  const getState = useCallback(
    (taskId: string): TaskUiState => {
      const completed = wallet.isTaskCompleted(taskId)
      const startedAt = pending[taskId]
      const verifying = completed && startedAt !== undefined && now - startedAt < VERIFY_MS
      return {
        completed,
        verifying,
        showCompleted: completed && !verifying,
        secondsLeft: verifying ? Math.max(1, Math.ceil((VERIFY_MS - (now - startedAt)) / 1000)) : 0,
      }
    },
    [wallet, pending, now],
  )

  const start = useCallback(
    (task: AppTask) => {
      if (wallet.isTaskCompleted(task.id) || pending[task.id]) return

      wallet.creditTask(task)

      const next = { ...pending, [task.id]: Date.now() }
      setPending(next)
      savePending(next)

      openSmartlink()
    },
    [wallet, pending],
  )

  return { start, getState }
}
