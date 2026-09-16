// Suggested location: src/components/BottomNav.tsx
//
// Mobile primary nav (architecture doc section 11: "bottom tab bar for
// primary nav on mobile, sidebar on desktop ≥1024px"). Hidden at lg: —
// pair it with a sidebar component later for desktop.
//
// Render this once in a shared authenticated layout, not per-page, once
// you have one — for now it's wired directly into Dashboard.tsx.

import { NavLink } from 'react-router-dom'
import { Home, Zap, Trophy, Users, Banknote } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Home', icon: Home, end: true },
  { to: '/earn', label: 'Earn', icon: Zap, end: false },
  { to: '/leaderboard', label: 'Leaders', icon: Trophy, end: false },
  { to: '/referrals', label: 'Invite', icon: Users, end: false },
  { to: '/wallet/withdraw', label: 'Withdraw', icon: Banknote, end: false },
] as const

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex max-w-6xl items-stretch justify-between px-2 py-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="min-w-0 flex-1">
            <NavLink
              to={to}
              end={end}
              className="flex w-full flex-col items-center justify-center gap-1 py-1.5 text-xs font-medium"
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
                      isActive ? 'bg-brand-100 text-brand-600' : 'text-slate-500'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span
                    className={`w-full truncate text-center ${
                      isActive ? 'text-brand-600' : 'text-slate-500'
                    }`}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
