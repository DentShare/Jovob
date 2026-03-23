import { prisma } from '@/lib/prisma'
import type { Plan } from '@prisma/client'

interface PlanConfig {
  contacts: number      // -1 = unlimited
  bots: number
  messagesPerDay: number
  channels: string[]
}

const PLAN_LIMITS: Record<Plan, PlanConfig> = {
  FREE: {
    contacts: 100,
    bots: 1,
    messagesPerDay: 50,
    channels: ['telegram'],
  },
  STARTER: {
    contacts: 1000,
    bots: 3,
    messagesPerDay: 500,
    channels: ['telegram', 'instagram'],
  },
  BUSINESS: {
    contacts: -1,
    bots: -1,
    messagesPerDay: -1,
    channels: ['telegram', 'instagram', 'whatsapp'],
  },
}

export function getPlanLimits(plan: Plan): PlanConfig {
  return PLAN_LIMITS[plan]
}

export interface LimitCheckResult {
  allowed: boolean
  current: number
  max: number
  limitType: string
}

export async function checkLimit(
  userId: string,
  limitType: 'bots' | 'messagesPerDay' | 'contacts'
): Promise<LimitCheckResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  })

  const plan = user?.plan ?? 'FREE'
  const limits = PLAN_LIMITS[plan]
  const max = limits[limitType]

  if (max === -1) {
    return { allowed: true, current: 0, max: -1, limitType }
  }

  let current = 0

  switch (limitType) {
    case 'bots':
      current = await prisma.bot.count({ where: { userId } })
      break

    case 'messagesPerDay': {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      // Count messages across all user's bots for today
      const bots = await prisma.bot.findMany({
        where: { userId },
        select: { id: true },
      })
      const botIds = bots.map((b) => b.id)
      if (botIds.length > 0) {
        current = await prisma.message.count({
          where: {
            conversation: { botId: { in: botIds } },
            role: 'ASSISTANT',
            createdAt: { gte: today },
          },
        })
      }
      break
    }

    case 'contacts': {
      const bots = await prisma.bot.findMany({
        where: { userId },
        select: { id: true },
      })
      const botIds = bots.map((b) => b.id)
      if (botIds.length > 0) {
        current = await prisma.conversation.count({
          where: {
            botId: { in: botIds },
            customerName: { not: null },
          },
        })
      }
      break
    }
  }

  return { allowed: current < max, current, max, limitType }
}

export async function enforceLimit(
  userId: string,
  limitType: 'bots' | 'messagesPerDay' | 'contacts'
): Promise<void> {
  const result = await checkLimit(userId, limitType)
  if (!result.allowed) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    })
    throw new Error(
      `Лимит тарифа ${user?.plan ?? 'FREE'}: ${result.limitType} (${result.current}/${result.max}). Обновите тариф.`
    )
  }
}
