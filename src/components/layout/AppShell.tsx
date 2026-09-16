import { Outlet } from 'react-router-dom'

/**
 * Placeholder shell for the authenticated user area (sidebar on desktop,
 * bottom tab bar on mobile). Replaced with the full nav in the UI step —
 * kept minimal here so routing/auth guards can be verified end-to-end now.
 */
export function AppShell() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <span className="text-lg font-semibold text-slate-900">EarnHub</span>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
