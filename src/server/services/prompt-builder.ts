import type { BotConfig, WorkingHours, DaySchedule } from '@/types'
import type { Product, FAQItem } from '@prisma/client'

// ─── System Prompt Builder ──────────────────────────────────────────────────
// Builds a dynamic system prompt from bot configuration, products, and FAQ.

const DAY_NAMES_RU: Record<string, string> = {
  monday: 'Понедельник',
  tuesday: 'Вторник',
  wednesday: 'Среда',
  thursday: 'Четверг',
  friday: 'Пятница',
  saturday: 'Суббота',
  sunday: 'Воскресенье',
}

/**
 * Builds a comprehensive system prompt for the AI engine from bot data.
 */
export function buildSystemPrompt(bot: BotConfig): string {
  const sections: string[] = []

  // ─── Identity & Role ────────────────────────────────────────────────────
  sections.push(buildIdentitySection(bot))

  // ─── Personality & Tone ─────────────────────────────────────────────────
  sections.push(buildPersonalitySection(bot.personality))

  // ─── Language Instructions ──────────────────────────────────────────────
  sections.push(buildLanguageSection(bot.botLanguages))

  // ─── Business Info ──────────────────────────────────────────────────────
  sections.push(buildBusinessInfoSection(bot))

  // ─── Product Catalog ────────────────────────────────────────────────────
  if (bot.products.length > 0) {
    sections.push(buildProductCatalogSection(bot.products))
  }

  // ─── FAQ ────────────────────────────────────────────────────────────────
  if (bot.faqItems.length > 0) {
    sections.push(buildFAQSection(bot.faqItems))
  }

  // ─── Capabilities & Rules ──────────────────────────────────────────────
  sections.push(buildCapabilitiesSection(bot.capabilities))

  // ─── Order Handling ─────────────────────────────────────────────────────
  if (bot.capabilities.includes('orders')) {
    sections.push(buildOrderInstructionsSection())
  }

  // ─── Handoff Rules ──────────────────────────────────────────────────────
  sections.push(buildHandoffSection(bot.managerContact))

  return sections.filter(Boolean).join('\n\n')
}

// ─── Section Builders ───────────────────────────────────────────────────────

function buildIdentitySection(bot: BotConfig): string {
  return `# Роль
Ты — AI-ассистент бизнеса "${bot.name}".
${bot.description}

Тип бизнеса: ${bot.businessType}.
Ты помогаешь клиентам: отвечаешь на вопросы, рассказываешь о товарах/услугах, помогаешь оформить заказ.
Ты НЕ выдумываешь информацию. Если не знаешь ответа — честно скажи и предложи связаться с менеджером.`
}

function buildPersonalitySection(personality: string): string {
  switch (personality) {
    case 'formal':
      return `# Стиль общения
Стиль: ФОРМАЛЬНЫЙ.
- Обращайся на «Вы».
- Используй вежливые, деловые формулировки.
- Не используй эмодзи и сленг.
- Пример: «Здравствуйте! Чем могу Вам помочь?»`

    case 'fun':
      return `# Стиль общения
Стиль: ВЕСЁЛЫЙ и дружелюбный.
- Обращайся на «ты».
- Активно используй эмодзи 😊🎉👍.
- Будь энергичным и позитивным.
- Можно использовать лёгкий юмор, но без перебора.
- Пример: «Привет! 👋 Рад тебя видеть! Чем помочь? 😊»`

    case 'friendly':
    default:
      return `# Стиль общения
Стиль: ДРУЖЕЛЮБНЫЙ.
- Обращайся на «ты».
- Будь тёплым и приветливым, но без перебора с эмодзи.
- Используй эмодзи умеренно — 1-2 на сообщение максимум.
- Пример: «Привет! Чем могу помочь? 😊»`
  }
}

function buildLanguageSection(languages: string[]): string {
  if (languages.length <= 1) {
    const lang = languages[0] ?? 'ru'
    const langName = lang === 'uz' ? 'узбекском' : lang === 'en' ? 'английском' : 'русском'
    return `# Язык
Всегда отвечай на ${langName} языке.`
  }

  return `# Язык
Бот поддерживает языки: ${languages.join(', ')}.
ВАЖНО: Автоматически определяй язык клиента по его сообщению и отвечай на том же языке.
- Если клиент пишет на узбекском — отвечай на узбекском.
- Если клиент пишет на русском — отвечай на русском.
- Если клиент пишет на английском — отвечай на английском.
- Если не можешь определить — отвечай на русском.
- Если клиент попросит сменить язык — переключись.`
}

function buildBusinessInfoSection(bot: BotConfig): string {
  const lines: string[] = ['# Информация о бизнесе']

  if (bot.address) {
    lines.push(`Адрес: ${bot.address}`)
  }

  if (bot.managerContact) {
    lines.push(`Контакт менеджера: ${bot.managerContact}`)
  }

  if (bot.workingHours) {
    lines.push('')
    lines.push('## Режим работы')
    lines.push(formatWorkingHours(bot.workingHours))
  }

  return lines.join('\n')
}

