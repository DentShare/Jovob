import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React from 'react'

// Mock tRPC to avoid needing a tRPC provider
vi.mock('@/lib/trpc', () => ({
  trpc: {
    wizard: {
      saveStep: {
        useMutation: () => ({ mutate: vi.fn(), mutateAsync: vi.fn() }),
      },
      complete: {
        useMutation: () => ({ mutate: vi.fn(), mutateAsync: vi.fn() }),
      },
    },
  },
}))

import { WizardProvider, useWizard } from '@/components/wizard/WizardContext'

function wrapper({ children }: { children: React.ReactNode }) {
  return <WizardProvider>{children}</WizardProvider>
}

beforeEach(() => {
  localStorage.clear()
})

describe('WizardContext', () => {
  it('has correct initial state', () => {
    const { result } = renderHook(() => useWizard(), { wrapper })

    expect(result.current.state.currentStep).toBe(1)
    expect(result.current.state.language).toBe('ru')
    expect(result.current.state.botLanguages).toEqual([])
    expect(result.current.state.businessType).toBe('')
    expect(result.current.state.capabilities).toEqual([])
    expect(result.current.state.products).toEqual([])
    expect(result.current.state.faqItems).toEqual([])
    expect(result.current.state.telegramToken).toBe('')
    expect(result.current.state.personality).toBe('friendly')
    expect(result.current.state.botName).toBe('')
    expect(result.current.state.welcomeMessage).toBe('')
    expect(result.current.state.businessInfo).toEqual({
      name: '',
      description: '',
      workingHoursFrom: '09:00',
      workingHoursTo: '18:00',
      workingDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
      address: '',
      managerContact: '',
    })
  })

  it('setStepData updates state properly', () => {
    const { result } = renderHook(() => useWizard(), { wrapper })

    act(() => {
      result.current.setStepData({ botName: 'TestBot', language: 'uz' })
    })

    expect(result.current.state.botName).toBe('TestBot')
    expect(result.current.state.language).toBe('uz')
    // Other fields remain unchanged
    expect(result.current.state.currentStep).toBe(1)
  })

  it('goNext increments step', () => {
    const { result } = renderHook(() => useWizard(), { wrapper })

    expect(result.current.state.currentStep).toBe(1)

    act(() => {
      result.current.goNext()
    })

    expect(result.current.state.currentStep).toBe(2)

    act(() => {
      result.current.goNext()
    })

    expect(result.current.state.currentStep).toBe(3)
  })

  it('goNext does not exceed step 10', () => {
    const { result } = renderHook(() => useWizard(), { wrapper })

    act(() => {
      result.current.setStepData({ currentStep: 10 })
    })

    act(() => {
      result.current.goNext()
    })

    expect(result.current.state.currentStep).toBe(10)
  })

  it('goBack decrements step', () => {
    const { result } = renderHook(() => useWizard(), { wrapper })

    act(() => {
      result.current.setStepData({ currentStep: 5 })
    })

    act(() => {
      result.current.goBack()
    })

    expect(result.current.state.currentStep).toBe(4)
  })

  it('goBack does not go below step 1', () => {
    const { result } = renderHook(() => useWizard(), { wrapper })

    expect(result.current.state.currentStep).toBe(1)

    act(() => {
      result.current.goBack()
    })

    expect(result.current.state.currentStep).toBe(1)
  })

  it('state persists all wizard fields after multiple updates', () => {
    const { result } = renderHook(() => useWizard(), { wrapper })

    act(() => {
      result.current.setStepData({ botName: 'MyBot' })
    })

    act(() => {
      result.current.setStepData({ businessType: 'restaurant' })
    })

    act(() => {
      result.current.setStepData({
        capabilities: ['orders', 'support'],
        personality: 'formal',
      })
    })

    expect(result.current.state.botName).toBe('MyBot')
    expect(result.current.state.businessType).toBe('restaurant')
    expect(result.current.state.capabilities).toEqual(['orders', 'support'])
    expect(result.current.state.personality).toBe('formal')
  })

  it('throws when useWizard is used outside WizardProvider', () => {
    expect(() => {
      renderHook(() => useWizard())
    }).toThrow('useWizard must be used within WizardProvider')
  })
})
