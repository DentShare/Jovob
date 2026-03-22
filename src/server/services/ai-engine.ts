import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'
import { buildSystemPrompt } from './prompt-builder'
import type {
  BotConfig,
  ProcessedMessage,
  ConversationContext,
  MessageIntent,
  ExtractedData,
  OrderItem,
  KnowledgeSearchResult,
} from '@/types'
import type { Bot, Product, FAQItem } from '@prisma/client'

// ─── OpenAI Client ──────────────────────────────────────────────────────────

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
  })
}

const MODEL = 'gpt-4o-mini'
const MAX_CONTEXT_MESSAGES = 10
const CONFIDENCE_THRESHOLD = 0.6
const MAX_TOKENS = 1024

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Process an incoming message through the AI engine.
 * 1. Load bot config with products & FAQ
 * 2. Get or create conversation
 * 3. Fetch conversation context (last N messages)
 * 4. Find relevant knowledge chunks (keyword search)
 * 5. Build messages array & call OpenAI
 * 6. Analyze response for confidence, intent, extracted data
 * 7. Save user message and AI response
 * 8. Return processed result
 */
export async function processMessage(
  botId: string,
  platformChatId: string,
  platform: string,
  userMessage: string,
  customerName?: string | null,
  customerLanguage?: string | null
): Promise<ProcessedMessage> {
  try {
    // 1. Load bot with relations
    const bot = await loadBotConfig(botId)
    if (!bot) {
      return createErrorResponse('Бот не найден или неактивен.')
    }

    // 2. Get or create conversation
    const conversation = await getOrCreateConversation(
      botId,
      platformChatId,
      platform,
      customerName ?? null,
      customerLanguage ?? null
    )

    // 3. Fetch conversation context
    const context = await getConversationContext(conversation.id)

    // 4. Search knowledge base for relevant chunks
    const knowledgeChunks = await searchKnowledge(botId, userMessage)

    // 5. Build system prompt
    const systemPrompt = buildSystemPrompt(bot)

    // 6. Build messages array for OpenAI
    const messages = buildOpenAIMessages(
      systemPrompt,
      context,
      knowledgeChunks,
      userMessage
    )

    // 7. Call OpenAI
    const completion = await getOpenAI().chat.completions.create({
      model: MODEL,
      messages,
      max_tokens: MAX_TOKENS,
      temperature: 0.7,
    })

    const responseText =
      completion.choices[0]?.message?.content?.trim() ?? 'Извините, я не смог обработать ваш запрос.'

    // 8. Analyze response
    const confidence = estimateConfidence(responseText, userMessage, bot)
    const intent = detectIntent(userMessage, responseText)
    const extractedData = extractOrderData(responseText, userMessage, bot.products)
    const suggestHandoff =
      confidence < CONFIDENCE_THRESHOLD ||
      responseText.includes('Сейчас подключу менеджера')
    const language = detectLanguage(userMessage)

    // 9. Save messages to DB
    await saveMessages(conversation.id, platform, userMessage, responseText, confidence, suggestHandoff)

    // 10. Update conversation language if detected
    if (language && language !== conversation.language) {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { language },
      })
    }

    return {
      response: responseText,
      confidence,
      intent,
      extractedData,
      suggestHandoff,
      language,
    }
  } catch (error) {
    console.error('[AI Engine] Error processing message:', error)

    // Return graceful fallback
    return createErrorResponse(
      'Произошла ошибка при обработке сообщения. Пожалуйста, попробуйте ещё раз или свяжитесь с менеджером.'
    )
  }
}

// ─── Bot Config Loader ──────────────────────────────────────────────────────