function formatWorkingHours(hours: WorkingHours): string {
  const lines: string[] = []
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

  for (const day of days) {
    const schedule = hours[day] as DaySchedule | undefined
    const dayName = DAY_NAMES_RU[day] ?? day

    if (!schedule || !schedule.isOpen) {
      lines.push(`${dayName}: Выходной`)
    } else {
      lines.push(`${dayName}: ${schedule.open} — ${schedule.close}`)
    }
  }

  if (hours.timezone) {
    lines.push(`Часовой пояс: ${hours.timezone}`)
  }

  return lines.join('\n')
}

function buildProductCatalogSection(products: Product[]): string {
  const lines: string[] = ['# Каталог товаров/услуг']
  lines.push('Вот доступные позиции (используй для ответов клиентам):')
  lines.push('')

  // Group by category
  const grouped = new Map<string, Product[]>()
  for (const product of products) {
    const cat = product.category ?? 'Без категории'
    if (!grouped.has(cat)) {
      grouped.set(cat, [])
    }
    grouped.get(cat)!.push(product)
  }

  for (const [category, items] of grouped) {
    lines.push(`## ${category}`)
    for (const item of items) {
      const inStock = item.inStock ? '' : ' [Нет в наличии]'
      const price = Number(item.price).toLocaleString('ru-RU')
      const desc = item.description ? ` — ${item.description}` : ''
      const nameUz = item.nameUz ? ` (${item.nameUz})` : ''
      lines.push(`- ${item.name}${nameUz}: ${price} ${item.currency}${desc}${inStock}`)
    }
    lines.push('')
  }

  lines.push('Если товара нет в этом списке — скажи, что его нет в ассортименте.')
  lines.push('Если товар не в наличии — сообщи об этом и предложи альтернативы из каталога.')

  return lines.join('\n')
}

function buildFAQSection(faqItems: FAQItem[]): string {
  const lines: string[] = ['# Часто задаваемые вопросы']
  lines.push('Используй эти ответы при релевантных вопросах:')
  lines.push('')

  for (const item of faqItems) {
    const questionUz = item.questionUz ? ` / ${item.questionUz}` : ''
    const answerUz = item.answerUz ? `\nОтвет (уз): ${item.answerUz}` : ''
    lines.push(`В: ${item.question}${questionUz}`)
    lines.push(`О: ${item.answer}${answerUz}`)
    lines.push('')
  }

  return lines.join('\n')
}

function buildCapabilitiesSection(capabilities: string[]): string {
  const lines: string[] = ['# Возможности и ограничения']

  if (capabilities.includes('orders')) {
    lines.push('- Ты МОЖЕШЬ помогать оформлять заказы.')
  } else {
    lines.push('- Ты НЕ принимаешь заказы. Если клиент хочет заказать — направь к менеджеру.')
  }

  if (capabilities.includes('bookings')) {
    lines.push('- Ты МОЖЕШЬ помогать с записью/бронированием.')
  }

  if (capabilities.includes('support')) {
    lines.push('- Ты МОЖЕШЬ отвечать на вопросы поддержки.')
  }

  lines.push('')
  lines.push('Общие правила:')
  lines.push('- НЕ выдумывай цены, которых нет в каталоге.')
  lines.push('- НЕ обещай то, что бизнес не предоставляет.')
  lines.push('- НЕ обсуждай темы, не связанные с бизнесом.')
  lines.push('- Если не уверен в ответе — предложи связаться с менеджером.')

  return lines.join('\n')
}

function buildOrderInstructionsSection(): string {
  return `# Инструкции по заказам
Когда клиент хочет заказать:
1. Уточни, что именно он хочет (название, количество).
2. Если товар есть в каталоге — подтверди цену.
3. Спроси имя для заказа (если ещё не знаешь).
4. Спроси номер телефона (если ещё не знаешь).
5. Если нужна доставка — спроси адрес.
6. Подтверди заказ: перечисли позиции, количество, итоговую сумму.
7. Если клиент подтвердил — скажи «Заказ оформлен!» (именно эту фразу).

При упоминании заказа в ответе ОБЯЗАТЕЛЬНО включи JSON-блок с данными заказа в формате:
\`\`\`order
{"items": [{"name": "...", "quantity": N, "price": N}], "total": N}
\`\`\``
}

function buildHandoffSection(managerContact: string | null): string {
  const contact = managerContact
    ? `Контакт менеджера для клиента: ${managerContact}`
    : 'Предложи клиенту подождать — менеджер скоро подключится.'

  return `# Переключение на менеджера
Переключай на менеджера, если:
- Клиент прямо просит поговорить с человеком.
- Ты не знаешь ответа после 2 попыток.
- Вопрос касается жалобы или конфликтной ситуации.
- Вопрос касается оплаты, возврата денег или юридических вопросов.

${contact}
Когда переключаешь — скажи «Сейчас подключу менеджера» (именно эту фразу).`
}
