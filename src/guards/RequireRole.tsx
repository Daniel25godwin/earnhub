import { Navigate, Outlet } from 'react-router-dom'
import { useAuth, type AppRole } from '@/hooks/useAuth'

const ROLE_RANK: Record<AppRole, number> = {
  user: 0,
  moderator: 1,
  admin: 2,
}

interface RequireRoleProps {
  minRole: AppRole
}

export function RequireRole({ minRole }: RequireRoleProps) {
  const { role, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  const hasAccess = !!role && ROLE_RANK[role] >= ROLE_RANK[minRole]

  if (!hasAccess) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
