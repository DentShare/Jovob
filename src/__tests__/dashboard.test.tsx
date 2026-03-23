import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }: any, ref: any) => {
      const filtered = filterDomProps(props)
      return <div ref={ref} {...filtered}>{children}</div>
    }),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

function filterDomProps(props: Record<string, any>) {
  const filtered: Record<string, any> = {}
  const nonDomProps = [
    'initial', 'animate', 'exit', 'transition', 'whileInView',
    'viewport', 'variants', 'whileHover', 'whileTap', 'layout',
  ]
  for (const [key, value] of Object.entries(props)) {
    if (!nonDomProps.includes(key)) {
      filtered[key] = value
    }
  }
  return filtered
}

// Mock requestAnimationFrame for useCountUp hook
vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
  cb(2000) // simulate elapsed time past duration
  return 0
})

// Mock performance.now
vi.stubGlobal('performance', {
  now: () => 0,
})

// Mock tRPC to avoid needing a tRPC provider
vi.mock('@/lib/trpc', () => ({
  trpc: {
    bot: {
      getMetrics: {
        useQuery: () => ({ data: null, isLoading: false }),
      },
      getByUserId: {
        useQuery: () => ({ data: [], isLoading: false }),
      },
    },
    conversation: {
      list: {
        useQuery: () => ({ data: null, isLoading: false }),
      },
    },
    order: {
      list: {
        useQuery: () => ({ data: null, isLoading: false }),
      },
      updateStatus: {
        useMutation: () => ({ mutate: vi.fn() }),
      },
    },
  },
}))

describe('Dashboard components', () => {
  describe('MetricsCards', () => {
    it('renders 4 metric cards', async () => {
      const MetricsCards = (await import('@/components/dashboard/MetricsCards')).default
      render(<MetricsCards />)

      // Check metric labels
      expect(screen.getByText('Сообщений сегодня')).toBeInTheDocument()
      expect(screen.getByText('Заказов всего')).toBeInTheDocument()
      expect(screen.getByText('Новых клиентов')).toBeInTheDocument()
      expect(screen.getByText('AI ответил')).toBeInTheDocument()

      // Check change descriptions from bellaModaData demo metrics
      expect(screen.getByText(/\+12% от вчера/)).toBeInTheDocument()
      expect(screen.getByText(/\+3 новых/)).toBeInTheDocument()
    })
  })

  describe('RecentDialogs', () => {
    it('renders dialog entries', async () => {
      const RecentDialogs = (await import('@/components/dashboard/RecentDialogs')).default
      render(<RecentDialogs />)

      // Section title
      expect(screen.getByText('Последние диалоги')).toBeInTheDocument()

      // Customer names from bellaModaData demo dialogs
      expect(screen.getByText('Дилноза Рахимова')).toBeInTheDocument()
      expect(screen.getByText('Нодира Усманова')).toBeInTheDocument()
      expect(screen.getByText('Шахло Каримова')).toBeInTheDocument()
      expect(screen.getByText('Алишер Маматов')).toBeInTheDocument()
      expect(screen.getByText('Камола Ибрагимова')).toBeInTheDocument()

      // Link to all dialogs
      expect(screen.getByText(/Все диалоги/)).toBeInTheDocument()
    })
  })

  describe('OrdersTable', () => {
    it('renders orders with status badges', async () => {
      const OrdersTable = (await import('@/components/dashboard/OrdersTable')).default
      render(<OrdersTable />)

      // Order numbers in table
      expect(screen.getByText('1025')).toBeInTheDocument()
      expect(screen.getByText('1024')).toBeInTheDocument()
      expect(screen.getByText('1023')).toBeInTheDocument()

      // Status badges (also appear in filter buttons, so use getAllByText)
      expect(screen.getAllByText('Новый').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Подтвержден').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Готовится').length).toBeGreaterThanOrEqual(1)

      // Filter buttons
      expect(screen.getByText('Все')).toBeInTheDocument()

      // Customer names
      expect(screen.getAllByText('Азиз Каримов').length).toBeGreaterThan(0)
    })
  })
})
