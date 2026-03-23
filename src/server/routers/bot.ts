import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import type { Prisma } from '@prisma/client'
import { router, protectedProcedure } from '../trpc'

export const botRouter = router({
  // ─── Create bot from wizard data ────────────────────────────────────────────
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().min(1),
        businessType: z.string().min(1),
        botLanguages: z.array(z.string()).min(1),
        personality: z.string().default('friendly'),
        welcomeMessage: z.string().min(1),
        workingHours: z.record(z.string(), z.unknown()).optional(),
        address: z.string().optional(),
        managerContact: z.string().optional(),
        telegramToken: z.string().optional(),
        capabilities: z.array(z.string()).default([]),
        scenario: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      const { workingHours, scenario, ...rest } = input

      const bot = await ctx.prisma.bot.create({
        data: {
          ...rest,
          userId,
          workingHours: workingHours as Prisma.InputJsonValue | undefined,
          scenario: scenario as Prisma.InputJsonValue | undefined,
        },
      })

      return bot
    }),

  // ─── Get bot by ID ──────────────────────────────────────────────────────────
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const bot = await ctx.prisma.bot.findUnique({
        where: { id: input.id },
        include: {
          products: { orderBy: { sortOrder: 'asc' } },
          faqItems: { orderBy: { sortOrder: 'asc' } },
          _count: {
            select: {
              orders: true,
              conversations: true,
            },
          },
        },
      })

      if (!bot) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Bot not found' })
      }

      // Verify ownership
      const userId = ctx.session!.user!.id as string
      if (bot.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
      }

      return bot
    }),

  // ─── Get all bots by user ──────────────────────────────────────────────────
  getByUserId: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session!.user!.id as string

    const bots = await ctx.prisma.bot.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            orders: true,
            conversations: true,
            products: true,
          },
        },
      },
    })

    return bots
  }),

  // ─── Update bot ─────────────────────────────────────────────────────────────
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().min(1).optional(),
        businessType: z.string().optional(),
        botLanguages: z.array(z.string()).optional(),
        personality: z.string().optional(),
        welcomeMessage: z.string().optional(),
        workingHours: z.record(z.string(), z.unknown()).optional(),
        address: z.string().optional(),
        managerContact: z.string().optional(),
        telegramToken: z.string().optional(),
        capabilities: z.array(z.string()).optional(),
        scenario: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, workingHours, scenario, ...rest } = input
      const userId = ctx.session!.user!.id as string

      const existing = await ctx.prisma.bot.findUnique({ where: { id } })
      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Bot not found' })
      }
      if (existing.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
      }

      const bot = await ctx.prisma.bot.update({
        where: { id },
        data: {
          ...rest,
          workingHours: workingHours as Prisma.InputJsonValue | undefined,
          scenario: scenario as Prisma.InputJsonValue | undefined,
        },
      })

      return bot
    }),

  // ─── Delete bot ─────────────────────────────────────────────────────────────
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string

      const existing = await ctx.prisma.bot.findUnique({
        where: { id: input.id },
      })
      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Bot not found' })
      }
      if (existing.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
      }

      // Delete related data in order (respecting foreign keys)
      await ctx.prisma.$transaction([
        ctx.prisma.message.deleteMany({
          where: { conversation: { botId: input.id } },
        }),
        ctx.prisma.order.deleteMany({ where: { botId: input.id } }),
        ctx.prisma.booking.deleteMany({ where: { botId: input.id } }),
        ctx.prisma.conversation.deleteMany({ where: { botId: input.id } }),
        ctx.prisma.product.deleteMany({ where: { botId: input.id } }),
        ctx.prisma.service.deleteMany({ where: { botId: input.id } }),
        ctx.prisma.fAQItem.deleteMany({ where: { botId: input.id } }),
        ctx.prisma.knowledgeChunk.deleteMany({
          where: { doc: { botId: input.id } },
        }),
        ctx.prisma.knowledgeDoc.deleteMany({ where: { botId: input.id } }),
        ctx.prisma.bot.delete({ where: { id: input.id } }),
      ])

      return { success: true }
    }),

  // ─── Get bot metrics ───────────────────────────────────────────────────────
  getMetrics: protectedProcedure
    .input(z.object({ botId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      const bot = await ctx.prisma.bot.findUnique({
        where: { id: input.botId },
      })
      if (!bot || bot.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const [messagesToday, ordersTotal, newClientsToday, totalMessages, aiMessages] =
        await Promise.all([
          ctx.prisma.message.count({
            where: {
              conversation: { botId: input.botId },
              createdAt: { gte: today },
            },
          }),
          ctx.prisma.order.count({
            where: { botId: input.botId },
          }),
          ctx.prisma.conversation.count({
            where: { botId: input.botId, createdAt: { gte: today } },
          }),
          ctx.prisma.message.count({
            where: { conversation: { botId: input.botId } },
          }),
          ctx.prisma.message.count({
            where: {
              conversation: { botId: input.botId },
              role: 'ASSISTANT',
              confidence: { gte: 0.6 },
            },
          }),
        ])

      return {
        messagesToday,
        ordersTotal,
        newClientsToday,
        aiAnswerRate:
          totalMessages > 0
            ? Math.round((aiMessages / totalMessages) * 100)
            : 0,
      }
    }),

  // ─── Launch bot (activate + register webhook) ──────────────────────────────
  launch: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string

      const bot = await ctx.prisma.bot.findUnique({
        where: { id: input.id },
      })
      if (!bot) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Bot not found' })
      }
      if (bot.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
      }
      if (!bot.telegramToken) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Telegram token is required to launch the bot',
        })
      }

      // Register webhook with Telegram
      const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/telegram/${bot.id}`
      const telegramResponse = await fetch(
        `https://api.telegram.org/bot${bot.telegramToken}/setWebhook`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: webhookUrl }),
        }
      )

      const result = (await telegramResponse.json()) as {
        ok: boolean
        description?: string
      }
      if (!result.ok) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to register webhook: ${result.description}`,
        })
      }

      // Get bot info from Telegram
      const meResponse = await fetch(
        `https://api.telegram.org/bot${bot.telegramToken}/getMe`
      )
      const meResult = (await meResponse.json()) as {
        ok: boolean
        result?: { username?: string }
      }
      const botUsername = meResult.ok ? meResult.result?.username : undefined

      const updated = await ctx.prisma.bot.update({
        where: { id: input.id },
        data: {
          isActive: true,
          ...(botUsername && { telegramBotName: botUsername }),
        },
      })

      return updated
    }),
})
