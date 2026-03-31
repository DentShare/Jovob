import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

/**
 * Send a Telegram message to the bot owner.
 */
async function sendToOwner(botId: string, text: string): Promise<void> {
  try {
    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      include: { user: { select: { telegramId: true } } },
    })

    if (!bot?.telegramToken || !bot.user.telegramId) return

    await fetch(`https://api.telegram.org/bot${bot.telegramToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: bot.user.telegramId.toString(),
        text,
        parse_mode: 'HTML',
      }),
    })
  } catch (error) {
    logger.error('Owner notification failed', { botId, error: String(error) })
  }
}

/**
 * Notify owner about a new order.
 */
export async function notifyNewOrder(
  botId: string,
  orderId: string,
  total: number,
  customerName?: string | null
): Promise<void> {
  const name = customerName ?? 'Клиент'
  const amount = total.toLocaleString('ru-RU')
  await sendToOwner(
    botId,
    `🛒 <b>Новый заказ!</b>\n\nОт: ${name}\nСумма: ${amount} UZS\nID: #${orderId.slice(-6)}`
  )

  // Also save as in-app notification
  const bot = await prisma.bot.findUnique({ where: { id: botId }, select: { userId: true } })
  if (bot) {
    await prisma.notification.create({
      data: {
        userId: bot.userId,
        type: 'new_order',
        title: 'Новый заказ',
        body: `${name} оформил заказ на ${amount} UZS`,
        data: { botId, orderId },
      },
    }).catch(() => {})
  }
}

/**
 * Notify owner about handoff request.
 */
export async function notifyHandoff(
  botId: string,
  customerName: string | null,
  question: string
): Promise<void> {
  const name = customerName ?? 'Клиент'
  const shortQ = question.slice(0, 100)
  await sendToOwner(
    botId,
    `🆘 <b>Клиент просит менеджера</b>\n\n${name}: "${shortQ}"\n\nОтветьте в панели управления.`
  )
}

/**
 * Notify owner about a new customer.
 */
export async function notifyNewCustomer(
  botId: string,
  customerName: string | null,
  phone?: string | null
): Promise<void> {
  const name = customerName ?? 'Новый клиент'
  const phoneText = phone ? ` (${phone})` : ''
  await sendToOwner(botId, `👤 <b>Новый клиент:</b> ${name}${phoneText}`)
}

/**
 * Daily digest notification.
 */
export async function notifyDailyDigest(botId: string): Promise<void> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [messagesToday, ordersToday, newClients] = await Promise.all([
    prisma.message.count({
      where: { conversation: { botId }, createdAt: { gte: today } },
    }),
    prisma.order.count({
      where: { botId, createdAt: { gte: today } },
    }),
    prisma.conversation.findMany({
      where: { botId, createdAt: { gte: today } },
      select: { platformChatId: true },
      distinct: ['platformChatId'],
    }).then((r) => r.length),
  ])

  if (messagesToday === 0 && ordersToday === 0) return // Don't notify if no activity

  await sendToOwner(
    botId,
    `📊 <b>Итоги дня</b>\n\n💬 Сообщений: ${messagesToday}\n🛒 Заказов: ${ordersToday}\n👤 Новых клиентов: ${newClients}`
  )
}
