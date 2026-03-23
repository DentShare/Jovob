import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

type NotificationEvent =
  | { type: 'new_order'; botId: string; orderTotal: number; customerName: string | null }
  | { type: 'handoff_requested'; botId: string; customerName: string | null; lastMessage: string }
  | { type: 'low_confidence'; botId: string; question: string; confidence: number }
  | { type: 'limit_warning'; limitType: string; current: number; max: number }

const TITLES: Record<string, string> = {
  new_order: 'Новый заказ',
  handoff_requested: 'Запрос на оператора',
  low_confidence: 'Бот не уверен в ответе',
  limit_warning: 'Приближение к лимиту',
}

export async function notifyUser(userId: string, event: NotificationEvent): Promise<void> {
  try {
    let body = ''

    switch (event.type) {
      case 'new_order':
        body = `${event.customerName || 'Клиент'} оформил заказ на ${event.orderTotal.toLocaleString('ru-RU')} UZS`
        break
      case 'handoff_requested':
        body = `${event.customerName || 'Клиент'}: "${event.lastMessage.slice(0, 100)}"`
        break
      case 'low_confidence':
        body = `Вопрос: "${event.question.slice(0, 100)}" (уверенность: ${Math.round(event.confidence * 100)}%)`
        break
      case 'limit_warning':
        body = `${event.limitType}: использовано ${event.current}/${event.max}`
        break
    }

    await prisma.notification.create({
      data: {
        userId,
        type: event.type,
        title: TITLES[event.type] || event.type,
        body,
        data: event as any,
      },
    })
  } catch (error) {
    logger.error('Failed to create notification', { userId, event: event.type, error: String(error) })
  }
}

/**
 * Notify the bot owner by userId derived from botId.
 */
export async function notifyBotOwner(botId: string, event: NotificationEvent): Promise<void> {
  try {
    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      select: { userId: true },
    })
    if (!bot) return
    await notifyUser(bot.userId, event)
  } catch (error) {
    logger.error('Failed to notify bot owner', { botId, error: String(error) })
  }
}
