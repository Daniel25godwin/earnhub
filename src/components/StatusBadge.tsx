// Suggested location: src/components/StatusBadge.tsx

export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

export const TONE_CLASSES: Record<Tone, string> = {
  success: 'bg-success-100 text-success-500',
  warning: 'bg-warning-100 text-warning-500',
  danger: 'bg-danger-100 text-danger-500',
  info: 'bg-info-100 text-info-500',
  neutral: 'bg-slate-100 text-slate-600',
}

export function StatusBadge({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]}`}
    >
      {label}
    </span>
  )
}
