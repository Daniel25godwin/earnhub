import type { ReactNode } from 'react'
import { CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { clsx } from 'clsx'

interface AlertProps {
  variant: 'success' | 'error' | 'info'
  children: ReactNode
}

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

export function Alert({ variant, children }: AlertProps) {
  const Icon = ICONS[variant]

  return (
    <div
      role="alert"
      className={clsx(
        'flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm',
        variant === 'success' && 'border-success-500/20 bg-success-100 text-emerald-800',
        variant === 'error' && 'border-danger-500/20 bg-danger-100 text-red-800',
        variant === 'info' && 'border-info-500/20 bg-info-100 text-blue-800'
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  )
}
