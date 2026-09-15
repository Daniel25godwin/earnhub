// Suggested location: src/pages/Dashboard.tsx
//
// Reads live from WalletProvider (src/lib/wallet-store.tsx) — starts at
// $0 with no transactions, and updates automatically whenever a task is
// completed on the Earn page or a referral lands (once an Invite page
// calls creditReferral()). Make sure <WalletProvider> wraps the app root.
//
// 4 Banner468x60 ad slots are placed through the page. They currently
// all use the same ad unit (only one banner code has been wired up) —
// swap some of these for a different unit (e.g. Native Banner) once
// that code is available, so the page isn't showing 4 identical ads.

import { useState } from 'react'
import { signOut, sendEmailVerification } from 'firebase/auth'
import { Link, useNavigate } from 'react-router-dom'
import {
  Wallet as WalletIcon,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ChevronRight,
  Inbox,
  LogOut,
  MailWarning,
  ShieldCheck,
  Bell,
  Gift,
} from 'lucide-react'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import { useWallet } from '@/lib/wallet-store'
import { Button } from '@/components/ui/Button'
import { BottomNav } from '@/components/BottomNav'
import { StatusBadge, type Tone } from '@/components/StatusBadge'
import { BackButton } from '@/components/BackButton'
import { Banner468x60 } from '@/components/ads/Banner468x60'
import { formatMoney, formatRelativeTime } from '@/lib/format'
import { TASKS, CATEGORY_LABELS, DIFFICULTY_TONE } from '@/data/tasks'
import type { TransactionType, TransactionStatus } from '@/lib/wallet-store'

const TRANSACTION_LABELS: Record<TransactionType, string> = {
  TASK_REWARD: 'Task reward',
  REFERRAL_BONUS: 'Referral bonus',
  REFERRAL_COMMISSION: 'Referral commission',
  WITHDRAWAL: 'Withdrawal',
  WITHDRAWAL_REVERSAL: 'Withdrawal reversed',
  ADJUSTMENT: 'Adjustment',
  BONUS: 'Bonus',
  SIGNUP_BONUS: 'Welcome bonus',
}

