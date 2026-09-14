import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useState } from 'react'
import { AuthProvider } from '@/hooks/useAuth'
import { WalletProvider } from '@/lib/wallet-store'

/**
 * Wraps the app with:
 * - TanStack Query (caches Firestore reads + callable-function results)
 * - AuthProvider (subscribes to Firebase Auth state, exposes user/role via useAuth())
 * - WalletProvider (client-only balance/transactions/notifications state, see src/lib/wallet-store.tsx)
 *
 * Order matters: AuthProvider must be inside QueryClientProvider so auth-dependent
 * queries can be invalidated on login/logout. WalletProvider doesn't depend on
 * auth state, so its position relative to AuthProvider doesn't matter.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WalletProvider>{children}</WalletProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
