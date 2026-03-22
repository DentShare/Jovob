import { describe, it, expect } from 'vitest'
import { faqTemplates, getFAQTemplates, getAvailableBusinessTypes } from '@/server/services/faq-templates'

describe('FAQ Templates', () => {
  it('each business type has templates', () => {
    const types = getAvailableBusinessTypes()
    expect(types.length).toBeGreaterThan(0)

    for (const type of types) {
      const templates = faqTemplates[type]
      expect(templates).toBeDefined()
      expect(templates!.length).toBeGreaterThan(0)
    }
  })

  it('templates have required fields (question, answer)', () => {
    const types = getAvailableBusinessTypes()

    for (const type of types) {
      const templates = faqTemplates[type]!
      for (const tpl of templates) {
        expect(tpl.question).toBeTruthy()
        expect(typeof tpl.question).toBe('string')
        expect(tpl.answer).toBeTruthy()
        expect(typeof tpl.answer).toBe('string')
      }
    }
  })

  it('clothing_store has at least 5 FAQ items', () => {
    const templates = getFAQTemplates('clothing_store')
    expect(templates.length).toBeGreaterThanOrEqual(5)
  })

  it('restaurant has at least 5 FAQ items', () => {
    const templates = getFAQTemplates('restaurant')
    expect(templates.length).toBeGreaterThanOrEqual(5)
  })

  it('getFAQTemplates falls back to "other" for unknown type', () => {
    const templates = getFAQTemplates('nonexistent_type')
    const otherTemplates = getFAQTemplates('other')
    expect(templates).toEqual(otherTemplates)
  })

  it('getAvailableBusinessTypes returns all defined types', () => {
    const types = getAvailableBusinessTypes()
    expect(types).toContain('clothing_store')
    expect(types).toContain('restaurant')
    expect(types).toContain('beauty_salon')
    expect(types).toContain('education')
    expect(types).toContain('pharmacy')
    expect(types).toContain('electronics')
    expect(types).toContain('grocery')
    expect(types).toContain('auto_parts')
    expect(types).toContain('real_estate')
    expect(types).toContain('other')
  })
})
