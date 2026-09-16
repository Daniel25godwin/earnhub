import { useEffect, useState } from 'react'
import { BottomNav } from '@/components/BottomNav'
import { BackButton } from '@/components/BackButton'

const PREFS_KEY = 'settings:prefs'

type Prefs = {
  taskAlerts: boolean
  payoutAlerts: boolean
  reduceAnimations: boolean
}

const DEFAULTS: Prefs = { taskAlerts: true, payoutAlerts: true, reduceAnimations: false }

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS
  } catch {
    return DEFAULTS
  }
}

const ROWS: { key: keyof Prefs; label: string; hint: string }[] = [
  { key: 'taskAlerts', label: 'New task alerts', hint: 'Tell me when new tasks are added' },
  { key: 'payoutAlerts', label: 'Payout updates', hint: 'Tell me when a withdrawal changes status' },
  { key: 'reduceAnimations', label: 'Reduce animations', hint: 'Cut back on motion across the app' },
]

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-100 ${
        checked ? 'bg-brand-600' : 'bg-slate-200'
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
          checked ? 'left-[22px]' : 'left-0.5'
        }`}
      />
    </button>
  )
}

export default function Settings() {
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs)

  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
    } catch {
      // ignore storage failures
    }
  }, [prefs])

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8">
      <BackButton />

      <div>
        <p className="text-sm font-medium text-brand-600">Settings</p>
        <h1 className="text-2xl font-semibold text-slate-900">Preferences</h1>
        <p className="mt-1 text-sm text-slate-500">Changes save as you make them.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {ROWS.map(({ key, label, hint }) => (
          <div
            key={key}
            className="flex items-center gap-4 border-b border-slate-100 p-4 last:border-b-0"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900">{label}</p>
              <p className="text-xs text-slate-500">{hint}</p>
            </div>
            <Toggle
              checked={prefs[key]}
              label={label}
              onChange={(v) => setPrefs((p) => ({ ...p, [key]: v }))}
            />
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}
