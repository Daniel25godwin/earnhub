import { Outlet } from 'react-router-dom'

/**
 * Placeholder shell for the admin area. Replaced with the full admin sidebar
 * nav in the Admin Dashboard step.
 */
export function AdminShell() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-slate-900 px-6 py-4">
        <span className="text-lg font-semibold text-white">EarnHub Admin</span>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
