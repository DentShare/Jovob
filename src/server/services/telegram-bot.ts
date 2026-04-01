import { Bot, webhookCallback, Context } from 'grammy'
import crypto from 'crypto'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { processMessage } from './ai-engine'
import { logger } from '@/lib/logger'

// ─── Bot Instance Cache ─────────────────────────────────────────────────────
// Cache bot instances to avoid re-creating them on every webhook call.

const botInstances = new Map<string, Bot>()

/**
 * Create a grammY Bot instance for a given Telegram token.
 * Instances are cached by botId.
 */
export function createBotInstance(token: string, botId?: string): Bot {
  const cacheKey = botId ?? token

  const existing = botInstances.get(cacheKey)
  if (existing) return existing

  const bot = new Bot(token)
  botInstances.set(cacheKey, bot)

  return bot
}

/**
 * Remove a cached bot instance.
 */
export function removeBotInstance(botId: string): void {
  botInstances.delete(botId)
}

/**
 * Set up all message handlers for a bot instance.
 */
export function setupHandlers(bot: Bot, botId: string): void {
  // ─── /start Command ───────────────────────────────────────────────────
  bot.command('start', async (ctx) => {
    try {
      const botData = await prisma.bot.findUnique({
        where: { id: botId },
        select: { welcomeMessage: true, name: true },
      })

      const welcomeMessage =
        botData?.welcomeMessage ?? `Добро пожаловать! Я бот ${botData?.name ?? ''}. Чем могу помочь?`

      await ctx.reply(welcomeMessage)
    } catch (error) {
      console.error(`[Telegram Bot ${botId}] /start error:`, error)
      await ctx.reply('Добро пожаловать! Чем могу помочь?')
    }
  })

  // ─── /help Command ──────────────────────────────────────────────────
  bot.command('help', async (ctx) => {
    await ctx.reply(
      '📋 Доступные команды:\n\n' +
      '/start — Начать разговор\n' +
      '/catalog — Посмотреть каталог\n' +
      '/help — Список команд\n\n' +
      'Просто напишите мне свой вопрос, и я помогу! 😊'
    )
  })

  // ─── /catalog Command ─────────────────────────────────────────────────
  bot.command('catalog', async (ctx) => {
    try {
      const products = await prisma.product.findMany({
        where: { bot: { id: botId }, inStock: true },
        orderBy: { sortOrder: 'asc' },
        take: 20,
      })

      if (products.length === 0) {
        await ctx.reply('Каталог пока пуст. Скоро появятся товары!')
        return
      }

      // Group by category
      const grouped = new Map<string, typeof products>()
      for (const p of products) {
        const cat = p.category || 'Товары'
        if (!grouped.has(cat)) grouped.set(cat, [])
        grouped.get(cat)!.push(p)
      }

      let text = '📦 Наш каталог:\n'
      for (const [category, items] of grouped) {
        text += `\n<b>${category}</b>\n`
        for (const item of items) {
          const price = Number(item.price).toLocaleString('ru-RU')
          text += `• ${item.name} — ${price} ${item.currency}\n`
        }
      }
      text += '\nНапишите название товара для подробностей или заказа.'

      await ctx.reply(text, { parse_mode: 'HTML' })
    } catch (error) {
      logger.error('Catalog command error', { botId, error: String(error) })
      await ctx.reply('Не удалось загрузить каталог. Попробуйте позже.')
    }
  })

  // ─── Text Messages → AI Engine ────────────────────────────────────────
  bot.on('message:text', async (ctx) => {
    // Skip commands (already handled above)
    if (ctx.message.text.startsWith('/')) return

    try {
      const chatId = ctx.chat.id.toString()
      const customerName = buildCustomerName(ctx)
      const customerLanguage = ctx.from?.language_code ?? null

      // Upsert customer record (fire-and-forget)
      prisma.customer.upsert({
        where: { botId_platformChatId_platform: { botId, platformChatId: chatId, platform: 'telegram' } },
        create: { botId, platformChatId: chatId, platform: 'telegram', name: customerName, language: customerLanguage },
        update: { lastContact: new Date(), ...(customerName && { name: customerName }), ...(customerLanguage && { language: customerLanguage }) },
      }).catch(() => {})

      // Check if conversation is in operator mode — skip AI
      const existingConv = await prisma.conversation.findFirst({
        where: { botId, platformChatId: chatId, platform: 'telegram', isResolved: false },
        orderBy: { updatedAt: 'desc' },
      })

      if (existingConv?.operatorMode) {
        // Just save the message, operator will see it in dashboard
        await prisma.message.create({
          data: {
            conversationId: existingConv.id,
            role: 'USER',
            content: ctx.message.text,
            platform: 'telegram',
          },
        })
        await prisma.conversation.update({
          where: { id: existingConv.id },
          data: { updatedAt: new Date() },
        })
        return // Don't call AI
      }

      // Show "typing" indicator
      await ctx.replyWithChatAction('typing')

      const result = await processMessage(
        botId,
        chatId,
        'telegram',
        ctx.message.text,
        customerName,
        customerLanguage
      )

      // Send the AI response (strip order JSON blocks from visible text)
      const visibleResponse = result.response.replace(/```order\s*\n?[\s\S]*?```/g, '').trim()

      if (visibleResponse) {
        await ctx.reply(visibleResponse, { parse_mode: 'HTML' })
      }

      // If handoff is suggested, notify the manager + set operator mode
      if (result.suggestHandoff) {
        await notifyManager(botId, chatId, customerName, ctx.message.text)
        // Enable operator mode on this conversation
        const conv = await prisma.conversation.findFirst({
          where: { botId, platformChatId: chatId, platform: 'telegram', isResolved: false },
        })
        if (conv) {
          await prisma.conversation.update({ where: { id: conv.id }, data: { operatorMode: true } })
        }
        // Also send structured notification
        import('./owner-notifications').then(({ notifyHandoff }) => {
          notifyHandoff(botId, customerName, ctx.message.text).catch(() => {})
        })
      }

      // If order data was extracted, create order
      if (result.intent === 'order_intent' && result.extractedData?.orderItems?.length) {
        await handleOrderExtraction(botId, chatId, result.extractedData, ctx)
      }
    } catch (error) {
      console.error(`[Telegram Bot ${botId}] Message processing error:`, error)
      await ctx.reply('Извините, произошла ошибка. Попробуйте ещё раз.')
    }
  })

  // ─── Photo Messages ───────────────────────────────────────────────────
  bot.on('message:photo', async (ctx) => {
    try {
      const chatId = ctx.chat.id.toString()
      const caption = ctx.message.caption

      if (caption) {
        // Process caption as text message
        await ctx.replyWithChatAction('typing')
        const result = await processMessage(
          botId,
          chatId,
          'telegram',
          `[Фото] ${caption}`,
          buildCustomerName(ctx),
          ctx.from?.language_code ?? null
        )
        const visibleResponse = result.response.replace(/```order\s*\n?[\s\S]*?```/g, '').trim()
        if (visibleResponse) {
          await ctx.reply(visibleResponse)
        }
      } else {
        await ctx.reply(
          'Фото получено! Если вы хотите что-то уточнить по этому фото, пожалуйста, добавьте описание.'
        )
      }
    } catch (error) {
      console.error(`[Telegram Bot ${botId}] Photo handling error:`, error)
      await ctx.reply('Фото получено. Чем ещё могу помочь?')
    }
  })

  // ─── Voice Messages ──────────────────────────────────────────────────
  bot.on('message:voice', async (ctx) => {
    await ctx.reply(
      'Извините, я пока не понимаю голосовые сообщения. Пожалуйста, напишите текстом, и я с удовольствием помогу!'
    )
  })

  bot.on('message:video_note', async (ctx) => {
    await ctx.reply(
      'Спасибо за видеосообщение! К сожалению, я пока могу обрабатывать только текст. Напишите, чем могу помочь?'
    )
  })

  // ─── Contact Sharing ──────────────────────────────────────────────────
  bot.on('message:contact', async (ctx) => {
    try {
      const contact = ctx.message.contact
      const chatId = ctx.chat.id.toString()
      const phone = contact.phone_number

      // Save phone to conversation
      await prisma.conversation.updateMany({
        where: {
          botId,
          platformChatId: chatId,
          platform: 'telegram',
          isResolved: false,
        },
        data: {
          customerPhone: phone,
          customerName:
            [contact.first_name, contact.last_name].filter(Boolean).join(' ') || undefined,
        },
      })

      await ctx.reply(
        `Спасибо! Ваш номер ${phone} сохранён. Менеджер сможет связаться с вами при необходимости.`
      )
    } catch (error) {
      console.error(`[Telegram Bot ${botId}] Contact handling error:`, error)
      await ctx.reply('Контакт получен, спасибо!')
    }
  })

  // ─── Callback Queries (for future inline keyboards) ───────────────────
  bot.on('callback_query:data', async (ctx) => {
    try {
      await ctx.answerCallbackQuery()
      // Future: handle inline button callbacks (e.g., confirm order, rate service)
    } catch (error) {
      console.error(`[Telegram Bot ${botId}] Callback query error:`, error)
    }
  })

  // ─── Error Handler ────────────────────────────────────────────────────
  bot.catch((err) => {
    console.error(`[Telegram Bot ${botId}] Unhandled error:`, err)
  })
}

