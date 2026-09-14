import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuthStore } from '@/store/authStore'

export type AppRole = 'user' | 'moderator' | 'admin'

interface AuthContextValue {
  firebaseUser: FirebaseUser | null
  role: AppRole | null
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [role, setRole] = useState<AppRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const setStoreUser = useAuthStore((s) => s.setUser)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user)

      if (user) {
        // Custom claims (role) are attached to the ID token by a privileged Cloud Function
        // (admin-setUserRole). Force-refresh so role changes take effect without re-login.
        const tokenResult = await user.getIdTokenResult()
        const claimRole = (tokenResult.claims.role as AppRole | undefined) ?? 'user'
        setRole(claimRole)
        setStoreUser({ uid: user.uid, email: user.email, role: claimRole })
      } else {
        setRole(null)
        setStoreUser(null)
      }

      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [setStoreUser])

  const value: AuthContextValue = {
    firebaseUser,
    role,
    isLoading,
    isAuthenticated: !!firebaseUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
