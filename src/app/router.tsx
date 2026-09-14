import { createBrowserRouter } from 'react-router-dom'
import { RequireAuth } from '@/guards/RequireAuth'
import { RequireRole } from '@/guards/RequireRole'
import { AppShell } from '@/components/layout/AppShell'
import { AdminShell } from '@/components/layout/AdminShell'

// Public pages
import Landing from '@/pages/public/Landing'
import Login from '@/pages/public/Login'
import Signup from '@/pages/public/Signup'
import ForgotPassword from '@/pages/public/ForgotPassword'
import ResetPassword from '@/pages/public/ResetPassword'
import VerifyEmail from '@/pages/public/VerifyEmail'

// User pages
import Dashboard from '@/pages/user/Dashboard'
import Earn from '@/pages/user/Earn'
import TaskDetail from '@/pages/user/TaskDetail'
import MyTasks from '@/pages/user/MyTasks'
import Wallet from '@/pages/user/Wallet'
import Withdraw from '@/pages/user/Withdraw'
import Referrals from '@/pages/user/Referrals'
import Notifications from '@/pages/user/Notifications'
import Profile from '@/pages/user/Profile'
import Settings from '@/pages/user/Settings'

// Admin pages
import Overview from '@/pages/admin/Overview'
import Users from '@/pages/admin/Users'
import UserDetail from '@/pages/admin/UserDetail'
import Tasks from '@/pages/admin/Tasks'
import TaskForm from '@/pages/admin/TaskForm'
import Submissions from '@/pages/admin/Submissions'
import SubmissionDetail from '@/pages/admin/SubmissionDetail'
import Withdrawals from '@/pages/admin/Withdrawals'
import Transactions from '@/pages/admin/Transactions'
import ReferralsAdmin from '@/pages/admin/ReferralsAdmin'
import NotificationsAdmin from '@/pages/admin/NotificationsAdmin'
import Reports from '@/pages/admin/Reports'
import SettingsAdmin from '@/pages/admin/SettingsAdmin'
import AuditLogs from '@/pages/admin/AuditLogs'

export const router = createBrowserRouter([
  // ── Public routes ──────────────────────────────────────────
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Signup /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password', element: <ResetPassword /> },
  { path: '/verify-email', element: <VerifyEmail /> },

  // ── Authenticated user routes ──────────────────────────────
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/dashboard', element: <Dashboard /> },
          { path: '/earn', element: <Earn /> },
          { path: '/earn/:taskId', element: <TaskDetail /> },
          { path: '/my-tasks', element: <MyTasks /> },
          { path: '/wallet', element: <Wallet /> },
          { path: '/wallet/withdraw', element: <Withdraw /> },
          { path: '/referrals', element: <Referrals /> },
          { path: '/notifications', element: <Notifications /> },
          { path: '/profile', element: <Profile /> },
          { path: '/settings', element: <Settings /> },
        ],
      },
    ],
  },

  // ── Admin routes (role >= moderator) ───────────────────────
  {
    element: <RequireAuth />,
    children: [
      {
        element: <RequireRole minRole="moderator" />,
        children: [
          {
            path: '/admin',
            element: <AdminShell />,
            children: [
              { index: true, element: <Overview /> },
              { path: 'users', element: <Users /> },
              { path: 'users/:userId', element: <UserDetail /> },
              { path: 'tasks', element: <Tasks /> },
              { path: 'tasks/new', element: <TaskForm /> },
              { path: 'tasks/:taskId/edit', element: <TaskForm /> },
              { path: 'submissions', element: <Submissions /> },
              { path: 'submissions/:submissionId', element: <SubmissionDetail /> },
              { path: 'withdrawals', element: <Withdrawals /> },
              { path: 'transactions', element: <Transactions /> },
              { path: 'referrals', element: <ReferralsAdmin /> },
              { path: 'notifications', element: <NotificationsAdmin /> },
              { path: 'reports', element: <Reports /> },
              { path: 'settings', element: <SettingsAdmin /> },
              { path: 'audit-logs', element: <AuditLogs /> },
            ],
          },
        ],
      },
    ],
  },
])