async function loadBotConfig(botId: string): Promise<BotConfig | null> {
  const bot = await prisma.bot.findUnique({
    where: { id: botId, isActive: true },
    include: {
      products: {
        where: { inStock: true },
        orderBy: { sortOrder: 'asc' },
      },
      faqItems: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  if (!bot || !bot.telegramToken) return null

  return {
    id: bot.id,
    name: bot.name,
    description: bot.description,
    businessType: bot.businessType,
    botLanguages: bot.botLanguages,
    personality: bot.personality as BotConfig['personality'],
    welcomeMessage: bot.welcomeMessage,
    workingHours: bot.workingHours as BotConfig['workingHours'],
    address: bot.address,
    managerContact: bot.managerContact,
    telegramToken: bot.telegramToken,
    telegramBotName: bot.telegramBotName,
    isActive: bot.isActive,
    capabilities: bot.capabilities,
    products: bot.products,
    faqItems: bot.faqItems,
  }
}

// ─── Conversation Management ────────────────────────────────────────────────

async function getOrCreateConversation(
  botId: string,
  platformChatId: string,
  platform: string,
  customerName: string | null,
  language: string | null
) {
  // Try to find existing active conversation
  let conversation = await prisma.conversation.findFirst({
    where: {
      botId,
      platformChatId,
      platform,
      isResolved: false,
    },
    orderBy: { updatedAt: 'desc' },
  })

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        botId,
        platformChatId,
        platform,
        customerName,
        language,
      },
    })
  } else if (customerName && !conversation.customerName) {
    conversation = await prisma.conversation.update({
      where: { id: conversation.id },
      data: { customerName },
    })
  }

  return conversation
}

async function getConversationContext(
  conversationId: string
): Promise<ConversationContext> {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: MAX_CONTEXT_MESSAGES,
        select: {
          role: true,
          content: true,
          createdAt: true,
        },
      },
    },
  })

  return {
    conversationId,
    messages: (conversation?.messages ?? []).reverse(),
    customerName: conversation?.customerName ?? null,
    customerPhone: conversation?.customerPhone ?? null,
    language: conversation?.language ?? null,
  }
}

// ─── Knowledge Search (keyword-based) ───────────────────────────────────────

async function searchKnowledge(
  botId: string,
  query: string
): Promise<KnowledgeSearchResult[]> {
  try {
    // Simple keyword-based search for now
    // In production, replace with vector/semantic search
    const keywords = extractKeywords(query)

    if (keywords.length === 0) return []

    const chunks = await prisma.knowledgeChunk.findMany({
      where: {
        doc: { botId },
        OR: keywords.map((kw) => ({
          content: { contains: kw, mode: 'insensitive' as const },
        })),
      },
      include: {
        doc: { select: { title: true } },
      },
      take: 3,
    })

    return chunks.map((chunk: { content: string; doc: { title: string } }) => ({
      content: chunk.content,
      score: calculateKeywordScore(chunk.content, keywords),
      docTitle: chunk.doc.title,
    }))
  } catch (error) {
    console.error('[AI Engine] Knowledge search error:', error)
    return []
  }
}

function extractKeywords(text: string): string[] {
  // Remove common stop words and extract meaningful keywords
  const stopWords = new Set([
    'а', 'в', 'и', 'к', 'о', 'с', 'у', 'я', 'на', 'не', 'по', 'за', 'от',
    'из', 'то', 'до', 'ли', 'бы', 'же', 'ни', 'что', 'это', 'как', 'для',
    'вы', 'мы', 'он', 'мне', 'вам', 'нам', 'есть', 'или', 'the', 'is', 'a',
    'an', 'at', 'to', 'in', 'of', 'it', 'and', 'or', 'but', 'va', 'bu',
    'men', 'siz', 'u', 'bilan',
  ])

  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word))
    .slice(0, 5)
}

function calculateKeywordScore(content: string, keywords: string[]): number {
  const lower = content.toLowerCase()
  let matches = 0
  for (const kw of keywords) {
    if (lower.includes(kw)) matches++
  }
  return keywords.length > 0 ? matches / keywords.length : 0
}

// ─── OpenAI Message Building ────────────────────────────────────────────────

function buildOpenAIMessages(
  systemPrompt: string,
  context: ConversationContext,
  knowledgeChunks: KnowledgeSearchResult[],
  userMessage: string
): OpenAI.ChatCompletionMessageParam[] {
  const messages: OpenAI.ChatCompletionMessageParam[] = []

  // System prompt
  let fullSystemPrompt = systemPrompt

  // Add knowledge context if available
  if (knowledgeChunks.length > 0) {
    fullSystemPrompt += '\n\n# Дополнительный контекст из базы знаний\n'
    for (const chunk of knowledgeChunks) {
      fullSystemPrompt += `\n[${chunk.docTitle}]:\n${chunk.content}\n`
    }
  }

  // Add customer info if known
  if (context.customerName) {
    fullSystemPrompt += `\n\nИмя клиента: ${context.customerName}`
  }
  if (context.customerPhone) {
    fullSystemPrompt += `\nТелефон клиента: ${context.customerPhone}`
  }

  messages.push({ role: 'system', content: fullSystemPrompt })

  // Add conversation history
  for (const msg of context.messages) {
    messages.push({
      role: msg.role === 'USER' ? 'user' : msg.role === 'ASSISTANT' ? 'assistant' : 'system',
      content: msg.content,
    })
  }

  // Add current user message
  messages.push({ role: 'user', content: userMessage })

  return messages
}

