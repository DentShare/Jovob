import { describe, it, expect } from 'vitest'
import type { WizardState, BusinessType, BotConfig, FAQTemplate, ProductDraft, FAQDraft, WorkingHours, DaySchedule } from '@/types'

describe('Type definitions', () => {
  it('WizardState has all required fields', () => {
    const state: WizardState = {
      step: 1,
    }

    // Required field
    expect(state.step).toBe(1)

    // Optional fields should be assignable
    const fullState: WizardState = {
      step: 3,
      name: 'My Bot',
      description: 'A test bot',
      businessType: 'restaurant',
      botLanguages: ['ru', 'uz'],
      personality: 'friendly',
      welcomeMessage: 'Hello!',
      workingHours: {
        monday: { open: '09:00', close: '18:00', isOpen: true },
        timezone: 'Asia/Tashkent',
      },
      address: '123 Main St',
      managerContact: '+998901234567',
      telegramToken: 'fake-token',
      capabilities: ['orders', 'support'],
      scenario: { custom: true },
      products: [{ name: 'Product 1', price: 10000 }],
      faqItems: [{ question: 'Q?', answer: 'A' }],
    }

    expect(fullState.step).toBe(3)
    expect(fullState.name).toBe('My Bot')
    expect(fullState.businessType).toBe('restaurant')
    expect(fullState.botLanguages).toEqual(['ru', 'uz'])
    expect(fullState.personality).toBe('friendly')
    expect(fullState.capabilities).toEqual(['orders', 'support'])
    expect(fullState.products).toHaveLength(1)
    expect(fullState.faqItems).toHaveLength(1)
  })

  it('BusinessType accepts valid strings', () => {
    const validTypes: BusinessType[] = [
      'clothing_store',
      'restaurant',
      'beauty_salon',
      'education',
      'pharmacy',
      'electronics',
      'grocery',
      'auto_parts',
      'real_estate',
      'other',
    ]

    expect(validTypes).toHaveLength(10)
    validTypes.forEach((type) => {
      expect(typeof type).toBe('string')
    })
  })

  it('FAQTemplate has required fields', () => {
    const template: FAQTemplate = {
      question: 'How to order?',
      answer: 'Just write us',
    }
    expect(template.question).toBeTruthy()
    expect(template.answer).toBeTruthy()

    // Optional Uzbek fields
    const templateWithUz: FAQTemplate = {
      question: 'How to order?',
      questionUz: 'Qanday buyurtma beraman?',
      answer: 'Just write us',
      answerUz: 'Bizga yozing',
    }
    expect(templateWithUz.questionUz).toBeTruthy()
    expect(templateWithUz.answerUz).toBeTruthy()
  })

  it('ProductDraft has required and optional fields', () => {
    const minimal: ProductDraft = {
      name: 'Test Product',
      price: 50000,
    }
    expect(minimal.name).toBe('Test Product')
    expect(minimal.price).toBe(50000)

    const full: ProductDraft = {
      name: 'Test Product',
      nameUz: 'Test Mahsulot',
      description: 'A great product',
      price: 50000,
      currency: 'UZS',
      category: 'Main',
      imageUrl: 'https://example.com/img.jpg',
    }
    expect(full.nameUz).toBe('Test Mahsulot')
    expect(full.currency).toBe('UZS')
  })

  it('DaySchedule and WorkingHours structures are correct', () => {
    const schedule: DaySchedule = {
      open: '09:00',
      close: '18:00',
      isOpen: true,
    }
    expect(schedule.open).toBe('09:00')
    expect(schedule.isOpen).toBe(true)

    const hours: WorkingHours = {
      monday: schedule,
      saturday: { open: '10:00', close: '15:00', isOpen: true },
      sunday: { open: '', close: '', isOpen: false },
      timezone: 'Asia/Tashkent',
    }
    expect(hours.monday?.open).toBe('09:00')
    expect(hours.timezone).toBe('Asia/Tashkent')
  })
})
