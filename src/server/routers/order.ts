import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import type { Prisma } from '@prisma/client'
import { router, protectedProcedure } from '../trpc'

export const orderRouter = router({
  // ─── Create order ──────────────────────────────────────────────────────────
  create: protectedProcedure
    .input(
      z.object({
        botId: z.string(),
        conversationId: z.string().optional(),
        items: z.array(
          z.object({
            productId: z.string(),
            name: z.string(),
            price: z.number().positive(),
            quantity: z.number().int().positive(),
          })
        ).min(1),
        customerName: z.string().optional(),
        customerPhone: z.string().min(1),
        deliveryAddress: z.string().optional(),
        notes: z.string().optional(),
        currency: z.string().default('UZS'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      const bot = await ctx.prisma.bot.findUnique({
        where: { id: input.botId },
      })
      if (!bot || bot.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
      }

      const total = input.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      )

      const order = await ctx.prisma.order.create({
        data: {
          botId: input.botId,
          conversationId: input.conversationId,
          items: input.items as unknown as Prisma.InputJsonValue,
          total,
          currency: input.currency,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          deliveryAddress: input.deliveryAddress,
          notes: input.notes,
        },
      })

      return order
    }),

  // ─── List orders by bot ────────────────────────────────────────────────────
  list: protectedProcedure
    .input(
      z.object({
        botId: z.string(),
        status: z
          .enum(['NEW', 'CONFIRMED', 'PREPARING', 'DELIVERED', 'CANCELLED'])
          .optional(),
        limit: z.number().int().min(1).max(100).default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      const bot = await ctx.prisma.bot.findUnique({
        where: { id: input.botId },
      })
      if (!bot || bot.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
      }

      const orders = await ctx.prisma.order.findMany({
        where: {
          botId: input.botId,
          ...(input.status && { status: input.status }),
        },
        orderBy: { createdAt: 'desc' },
        take: input.limit + 1,
        ...(input.cursor && { cursor: { id: input.cursor }, skip: 1 }),
        include: {
          conversation: {
            select: {
              customerName: true,
              customerPhone: true,
              platform: true,
            },
          },
        },
      })

      let nextCursor: string | undefined
      if (orders.length > input.limit) {
        const nextItem = orders.pop()
        nextCursor = nextItem?.id
      }

      return { orders, nextCursor }
    }),

  // ─── Update order status ──────────────────────────────────────────────────
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        botId: z.string(),
        status: z.enum([
          'NEW',
          'CONFIRMED',
          'PREPARING',
          'DELIVERED',
          'CANCELLED',
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      const bot = await ctx.prisma.bot.findUnique({
        where: { id: input.botId },
      })
      if (!bot || bot.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
      }

      const existing = await ctx.prisma.order.findUnique({
        where: { id: input.id },
      })
      if (!existing || existing.botId !== input.botId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' })
      }

      const order = await ctx.prisma.order.update({
        where: { id: input.id },
        data: { status: input.status },
      })

      return order
    }),

  // ─── Get order by ID ──────────────────────────────────────────────────────
  getById: protectedProcedure
    .input(z.object({ id: z.string(), botId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      const bot = await ctx.prisma.bot.findUnique({
        where: { id: input.botId },
      })
      if (!bot || bot.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
      }

      const order = await ctx.prisma.order.findUnique({
        where: { id: input.id },
        include: {
          conversation: {
            select: {
              customerName: true,
              customerPhone: true,
              platform: true,
              platformChatId: true,
            },
          },
        },
      })

      if (!order || order.botId !== input.botId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' })
      }

      return order
    }),
})
