'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { trpc, getTRPCClientConfig } from '@/lib/trpc'
import { SessionProvider } from 'next-auth/react'

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 5000, retry: 1 } },
      })
  )
  const [trpcClient] = useState(() => trpc.createClient(getTRPCClientConfig()))

  return (
    <SessionProvider>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </trpc.Provider>
    </SessionProvider>
  )
}
