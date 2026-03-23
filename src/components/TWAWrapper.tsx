'use client'
import { useEffect } from 'react'
import { useTWA } from '@/lib/telegram-webapp'

export function TWAWrapper({ children }: { children: React.ReactNode }) {
  const { isTWA, twa } = useTWA()

  useEffect(() => {
    if (isTWA && twa) {
      twa.ready()
      twa.expand()
      // Apply safe area padding
      document.documentElement.style.setProperty(
        '--twa-top',
        `${twa.viewportHeight > twa.viewportStableHeight ? 'env(safe-area-inset-top)' : '0px'}`
      )
    }
  }, [isTWA, twa])

  return <>{children}</>
}
