import { prisma } from '@/lib/prisma'

// ─── Plan Limits ─────────────────────────────────────────────────────────────

const PLAN_LIMITS = {
  FREE: { contacts: 100, aiMessages: 500 },
  STARTER: { contacts: 1000, aiMessages: 5000 },
  BUSINESS: { contacts: Infinity, aiMessages: 20000 },
} as const

export interface Usage {
  contacts: number
  contactsLimit: number
  aiMessages: number
  aiMessagesLimit: number
  contactsPercent: number
  aiMessagesPercent: number
}

/**
 * Get current month's usage for a bot.
 */
export async function getUsage(botId: string): Promise<Usage> {
  const bot = await prisma.bot.findUnique({
    where: { id: botId },
    include: { user: { select: { plan: true } } },
  })

  if (!bot) {
    return { contacts: 0, contactsLimit: 100, aiMessages: 0, aiMessagesLimit: 500, contactsPercent: 0, aiMessagesPercent: 0 }
  }

  const plan = bot.user.plan as keyof typeof PLAN_LIMITS
  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.FREE

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const [contacts, aiMessages] = await Promise.all([
    prisma.conversation.findMany({
      where: { botId, createdAt: { gte: monthStart } },
      select: { platformChatId: true },
      distinct: ['platformChatId'],
    }).then((r) => r.length),
    prisma.message.count({
      where: {
        conversation: { botId },
        role: 'ASSISTANT',
        createdAt: { gte: monthStart },
      },
    }),
  ])

  return {
    contacts,
    contactsLimit: limits.contacts === Infinity ? 999999 : limits.contacts,
    aiMessages,
    aiMessagesLimit: limits.aiMessages,
    contactsPercent: limits.contacts === Infinity ? 0 : Math.round((contacts / limits.contacts) * 100),
    aiMessagesPercent: Math.round((aiMessages / limits.aiMessages) * 100),
  }
}

/**
 * Check if a specific limit type is exceeded.
 */
export async function checkLimit(
  botId: string,
  limitType: 'contacts' | 'aiMessages'
): Promise<boolean> {
  const usage = await getUsage(botId)

  if (limitType === 'contacts') {
    return usage.contacts < usage.contactsLimit
  }
  return usage.aiMessages < usage.aiMessagesLimit
}
