import { Outlet } from 'react-router-dom'

/**
 * Placeholder shell for the authenticated user area (sidebar on desktop,
 * bottom tab bar on mobile). Replaced with the full nav in the UI step —
 * kept minimal here so routing/auth guards can be verified end-to-end now.
 */
export function AppShell() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <span className="text-lg font-semibold text-slate-900">EarnHub</span>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
