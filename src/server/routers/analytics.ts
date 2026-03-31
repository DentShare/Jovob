import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from '../trpc'

export const analyticsRouter = router({
  // ─── Message chart data (daily) ──────────────────────────────────────────
  getChart: protectedProcedure
    .input(z.object({
      botId: z.string(),
      period: z.enum(['7d', '30d', '90d']).default('30d'),
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      const bot = await ctx.prisma.bot.findUnique({ where: { id: input.botId } })
      if (!bot || bot.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
      }

      const days = input.period === '7d' ? 7 : input.period === '30d' ? 30 : 90
      const since = new Date(Date.now() - days * 86400000)

      const messages = await ctx.prisma.message.groupBy({
        by: ['createdAt'],
        where: { conversation: { botId: input.botId }, createdAt: { gte: since } },
        _count: true,
      })

      // Aggregate by date
      const dailyMap = new Map<string, number>()
      for (let i = 0; i < days; i++) {
        const d = new Date(Date.now() - (days - 1 - i) * 86400000)
        dailyMap.set(d.toISOString().slice(0, 10), 0)
      }
      for (const m of messages) {
        const key = new Date(m.createdAt).toISOString().slice(0, 10)
        dailyMap.set(key, (dailyMap.get(key) ?? 0) + m._count)
      }

      return Array.from(dailyMap.entries()).map(([date, count]) => ({ date, count }))
    }),

  // ─── Top questions ────────────────────────────────────────────────────────
  getTopQuestions: protectedProcedure
    .input(z.object({ botId: z.string(), limit: z.number().int().default(10) }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      const bot = await ctx.prisma.bot.findUnique({ where: { id: input.botId } })
      if (!bot || bot.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
      }

      // Get recent user messages and count frequent words/phrases
      const messages = await ctx.prisma.message.findMany({
        where: { conversation: { botId: input.botId }, role: 'USER' },
        orderBy: { createdAt: 'desc' },
        take: 500,
        select: { content: true },
      })

      // Simple frequency analysis
      const freq = new Map<string, number>()
      for (const m of messages) {
        // Normalize: lowercase, trim, cap at 80 chars
        const text = m.content.toLowerCase().trim().slice(0, 80)
        if (text.length < 3) continue
        freq.set(text, (freq.get(text) ?? 0) + 1)
      }

      return Array.from(freq.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, input.limit)
        .map(([question, count]) => ({ question, count }))
    }),

  // ─── Funnel: messages → catalogs → orders ─────────────────────────────────
  getFunnel: protectedProcedure
    .input(z.object({ botId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      const bot = await ctx.prisma.bot.findUnique({ where: { id: input.botId } })
      if (!bot || bot.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
      }

      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)

      const [totalConversations, catalogQueries, orders] = await Promise.all([
        ctx.prisma.conversation.count({
          where: { botId: input.botId, createdAt: { gte: thirtyDaysAgo } },
        }),
        ctx.prisma.message.count({
          where: {
            conversation: { botId: input.botId },
            role: 'USER',
            createdAt: { gte: thirtyDaysAgo },
            OR: [
              { content: { contains: 'каталог', mode: 'insensitive' } },
              { content: { contains: 'цена', mode: 'insensitive' } },
              { content: { contains: 'товар', mode: 'insensitive' } },
              { content: { contains: 'narx', mode: 'insensitive' } },
              { content: { contains: 'katalog', mode: 'insensitive' } },
            ],
          },
        }),
        ctx.prisma.order.count({
          where: { botId: input.botId, createdAt: { gte: thirtyDaysAgo } },
        }),
      ])

      return { totalConversations, catalogQueries, orders }
    }),

  // ─── AI performance ────────────────────────────────────────────────────────
  getAiPerformance: protectedProcedure
    .input(z.object({ botId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      const bot = await ctx.prisma.bot.findUnique({ where: { id: input.botId } })
      if (!bot || bot.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
      }

      const [totalAi, highConfidence, handoffs] = await Promise.all([
        ctx.prisma.message.count({
          where: { conversation: { botId: input.botId }, role: 'ASSISTANT' },
        }),
        ctx.prisma.message.count({
          where: { conversation: { botId: input.botId }, role: 'ASSISTANT', confidence: { gte: 0.6 } },
        }),
        ctx.prisma.message.count({
          where: { conversation: { botId: input.botId }, role: 'ASSISTANT', handedOff: true },
        }),
      ])

      return {
        totalResponses: totalAi,
        autoResolved: highConfidence,
        handoffs,
        autoResolvedRate: totalAi > 0 ? Math.round((highConfidence / totalAi) * 100) : 0,
      }
    }),

  // ─── Popular products ──────────────────────────────────────────────────────
  getPopularProducts: protectedProcedure
    .input(z.object({ botId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      const bot = await ctx.prisma.bot.findUnique({ where: { id: input.botId } })
      if (!bot || bot.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
      }

      const orders = await ctx.prisma.order.findMany({
        where: { botId: input.botId },
        select: { items: true },
      })

      const productCount = new Map<string, number>()
      for (const order of orders) {
        const items = order.items as Array<{ productName?: string; name?: string; quantity?: number }>
        if (!Array.isArray(items)) continue
        for (const item of items) {
          const name = item.productName || item.name || 'Unknown'
          productCount.set(name, (productCount.get(name) ?? 0) + (item.quantity ?? 1))
        }
      }

      return Array.from(productCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }))
    }),
})