// ─── Response Analysis ──────────────────────────────────────────────────────

function estimateConfidence(
  response: string,
  userMessage: string,
  bot: BotConfig
): number {
  let confidence = 0.85 // Base confidence

  // Lower confidence if response contains uncertainty markers
  const uncertaintyMarkers = [
    'не уверен', 'не знаю', 'не могу сказать', 'затрудняюсь',
    'уточните', 'свяжитесь с менеджером', 'подключу менеджера',
    'bilmayman', 'aniq emas', "ayta olmayman",
  ]

  for (const marker of uncertaintyMarkers) {
    if (response.toLowerCase().includes(marker)) {
      confidence -= 0.2
      break
    }
  }

  // Higher confidence if response references known FAQ or products
  const hasProductMention = bot.products.some(
    (p) =>
      response.toLowerCase().includes(p.name.toLowerCase()) ||
      (p.nameUz && response.toLowerCase().includes(p.nameUz.toLowerCase()))
  )
  if (hasProductMention) {
    confidence += 0.1
  }

  const hasFAQMatch = bot.faqItems.some(
    (faq) =>
      userMessage.toLowerCase().includes(faq.question.toLowerCase().slice(0, 20)) ||
      (faq.questionUz &&
        userMessage.toLowerCase().includes(faq.questionUz.toLowerCase().slice(0, 20)))
  )
  if (hasFAQMatch) {
    confidence += 0.1
  }

  return Math.max(0, Math.min(1, confidence))
}

function detectIntent(userMessage: string, response: string): MessageIntent {
  const lower = userMessage.toLowerCase()

  // Greeting
  if (/^(привет|салом|здравствуйте|hi|hello|salom|хай|ассалому)/i.test(lower)) {
    return 'greeting'
  }

  // Farewell
  if (/^(пока|до свидания|хайр|bye|goodbye|рахмат|спасибо за|sag bol)/i.test(lower)) {
    return 'farewell'
  }

  // Order intent
  if (
    /заказ|заказать|хочу купить|оформи|buyurtma|sotib olmoqchi|закажу|беру|олам/i.test(lower)
  ) {
    return 'order_intent'
  }

  // Price question
  if (/цен[аы]|стои[тм]|нарх|qancha|прайс|price|сколько стоит/i.test(lower)) {
    return 'price_question'
  }

  // Working hours
  if (/работа|график|время|soat|vaqt|режим|когда открыт|ish vaqt/i.test(lower)) {
    return 'working_hours'
  }

  // Location
  if (/адрес|где находи|локаци|manzil|qayer|карта|маршрут|location/i.test(lower)) {
    return 'location_question'
  }

  // Complaint
  if (/жалоб|претензи|плохо|ужасно|отврати|shikoyat|yomon|недовол/i.test(lower)) {
    return 'complaint'
  }

  // Booking
  if (/запис|бронир|забронировать|booking|yozil|band qil/i.test(lower)) {
    return 'booking_request'
  }

  // Handoff
  if (/менеджер|оператор|человек|manager|menejer|operator|живой/i.test(lower)) {
    return 'handoff_request'
  }

  // Product inquiry
  if (/товар|продукт|ассортимент|каталог|mahsulot|katalog|есть ли|bormi/i.test(lower)) {
    return 'product_inquiry'
  }

  // Check response for handoff
  if (response.includes('Сейчас подключу менеджера')) {
    return 'handoff_request'
  }

  return 'general_question'
}

