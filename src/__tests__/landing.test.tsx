import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <div ref={ref} {...filterDomProps(props)}>{children}</div>
    )),
    h1: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <h1 ref={ref} {...filterDomProps(props)}>{children}</h1>
    )),
    p: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <p ref={ref} {...filterDomProps(props)}>{children}</p>
    )),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Filter out non-DOM props from framer-motion
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

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

describe('Landing page components', () => {
  describe('Hero', () => {
    it('renders title and CTA button', async () => {
      const Hero = (await import('@/components/landing/Hero')).default
      render(<Hero />)

      // Default language is RU, check for Russian title content
      expect(
        screen.getByText(/Создайте AI-помощника/i)
      ).toBeInTheDocument()

      // CTA button
      expect(
        screen.getByText('Создать бота бесплатно')
      ).toBeInTheDocument()
    })
  })

  describe('HowItWorks', () => {
    it('renders 3 steps', async () => {
      const HowItWorks = (await import('@/components/landing/HowItWorks')).default
      render(<HowItWorks />)

      expect(screen.getByText('Ответьте на вопросы о вашем бизнесе')).toBeInTheDocument()
      expect(screen.getByText('Подключите мессенджеры')).toBeInTheDocument()
      expect(screen.getByText('Бот начинает работать')).toBeInTheDocument()

      // Step numbers
      expect(screen.getByText('01')).toBeInTheDocument()
      expect(screen.getByText('02')).toBeInTheDocument()
      expect(screen.getByText('03')).toBeInTheDocument()
    })
  })

  describe('Niches', () => {
    it('renders business type cards', async () => {
      const Niches = (await import('@/components/landing/Niches')).default
      render(<Niches />)

      expect(screen.getByText('Магазин одежды')).toBeInTheDocument()
      expect(screen.getByText('Еда и доставка')).toBeInTheDocument()
      expect(screen.getByText('Красота и здоровье')).toBeInTheDocument()
      expect(screen.getByText('Электроника')).toBeInTheDocument()
      expect(screen.getByText('Образование')).toBeInTheDocument()
      expect(screen.getByText('Услуги для дома')).toBeInTheDocument()
      expect(screen.getByText('Авто')).toBeInTheDocument()
      expect(screen.getByText('Аптека')).toBeInTheDocument()
    })
  })
})
