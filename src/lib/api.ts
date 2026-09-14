// Suggested location: src/lib/api.ts  (replaces the fetch-based version)
//
// Spark plan has no Cloud Functions / outbound network calls, so there's no
// REST backend to hit. This reads straight from Firestore using the client
// SDK, gated by Firestore Security Rules instead of server-side route
// handlers. The exported `api` shape is unchanged, so Dashboard.tsx doesn't
// need any edits.
//
// Requires `db` (getFirestore) exported from '@/lib/firebase' alongside
// `auth`. If it's not there yet:
//
//   import { getFirestore } from 'firebase/firestore'
//   export const db = getFirestore(app)
//
// Firestore collections this assumes (top-level, flat — adjust names to
// match whatever you actually create):
//   wallets/{uid}              -> { availableBalance, pendingBalance, reservedBalance, lifetimeEarnings }
//   transactions                -> { userId, type, status, amount, description, createdAt }
//   tasks                       -> { title, categoryKey, rewardAmount, estimatedMinutes, difficulty, status }
//   notifications                -> { userId, type, title, message, isRead, createdAt }
//
// Firestore will throw with a "create index" link in the console the first
// time you run each `where(...) + orderBy(...)` query below — click it once
// per query, it's a one-time setup per index, free on Spark.

import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit as fsLimit,
  orderBy,
  query,
  Timestamp,
  where,
} from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

export class ApiError extends Error {
  status: number
  constructor(message: string, status = 400) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function requireUid(): string {
  const uid = auth.currentUser?.uid
  if (!uid) throw new ApiError('You need to sign in again.', 401)
  return uid
}

function toIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'string') return value
  return new Date().toISOString()
}

// ── Types (mirroring the Prisma schema in 01-architecture.md) ──────────────

export type TransactionType =
  | 'TASK_REWARD'
  | 'REFERRAL_BONUS'
  | 'REFERRAL_COMMISSION'
  | 'WITHDRAWAL'
  | 'WITHDRAWAL_REVERSAL'
  | 'ADJUSTMENT'
  | 'BONUS'
  | 'SIGNUP_BONUS'

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'REVERSED'

export interface Transaction {
  id: string
  type: TransactionType
  status: TransactionStatus
  amount: number // cents; positive = credit, negative = debit
  description: string
  createdAt: string
}

export type TaskCategory =
  | 'VIDEO'
  | 'SURVEY'
  | 'WEBSITE_VISIT'
  | 'SOCIAL'
  | 'APP_TESTING'
  | 'OFFER'
  | 'CUSTOM'

export type TaskDifficulty = 'EASY' | 'MEDIUM' | 'HARD'

export interface RecommendedTask {
  id: string
  title: string
  categoryKey: TaskCategory
  rewardAmount: number // cents
  estimatedMinutes: number
  difficulty: TaskDifficulty
}

export type NotificationType =
  | 'TASK_APPROVED'
  | 'TASK_REJECTED'
  | 'WITHDRAWAL_APPROVED'
  | 'WITHDRAWAL_REJECTED'
  | 'WITHDRAWAL_COMPLETED'
  | 'NEW_TASK'
  | 'ACCOUNT_WARNING'
  | 'ADMIN_ANNOUNCEMENT'
  | 'REFERRAL_BONUS'

export interface NotificationItem {
  id: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

export interface WalletResponse {
  availableBalance: number
  pendingBalance: number
  reservedBalance: number
  lifetimeEarnings: number
}

export interface TransactionsResponse {
  transactions: Transaction[]
}

export interface TasksResponse {
  tasks: RecommendedTask[]
}

export interface NotificationsResponse {
  notifications: NotificationItem[]
  unreadCount: number
}

// ── API surface used by the dashboard (same shape as before) ───────────────

export const api = {
  async getWallet(): Promise<WalletResponse> {
    const uid = requireUid()
    try {
      const snap = await getDoc(doc(db, 'wallets', uid))
      if (!snap.exists()) {
        // Brand new user, no wallet doc written yet — treat as zeroed out
        // rather than erroring.
        return { availableBalance: 0, pendingBalance: 0, reservedBalance: 0, lifetimeEarnings: 0 }
      }
      const data = snap.data()
      return {
        availableBalance: data.availableBalance ?? 0,
        pendingBalance: data.pendingBalance ?? 0,
        reservedBalance: data.reservedBalance ?? 0,
        lifetimeEarnings: data.lifetimeEarnings ?? 0,
      }
    } catch (err) {
      throw new ApiError('Could not load your wallet.', 500)
    }
  },

  async getTransactions(count = 5): Promise<TransactionsResponse> {
    const uid = requireUid()
    try {
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', uid),
        orderBy('createdAt', 'desc'),
        fsLimit(count),
      )
      const snap = await getDocs(q)
      return {
        transactions: snap.docs.map((d) => {
          const data = d.data()
          return {
            id: d.id,
            type: data.type,
            status: data.status,
            amount: data.amount,
            description: data.description,
            createdAt: toIso(data.createdAt),
          }
        }),
      }
    } catch (err) {
      throw new ApiError('Could not load recent transactions.', 500)
    }
  },

  async getRecommendedTasks(count = 4): Promise<TasksResponse> {
    try {
      const q = query(
        collection(db, 'tasks'),
        where('status', '==', 'ACTIVE'),
        orderBy('rewardAmount', 'desc'),
        fsLimit(count),
      )
      const snap = await getDocs(q)
      return {
        tasks: snap.docs.map((d) => {
          const data = d.data()
          return {
            id: d.id,
            title: data.title,
            categoryKey: data.categoryKey,
            rewardAmount: data.rewardAmount,
            estimatedMinutes: data.estimatedMinutes,
            difficulty: data.difficulty,
          }
        }),
      }
    } catch (err) {
      throw new ApiError('Could not load tasks.', 500)
    }
  },

  async getNotifications(count = 5): Promise<NotificationsResponse> {
    const uid = requireUid()
    try {
      const recentQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', uid),
        orderBy('createdAt', 'desc'),
        fsLimit(count),
      )
      const unreadQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', uid),
        where('isRead', '==', false),
      )

      const [recentSnap, unreadCountSnap] = await Promise.all([
        getDocs(recentQuery),
        getCountFromServer(unreadQuery),
      ])

      return {
        notifications: recentSnap.docs.map((d) => {
          const data = d.data()
          return {
            id: d.id,
            type: data.type,
            title: data.title,
            message: data.message,
            isRead: data.isRead ?? false,
            createdAt: toIso(data.createdAt),
          }
        }),
        unreadCount: unreadCountSnap.data().count,
      }
    } catch (err) {
      throw new ApiError('Could not load notifications.', 500)
    }
  },
}
