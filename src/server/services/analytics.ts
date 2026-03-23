import { prisma } from '@/lib/prisma'

interface PeriodRange {
  start: Date
  end: Date
  prevStart: Date
  prevEnd: Date
}

function getPeriodRange(period: 'day' | 'week' | 'month'): PeriodRange {
  const now = new Date()
  const end = new Date(now)
  const start = new Date(now)
  const prevStart = new Date(now)
  const prevEnd = new Date(now)

  switch (period) {
    case 'day':
      start.setHours(0, 0, 0, 0)
      prevStart.setDate(prevStart.getDate() - 1)
      prevStart.setHours(0, 0, 0, 0)
      prevEnd.setHours(0, 0, 0, 0)
      break
    case 'week':
      start.setDate(start.getDate() - 7)
      prevStart.setDate(prevStart.getDate() - 14)
      prevEnd.setDate(prevEnd.getDate() - 7)
      break
    case 'month':
      start.setMonth(start.getMonth() - 1)
      prevStart.setMonth(prevStart.getMonth() - 2)
      prevEnd.setMonth(prevEnd.getMonth() - 1)
      break
  }

  return { start, end, prevStart, prevEnd }
}

export async function getBotAnalytics(
  botId: string,
  period: 'day' | 'week' | 'month'
) {
  const { start, end, prevStart, prevEnd } = getPeriodRange(period)

  // Current period counts
  const [
    totalMessages,
    prevMessages,
    totalOrders,
    prevOrders,
    newCustomers,
    prevCustomers,
  ] = await Promise.all([
    prisma.message.count({
      where: { conversation: { botId }, createdAt: { gte: start, lte: end } },
    }),
    prisma.message.count({
      where: { conversation: { botId }, createdAt: { gte: prevStart, lte: prevEnd } },
    }),
    prisma.order.count({
      where: { botId, createdAt: { gte: start, lte: end } },
    }),
    prisma.order.count({
      where: { botId, createdAt: { gte: prevStart, lte: prevEnd } },
    }),
    prisma.conversation.count({
      where: { botId, createdAt: { gte: start, lte: end } },
    }),
    prisma.conversation.count({
      where: { botId, createdAt: { gte: prevStart, lte: prevEnd } },
    }),
  ])

  // AI answer rate
  const aiMessages = await prisma.message.count({
    where: {
      conversation: { botId },
      role: 'ASSISTANT',
      handedOff: false,
      createdAt: { gte: start, lte: end },
    },
  })

  const totalBotMessages = await prisma.message.count({
    where: {
      conversation: { botId },
      role: 'ASSISTANT',
      createdAt: { gte: start, lte: end },
    },
  })

  const aiAnswerRate = totalBotMessages > 0 ? Math.round((aiMessages / totalBotMessages) * 100) : 100

  // Revenue
  const revenueResult = await prisma.order.aggregate({
    where: { botId, createdAt: { gte: start, lte: end }, status: { not: 'CANCELLED' } },
    _sum: { total: true },
  })
  const totalRevenue = Number(revenueResult._sum.total ?? 0)

  // Top unanswered questions from AILog
  const unanswered = await prisma.aILog.findMany({
    where: {
      botId,
      confidence: { lt: 0.6 },
      createdAt: { gte: start, lte: end },
    },
    select: { userMessage: true },
    take: 20,
    orderBy: { createdAt: 'desc' },
  })

  // Group unanswered by similarity (simple: first 50 chars)
  const questionCounts = new Map<string, number>()
  for (const q of unanswered) {
    const key = q.userMessage.slice(0, 50).toLowerCase()
    questionCounts.set(key, (questionCounts.get(key) ?? 0) + 1)
  }
  const topUnansweredQuestions = [...questionCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([question, count]) => ({ question, count }))

  // Intent distribution from AILog
  const intents = await prisma.aILog.groupBy({
    by: ['intent'],
    where: { botId, createdAt: { gte: start, lte: end } },
    _count: true,
  })
  const intentDistribution = intents.map((i) => ({
    intent: i.intent,
    count: i._count,
  }))

  return {
    overview: {
      totalMessages,
      totalOrders,
      totalRevenue,
      newCustomers,
      aiAnswerRate,
      messagesTrend: calcTrend(totalMessages, prevMessages),
      ordersTrend: calcTrend(totalOrders, prevOrders),
      customersTrend: calcTrend(newCustomers, prevCustomers),
    },
    insights: {
      topUnansweredQuestions,
      intentDistribution,
    },
  }
}

function calcTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}
