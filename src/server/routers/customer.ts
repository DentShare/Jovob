import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from '../trpc'

export const customerRouter = router({
  // ─── List customers ──────────────────────────────────────────────────────
  list: protectedProcedure
    .input(
      z.object({
        botId: z.string(),
        search: z.string().optional(),
        tags: z.array(z.string()).optional(),
        platform: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      const bot = await ctx.prisma.bot.findUnique({ where: { id: input.botId } })
      if (!bot || bot.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
      }

      const customers = await ctx.prisma.customer.findMany({
        where: {
          botId: input.botId,
          ...(input.platform && { platform: input.platform }),
          ...(input.tags?.length && { tags: { hasSome: input.tags } }),
          ...(input.search && {
            OR: [
              { name: { contains: input.search, mode: 'insensitive' } },
              { phone: { contains: input.search } },
            ],
          }),
        },
        orderBy: { lastContact: 'desc' },
        take: input.limit + 1,
        ...(input.cursor && { cursor: { id: input.cursor }, skip: 1 }),
      })

      let nextCursor: string | undefined
      if (customers.length > input.limit) {
        nextCursor = customers.pop()?.id
      }

      return { customers, nextCursor }
    }),

  // ─── Get customer by ID with history ─────────────────────────────────────
  getById: protectedProcedure
    .input(z.object({ id: z.string(), botId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      const bot = await ctx.prisma.bot.findUnique({ where: { id: input.botId } })
      if (!bot || bot.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
      }

      const customer = await ctx.prisma.customer.findUnique({
        where: { id: input.id },
      })
      if (!customer || customer.botId !== input.botId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Customer not found' })
      }

      // Get orders for this customer
      const orders = await ctx.prisma.order.findMany({
        where: { botId: input.botId, customerPhone: customer.phone ?? undefined },
        orderBy: { createdAt: 'desc' },
        take: 20,
      })

      // Get conversations
      const conversations = await ctx.prisma.conversation.findMany({
        where: {
          botId: input.botId,
          platformChatId: customer.platformChatId,
          platform: customer.platform,
        },
        orderBy: { updatedAt: 'desc' },
        take: 10,
        include: { _count: { select: { messages: true } } },
      })

      return { customer, orders, conversations }
    }),

  // ─── Add tag ──────────────────────────────────────────────────────────────
  addTag: protectedProcedure
    .input(z.object({ id: z.string(), botId: z.string(), tag: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      const bot = await ctx.prisma.bot.findUnique({ where: { id: input.botId } })
      if (!bot || bot.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
      }

      const customer = await ctx.prisma.customer.findUnique({ where: { id: input.id } })
      if (!customer || customer.botId !== input.botId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Customer not found' })
      }

      const tags = customer.tags.includes(input.tag)
        ? customer.tags
        : [...customer.tags, input.tag]

      return ctx.prisma.customer.update({
        where: { id: input.id },
        data: { tags },
      })
    }),

  // ─── Remove tag ───────────────────────────────────────────────────────────
  removeTag: protectedProcedure
    .input(z.object({ id: z.string(), botId: z.string(), tag: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      const bot = await ctx.prisma.bot.findUnique({ where: { id: input.botId } })
      if (!bot || bot.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
      }

      const customer = await ctx.prisma.customer.findUnique({ where: { id: input.id } })
      if (!customer || customer.botId !== input.botId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Customer not found' })
      }

      return ctx.prisma.customer.update({
        where: { id: input.id },
        data: { tags: customer.tags.filter((t) => t !== input.tag) },
      })
    }),

  // ─── Add note ─────────────────────────────────────────────────────────────
  addNote: protectedProcedure
    .input(z.object({ id: z.string(), botId: z.string(), notes: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      const bot = await ctx.prisma.bot.findUnique({ where: { id: input.botId } })
      if (!bot || bot.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
      }

      return ctx.prisma.customer.update({
        where: { id: input.id },
        data: { notes: input.notes },
      })
    }),
})
