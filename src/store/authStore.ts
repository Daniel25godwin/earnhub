import { create } from 'zustand'
import type { AppRole } from '@/hooks/useAuth'

interface StoreUser {
  uid: string
  email: string | null
  role: AppRole
}

interface AuthStoreState {
  user: StoreUser | null
  setUser: (user: StoreUser | null) => void
}

/**
 * Mirrors the AuthProvider's user state in a plain store so non-component code
 * (e.g. Firestore query helpers, analytics) can read the current
 * user synchronously without needing a hook. The AuthProvider is the source of
 * truth; this store is just a convenient read-only mirror kept in sync via setUser().
 */
export const useAuthStore = create<AuthStoreState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))
