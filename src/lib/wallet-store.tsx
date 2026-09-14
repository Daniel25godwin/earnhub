// Suggested location: src/lib/wallet-store.tsx
//
// Shared, client-only wallet state — no backend. Starts at zero and only
// changes when creditTask() / creditReferral() are called (e.g. from the
// Earn page when a task completes, or an Invite page on a successful
// referral). Persisted to localStorage so it survives a refresh.
//
// Wrap your app once, near the root, e.g. in main.tsx or App.tsx:
//
//   <WalletProvider>
//     <RouterProvider router={router} />
//   </WalletProvider>

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type TransactionType =
  | 'TASK_REWARD'
  | 'REFERRAL_BONUS'
  | 'REFERRAL_COMMISSION'
  | 'WITHDRAWAL'
  | 'WITHDRAWAL_REVERSAL'
  | 'ADJUSTMENT'
  | 'BONUS'
  | 'SIGNUP_BONUS'

export type TransactionStatus = 'COMPLETED' | 'PENDING' | 'REVERSED'

export interface Transaction {
  id: string
  type: TransactionType
  status: TransactionStatus
  amount: number // cents; negative for debits
  description: string
  createdAt: string // ISO
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

interface WalletState {
  availableBalance: number
  pendingBalance: number
  lifetimeEarnings: number
  transactions: Transaction[]
  notifications: NotificationItem[]
  completedTaskIds: string[]
}

interface WalletContextValue extends WalletState {
  creditTask: (task: { id: string; title: string; rewardAmount: number }) => void
  creditReferral: (friendLabel: string, amount: number) => void
  markNotificationsRead: () => void
  isTaskCompleted: (taskId: string) => boolean
  resetWallet: () => void
}

const STORAGE_KEY = 'wallet-state-v1'

const EMPTY_STATE: WalletState = {
  availableBalance: 0,
  pendingBalance: 0,
  lifetimeEarnings: 0,
  transactions: [],
  notifications: [],
  completedTaskIds: [],
}

function loadState(): WalletState {
  if (typeof window === 'undefined') return EMPTY_STATE
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_STATE
    return { ...EMPTY_STATE, ...JSON.parse(raw) }
  } catch {
    return EMPTY_STATE
  }
}

const WalletContext = createContext<WalletContextValue | null>(null)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>(loadState)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // localStorage unavailable (private mode, etc) — state just won't persist
    }
  }, [state])

  function creditTask(task: { id: string; title: string; rewardAmount: number }) {
    setState((prev) => {
      if (prev.completedTaskIds.includes(task.id)) return prev
      const nowIso = new Date().toISOString()
      const tx: Transaction = {
        id: `tx-${Date.now()}`,
        type: 'TASK_REWARD',
        status: 'COMPLETED',
        amount: task.rewardAmount,
        description: task.title,
        createdAt: nowIso,
      }
      const notification: NotificationItem = {
        id: `n-${Date.now()}`,
        title: 'Task reward credited',
        message: `You earned $${(task.rewardAmount / 100).toFixed(2)} for "${task.title}".`,
        isRead: false,
        createdAt: nowIso,
      }
      return {
        ...prev,
        availableBalance: prev.availableBalance + task.rewardAmount,
        lifetimeEarnings: prev.lifetimeEarnings + task.rewardAmount,
        transactions: [tx, ...prev.transactions],
        notifications: [notification, ...prev.notifications],
        completedTaskIds: [...prev.completedTaskIds, task.id],
      }
    })
  }

  function creditReferral(friendLabel: string, amount: number) {
    setState((prev) => {
      const nowIso = new Date().toISOString()
      const tx: Transaction = {
        id: `tx-${Date.now()}`,
        type: 'REFERRAL_BONUS',
        status: 'COMPLETED',
        amount,
        description: `${friendLabel} joined with your code`,
        createdAt: nowIso,
      }
      const notification: NotificationItem = {
        id: `n-${Date.now()}`,
        title: 'Referral bonus credited',
        message: `You earned $${(amount / 100).toFixed(2)} — ${friendLabel} joined with your code.`,
        isRead: false,
        createdAt: nowIso,
      }
      return {
        ...prev,
        availableBalance: prev.availableBalance + amount,
        lifetimeEarnings: prev.lifetimeEarnings + amount,
        transactions: [tx, ...prev.transactions],
        notifications: [notification, ...prev.notifications],
      }
    })
  }

  function markNotificationsRead() {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, isRead: true })),
    }))
  }

  function isTaskCompleted(taskId: string) {
    return state.completedTaskIds.includes(taskId)
  }

  function resetWallet() {
    setState(EMPTY_STATE)
  }

  return (
    <WalletContext.Provider
      value={{ ...state, creditTask, creditReferral, markNotificationsRead, isTaskCompleted, resetWallet }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used within a WalletProvider')
  return ctx
}
