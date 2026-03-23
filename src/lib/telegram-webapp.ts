// Telegram Mini App (TWA) SDK utilities

export interface TelegramWebApp {
  ready(): void
  close(): void
  expand(): void
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    show(): void
    hide(): void
    onClick(callback: () => void): void
  }
  BackButton: {
    isVisible: boolean
    show(): void
    hide(): void
    onClick(callback: () => void): void
  }
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy'): void
    notificationOccurred(type: 'error' | 'success' | 'warning'): void
  }
  initData: string
  initDataUnsafe: {
    user?: { id: number; first_name: string; last_name?: string; username?: string; language_code?: string }
    auth_date: number
    hash: string
  }
  themeParams: Record<string, string>
  colorScheme: 'light' | 'dark'
  viewportHeight: number
  viewportStableHeight: number
  isExpanded: boolean
  platform: string
}

declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp }
  }
}

export function isTWA(): boolean {
  return typeof window !== 'undefined' && !!window.Telegram?.WebApp?.initData
}

export function getTWA(): TelegramWebApp | null {
  if (typeof window === 'undefined') return null
  return window.Telegram?.WebApp ?? null
}

export function useTWA() {
  const twa = getTWA()
  return {
    isTWA: !!twa?.initData,
    twa,
    ready: () => twa?.ready(),
    expand: () => twa?.expand(),
    close: () => twa?.close(),
    haptic: twa?.HapticFeedback,
    user: twa?.initDataUnsafe?.user,
    theme: twa?.themeParams,
    colorScheme: twa?.colorScheme,
  }
}