function extractOrderData(
  response: string,
  userMessage: string,
  products: Product[]
): ExtractedData | null {
  // Try to parse order JSON block from AI response
  const orderMatch = response.match(/```order\s*\n?([\s\S]*?)```/)
  if (orderMatch) {
    try {
      const orderData = JSON.parse(orderMatch[1])
      return {
        orderItems: (orderData.items ?? []).map(
          (item: { name?: string; quantity?: number; price?: number }) => ({
            productName: item.name ?? '',
            quantity: item.quantity ?? 1,
            price: item.price,
            productId: findProductId(item.name ?? '', products),
          })
        ),
      }
    } catch {
      // JSON parse failed, try heuristic extraction
    }
  }

  // Heuristic: check if user message mentions products with quantities
  const mentionedProducts = findMentionedProducts(userMessage, products)
  if (mentionedProducts.length > 0) {
    return { orderItems: mentionedProducts }
  }

  // Extract phone number if present
  const phoneMatch = userMessage.match(
    /\+?998[\s-]?(\d{2})[\s-]?(\d{3})[\s-]?(\d{2})[\s-]?(\d{2})/
  )
  if (phoneMatch) {
    return { customerPhone: phoneMatch[0].replace(/[\s-]/g, '') }
  }

  return null
}

function findProductId(name: string, products: Product[]): string | undefined {
  const lower = name.toLowerCase()
  const match = products.find(
    (p) =>
      p.name.toLowerCase() === lower ||
      p.name.toLowerCase().includes(lower) ||
      lower.includes(p.name.toLowerCase()) ||
      (p.nameUz && (p.nameUz.toLowerCase() === lower || p.nameUz.toLowerCase().includes(lower)))
  )
  return match?.id
}

function findMentionedProducts(
  message: string,
  products: Product[]
): OrderItem[] {
  const lower = message.toLowerCase()
  const items: OrderItem[] = []

  for (const product of products) {
    const nameMatch =
      lower.includes(product.name.toLowerCase()) ||
      (product.nameUz && lower.includes(product.nameUz.toLowerCase()))

    if (nameMatch) {
      // Try to extract quantity near the product name
      const quantityMatch = message.match(
        new RegExp(`(\\d+)\\s*(?:шт|штук|dona|ta)?\\s*${escapeRegex(product.name)}`, 'i')
      ) ||
        message.match(
          new RegExp(`${escapeRegex(product.name)}\\s*(\\d+)\\s*(?:шт|штук|dona|ta)?`, 'i')
        )

      items.push({
        productId: product.id,
        productName: product.name,
        quantity: quantityMatch ? parseInt(quantityMatch[1], 10) : 1,
        price: Number(product.price),
      })
    }
  }

  return items
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ─── Language Detection ─────────────────────────────────────────────────────

function detectLanguage(text: string): string {
  // Simple heuristic based on character sets and common words
  const cyrillicCount = (text.match(/[\u0400-\u04FF]/g) ?? []).length
  const latinCount = (text.match(/[a-zA-Z]/g) ?? []).length
  const apostropheWords = (text.match(/[oO]'|[gG]'|[sS]h|[cC]h/g) ?? []).length // Uzbek Latin markers

  // Uzbek Latin detection
  if (apostropheWords > 0 && latinCount > cyrillicCount) {
    return 'uz'
  }

  // Uzbek Cyrillic common words
  const uzCyrillicMarkers = /\b(менга|сизга|қандай|нарх|бор|йўқ|учун|билан|керак|ҳа|маҳсулот)\b/i
  if (uzCyrillicMarkers.test(text)) {
    return 'uz'
  }

  // English detection
  if (latinCount > cyrillicCount * 2 && apostropheWords === 0) {
    return 'en'
  }

  // Default to Russian
  return 'ru'
}

// ─── Message Persistence ────────────────────────────────────────────────────

async function saveMessages(
  conversationId: string,
  platform: string,
  userMessage: string,
  aiResponse: string,
  confidence: number,
  handedOff: boolean
): Promise<void> {
  await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId,
        role: 'USER',
        content: userMessage,
        platform,
      },
    }),
    prisma.message.create({
      data: {
        conversationId,
        role: 'ASSISTANT',
        content: aiResponse,
        platform,
        confidence,
        handedOff,
      },
    }),
  ])

  // Touch conversation updatedAt
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  })
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function createErrorResponse(message: string): ProcessedMessage {
  return {
    response: message,
    confidence: 0,
    intent: 'unknown',
    extractedData: null,
    suggestHandoff: true,
    language: 'ru',
  }
}