const STATUS_TONE: Record<TransactionStatus, Tone> = {
  COMPLETED: 'success',
  PENDING: 'warning',
  REVERSED: 'danger',
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function EmptyState({
  icon: Icon,
  title,
  action,
}: {
  icon: typeof Inbox
  title: string
  action?: { label: string; to: string }
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <div className="rounded-full bg-slate-100 p-3">
        <Icon className="h-5 w-5 text-slate-400" />
      </div>
      <p className="text-sm text-slate-500">{title}</p>
      {action && (
        <Link
          to={action.to}
          className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          {action.label}
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { firebaseUser, role } = useAuth()
  const navigate = useNavigate()
  const wallet = useWallet()

  const [verificationSent, setVerificationSent] = useState(false)

  async function handleSignOut() {
    await signOut(auth)
    navigate('/login', { replace: true })
  }

  async function handleResendVerification() {
    if (!firebaseUser) return
    await sendEmailVerification(firebaseUser)
    setVerificationSent(true)
  }

  const displayName = firebaseUser?.email?.split('@')[0] ?? 'there'

  const recommendedTasks = TASKS.filter((t) => !wallet.isTaskCompleted(t.id)).slice(0, 4)
  const recentTransactions = wallet.transactions.slice(0, 5)
  const recentNotifications = wallet.notifications.slice(0, 5)
  const unreadCount = wallet.notifications.filter((n) => !n.isRead).length

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8">
      <BackButton />

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-slate-500">{greeting()},</p>
          <h1 className="text-2xl font-semibold text-slate-900">
            {displayName} <span className="align-middle">👋</span>
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {role === 'admin' && (
            <Link to="/admin">
              <Button variant="secondary">Admin panel</Button>
            </Link>
          )}
          <Button variant="secondary" onClick={handleSignOut}>
            <LogOut className="mr-1.5 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>

      {/* Ad slot 1 — top of page, above everything else */}
      <Banner468x60 />

      {/* Email verification nudge */}
      {firebaseUser && !firebaseUser.emailVerified && (
        <div className="flex flex-col gap-3 rounded-2xl border border-warning-100 bg-warning-100/40 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <MailWarning className="mt-0.5 h-5 w-5 shrink-0 text-warning-500" />
            <div>
              <p className="text-sm font-medium text-slate-900">Verify your email</p>
              <p className="text-sm text-slate-600">
                Confirm <strong>{firebaseUser.email}</strong> to unlock withdrawals.
              </p>
            </div>
          </div>
          <Button variant="secondary" onClick={handleResendVerification} disabled={verificationSent}>
            {verificationSent ? 'Email sent' : 'Resend email'}
          </Button>
        </div>
      )}

      {/* Balance card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-success-100 p-3 text-success-500">
              <WalletIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Available balance</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
                {formatMoney(wallet.availableBalance)}
              </p>
            </div>
          </div>
          <Link to="/wallet/withdraw">
            <Button className="rounded-full px-5">Withdraw</Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 divide-x divide-slate-100 border-t border-slate-100">
          <Link to="/wallet" className="flex items-center gap-3 p-4 transition-colors hover:bg-slate-50">
            <div className="rounded-full bg-warning-100 p-2 text-warning-500">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Pending balance</p>
              <p className="text-sm font-semibold text-slate-900">{formatMoney(wallet.pendingBalance)}</p>
            </div>
          </Link>
          <Link to="/wallet" className="flex items-center gap-3 p-4 transition-colors hover:bg-slate-50">
            <div className="rounded-full bg-info-100 p-2 text-info-500">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Lifetime earnings</p>
              <p className="text-sm font-semibold text-slate-900">{formatMoney(wallet.lifetimeEarnings)}</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Ad slot 2 — between balance card and the two-column content */}
      <Banner468x60 />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left column: transactions + recommended tasks */}
        <div className="space-y-5 lg:col-span-2">
          {/* Recent transactions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Recent transactions</h2>
              <Link
                to="/wallet"
                className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                See all
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-2">
              {recentTransactions.length === 0 ? (
                <EmptyState
                  icon={Inbox}
                  title="No transactions yet — complete a task to start earning."
                  action={{ label: 'Browse tasks', to: '/earn' }}
                />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {recentTransactions.map((tx) => {
                    const isCredit = tx.amount >= 0
                    return (
                      <li key={tx.id} className="flex items-center gap-3 py-3.5">
                        <div
                          className={`rounded-full p-2.5 ${
                            isCredit ? 'bg-success-100 text-success-500' : 'bg-danger-100 text-danger-500'
                          }`}
                        >
                          {isCredit ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-900">
                            {TRANSACTION_LABELS[tx.type]}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {tx.description} · {formatRelativeTime(tx.createdAt)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`text-sm font-semibold ${isCredit ? 'text-success-500' : 'text-slate-900'}`}
                          >
                            {isCredit ? '+' : ''}
                            {formatMoney(tx.amount)}
                          </span>
                          <StatusBadge label={tx.status} tone={STATUS_TONE[tx.status]} />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* Invite banner */}
          <Link
            to="/invite"
            className="flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-brand-100 bg-brand-50 p-5 transition-colors hover:bg-brand-100/60"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-brand-100 p-2.5 text-brand-600">
                <Gift className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Invite friends</p>
                <p className="text-xs text-slate-500">Get $1 for every friend who joins!</p>
              </div>
            </div>
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white">
              Invite now
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          {/* Ad slot 3 — between invite banner and recommended tasks */}
          <Banner468x60 />

          {/* Recommended tasks */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Recommended for you</h2>
              <Link
                to="/earn"
                className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                See all tasks
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-4">
              {recommendedTasks.length === 0 ? (
                <EmptyState
                  icon={Sparkles}
                  title="You've completed every task — nice work!"
                  action={{ label: 'View wallet', to: '/wallet' }}
                />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {recommendedTasks.map((task) => (
                    <Link
                      key={task.id}
                      to="/earn"
                      className="group rounded-xl border border-slate-200 p-4 transition-colors hover:border-brand-300 hover:bg-brand-50"
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
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="h-3.5 w-3.5" />
                          {task.estimatedMinutes} min
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: notifications */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-slate-500" />
              <h2 className="text-base font-semibold text-slate-900">Notifications</h2>
              {unreadCount > 0 && (
                <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs font-medium text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={wallet.markNotificationsRead}
              className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Mark all read
            </button>
          </div>

          <div className="mt-4">
            {recentNotifications.length === 0 ? (
              <EmptyState icon={Bell} title="You're all caught up." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentNotifications.map((n) => (
                  <li key={n.id} className="flex items-start gap-2.5 py-3">
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                        n.isRead ? 'bg-transparent' : 'bg-brand-500'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{n.title}</p>
                      <p className="truncate text-xs text-slate-500">{n.message}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{formatRelativeTime(n.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {firebaseUser?.emailVerified && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
              <ShieldCheck className="h-4 w-4 shrink-0 text-success-500" />
              Account verified and in good standing.
            </div>
          )}
        </div>
      </div>

      {/* Ad slot 4 — bottom of page, before nav */}
      <Banner468x60 />

      <BottomNav />
    </div>
  )
}
