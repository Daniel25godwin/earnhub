// Suggested location: src/components/BackButton.tsx
//
// Drop this at the top of any page. Goes back in browser history when
// there is history to go back to; otherwise falls back to a fixed route
// (default /dashboard) so it never strands the user on a blank tab or
// navigates them out of the app on first load.

import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface BackButtonProps {
  fallback?: string
  label?: string
}

export function BackButton({ fallback = '/dashboard', label = 'Back' }: BackButtonProps) {
  const navigate = useNavigate()

  function handleBack() {
    // react-router's data router stores a position index on history.state;
    // idx > 0 means there's somewhere in *this app's* history to go back to.
    const idx = (window.history.state as { idx?: number } | null)?.idx
    if (typeof idx === 'number' && idx > 0) {
      navigate(-1)
    } else {
      navigate(fallback)
    }
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex items-center gap-1 -ml-1 rounded-lg px-1.5 py-1 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
    >
      <ChevronLeft className="h-4 w-4" />
      {label}
    </button>
  )
}
