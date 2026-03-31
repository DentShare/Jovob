import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

interface OnboardingMessage {
  dayOffset: number
  text: string
}

const ONBOARDING_MESSAGES: OnboardingMessage[] = [
  {
    dayOffset: 0,
    text: '🎉 Добро пожаловать в Jovob!\n\nСоздайте своего AI-бота за 7 минут: {{appUrl}}/create\n\nБесплатный тариф STARTER на 3 месяца уже активирован!',
  },
  {
    dayOffset: 1,
    text: '💡 Совет: добавьте товары и FAQ в вашего бота — AI будет отвечать клиентам точнее!\n\n📦 Панель управления: {{appUrl}}/dashboard',
  },
  {
    dayOffset: 3,
    text: '📊 Ваш бот уже работает! Проверьте аналитику и посмотрите, что спрашивают клиенты:\n\n{{appUrl}}/dashboard/analytics',
  },
  {
    dayOffset: 7,
    text: '📣 Попробуйте рассылку! Отправьте акцию или новость всем клиентам бота:\n\n{{appUrl}}/dashboard/broadcasts',
  },
  {
    dayOffset: 14,
    text: '⏰ Ваш бесплатный период STARTER заканчивается через 76 дней.\n\nТекущие возможности: 1000 контактов, 5000 AI-ответов/мес.\n\nПродлите тариф: {{appUrl}}/dashboard/plan',
  },
]

/**
 * Send onboarding messages to users based on their registration date.
 * Should be called periodically (e.g., daily cron).
 */
export async function processOnboardingMessages(): Promise<number> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://jovob.uz'
  let sent = 0

  for (const msg of ONBOARDING_MESSAGES) {
    // Find users who registered exactly N days ago
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() - msg.dayOffset)
    targetDate.setHours(0, 0, 0, 0)

    const nextDate = new Date(targetDate)
    nextDate.setDate(nextDate.getDate() + 1)

    const users = await prisma.user.findMany({
      where: {
        createdAt: { gte: targetDate, lt: nextDate },
        telegramId: { not: null },
      },
      include: {
        bots: {
          where: { telegramToken: { not: null } },
          take: 1,
          select: { telegramToken: true },
        },
      },
    })

    for (const user of users) {
      if (!user.telegramId) continue

      // Use user's own bot token, or system bot token
      const token = user.bots[0]?.telegramToken ?? process.env.TELEGRAM_BOT_TOKEN
      if (!token) continue

      const text = msg.text.replace(/\{\{appUrl\}\}/g, appUrl)

      try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: user.telegramId.toString(),
            text,
            parse_mode: 'HTML',
          }),
        })
        sent++
      } catch (error) {
        logger.error('Onboarding message failed', {
          userId: user.id,
          dayOffset: msg.dayOffset,
          error: String(error),
        })
      }
    }
  }

  logger.info('Onboarding messages processed', { sent })
  return sent
}