// ─── Webhook Management ─────────────────────────────────────────────────────

/**
 * Register a Telegram webhook for a bot token.
 */
/**
 * Generate a secret token for webhook verification.
 */
export function generateWebhookSecret(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex').substring(0, 32)
}

/**
 * Verify the webhook secret token from Telegram.
 */
export function verifyWebhookSecret(token: string, receivedSecret: string): boolean {
  const expected = generateWebhookSecret(token)
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(receivedSecret))
}

export async function registerWebhook(
  token: string,
  webhookUrl: string
): Promise<{ success: boolean; description?: string }> {
  try {
    const secretToken = generateWebhookSecret(token)
    const response = await fetch(
      `https://api.telegram.org/bot${token}/setWebhook`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl,
          secret_token: secretToken,
          allowed_updates: ['message', 'callback_query'],
          drop_pending_updates: true,
        }),
      }
    )

    const result = (await response.json()) as {
      ok: boolean
      description?: string
    }

    return { success: result.ok, description: result.description }
  } catch (error) {
    console.error('[Telegram] Webhook registration error:', error)
    return {
      success: false,
      description: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Remove a Telegram webhook for a bot token.
 */
export async function unregisterWebhook(
  token: string
): Promise<{ success: boolean; description?: string }> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/deleteWebhook`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drop_pending_updates: true }),
      }
    )

    const result = (await response.json()) as {
      ok: boolean
      description?: string
    }

    return { success: result.ok, description: result.description }
  } catch (error) {
    console.error('[Telegram] Webhook removal error:', error)
    return {
      success: false,
      description: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get the grammY webhook callback handler for use in Next.js API routes.
 */
export function getWebhookHandler(bot: Bot) {
  return webhookCallback(bot, 'std/http')
}

// ─── Internal Helpers ───────────────────────────────────────────────────────

function buildCustomerName(ctx: Context): string | null {
  if (!ctx.from) return null
  return [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(' ') || null
}

async function notifyManager(
  botId: string,
  customerChatId: string,
  customerName: string | null,
  message: string
): Promise<void> {
  try {
    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      select: {
        managerContact: true,
        telegramToken: true,
        user: { select: { telegramId: true } },
      },
    })

    if (!bot?.telegramToken) return

    // Try to notify the bot owner via Telegram
    const managerId = bot.user.telegramId
    if (!managerId) return

    const notification =
      `🔔 Запрос на подключение менеджера!\n\n` +
      `Клиент: ${customerName ?? 'Неизвестный'}\n` +
      `Chat ID: ${customerChatId}\n` +
      `Сообщение: ${message.slice(0, 200)}`

    await fetch(
      `https://api.telegram.org/bot${bot.telegramToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: managerId.toString(),
          text: notification,
        }),
      }
    )
  } catch (error) {
    console.error(`[Telegram Bot ${botId}] Manager notification error:`, error)
  }
}

async function handleOrderExtraction(
  botId: string,
  chatId: string,
  extractedData: NonNullable<Awaited<ReturnType<typeof processMessage>>['extractedData']>,
  ctx: Context
): Promise<void> {
  try {
    if (!extractedData.orderItems?.length) return

    // Find the conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        botId,
        platformChatId: chatId,
        platform: 'telegram',
        isResolved: false,
      },
    })

    if (!conversation) return

    // Calculate total
    const total = extractedData.orderItems.reduce(
      (sum, item) => sum + (item.price ?? 0) * item.quantity,
      0
    )

    await prisma.order.create({
      data: {
        botId,
        conversationId: conversation.id,
        items: extractedData.orderItems as unknown as Prisma.InputJsonValue,
        total,
        customerName: conversation.customerName ?? undefined,
        customerPhone: conversation.customerPhone ?? undefined,
        deliveryAddress: extractedData.deliveryAddress ?? undefined,
        notes: extractedData.notes ?? undefined,
      },
    })
  } catch (error) {
    console.error(`[Telegram Bot ${botId}] Order extraction error:`, error)
  }
}
