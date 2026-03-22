// ─── Shared TypeScript types for BotUz v2 ──────────────────────────────────

import type { Bot, Product, FAQItem, Conversation, Message } from '@prisma/client'

// ─── Wizard ─────────────────────────────────────────────────────────────────

export interface WizardState {
  step: number
  name?: string
  description?: string
  businessType?: string
  botLanguages?: string[]
  personality?: 'formal' | 'friendly' | 'fun'
  welcomeMessage?: string
  workingHours?: WorkingHours
  address?: string
  managerContact?: string
  telegramToken?: string
  capabilities?: string[]
  scenario?: Record<string, unknown>
  products?: ProductDraft[]
  faqItems?: FAQDraft[]
}

export interface WorkingHours {
  monday?: DaySchedule
  tuesday?: DaySchedule
  wednesday?: DaySchedule
  thursday?: DaySchedule
  friday?: DaySchedule
  saturday?: DaySchedule
  sunday?: DaySchedule
  timezone?: string
}

export interface DaySchedule {
  open: string   // "09:00"
  close: string  // "18:00"
  isOpen: boolean
}

export interface ProductDraft {
  name: string
  nameUz?: string
  description?: string
  price: number
  currency?: string
  category?: string
  imageUrl?: string
}

export interface FAQDraft {
  question: string
  questionUz?: string
  answer: string
  answerUz?: string
}

// ─── Bot Config (enriched Bot for runtime use) ─────────────────────────────

export interface BotConfig {
  id: string
  name: string
  description: string
  businessType: string
  botLanguages: string[]
  personality: 'formal' | 'friendly' | 'fun'
  welcomeMessage: string
  workingHours: WorkingHours | null
  address: string | null
  managerContact: string | null
  telegramToken: string
  telegramBotName: string | null
  isActive: boolean
  capabilities: string[]
  products: Product[]
  faqItems: FAQItem[]
}

// ─── AI Engine ──────────────────────────────────────────────────────────────

export type MessageIntent =
  | 'general_question'
  | 'product_inquiry'
  | 'order_intent'
  | 'complaint'
  | 'booking_request'
  | 'price_question'
  | 'working_hours'
  | 'location_question'
  | 'greeting'
  | 'farewell'
  | 'handoff_request'
  | 'unknown'

export interface ProcessedMessage {
  response: string
  confidence: number
  intent: MessageIntent
  extractedData: ExtractedData | null
  suggestHandoff: boolean
  language: string
}

export interface ExtractedData {
  orderItems?: OrderItem[]
  customerName?: string
  customerPhone?: string
  deliveryAddress?: string
  bookingDate?: string
  bookingTime?: string
  serviceId?: string
  notes?: string
}

export interface OrderItem {
  productId?: string
  productName: string
  quantity: number
  price?: number
}

export interface ConversationContext {
  conversationId: string
  messages: Pick<Message, 'role' | 'content' | 'createdAt'>[]
  customerName: string | null
  customerPhone: string | null
  language: string | null
}

// ─── Telegram ───────────────────────────────────────────────────────────────

export interface TelegramWebhookPayload {
  update_id: number
  message?: TelegramMessage
  callback_query?: TelegramCallbackQuery
}

export interface TelegramMessage {
  message_id: number
  from?: TelegramUser
  chat: TelegramChat
  date: number
  text?: string
  photo?: TelegramPhotoSize[]
  contact?: TelegramContact
}

export interface TelegramUser {
  id: number
  is_bot: boolean
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
}

export interface TelegramChat {
  id: number
  type: 'private' | 'group' | 'supergroup' | 'channel'
  first_name?: string
  last_name?: string
  username?: string
}

export interface TelegramPhotoSize {
  file_id: string
  file_unique_id: string
  width: number
  height: number
  file_size?: number
}

export interface TelegramContact {
  phone_number: string
  first_name: string
  last_name?: string
  user_id?: number
}

export interface TelegramCallbackQuery {
  id: string
  from: TelegramUser
  message?: TelegramMessage
  data?: string
}

// ─── FAQ Templates ──────────────────────────────────────────────────────────

export interface FAQTemplate {
  question: string
  questionUz?: string
  answer: string
  answerUz?: string
}

export type BusinessType =
  | 'clothing_store'
  | 'restaurant'
  | 'beauty_salon'
  | 'education'
  | 'pharmacy'
  | 'electronics'
  | 'grocery'
  | 'auto_parts'
  | 'real_estate'
  | 'other'

// ─── Knowledge Search ───────────────────────────────────────────────────────

export interface KnowledgeSearchResult {
  content: string
  score: number
  docTitle: string
}
