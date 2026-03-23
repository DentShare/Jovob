import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from '../trpc'

export const bookingRouter = router({
  // ─── Create booking ──────────────────────────────────────────────────────
  create: protectedProcedure
    .input(
      z.object({
        botId: z.string(),
        serviceId: z.string().optional(),
        customerName: z.string().min(1),
        customerPhone: z.string().min(1),
        dateTime: z.string().datetime(),
        notes: z.string().optional(),
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

      const booking = await ctx.prisma.booking.create({
        data: {
          botId: input.botId,
          serviceId: input.serviceId,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          dateTime: new Date(input.dateTime),
          notes: input.notes,
        },
      })

      return booking
    }),

  // ─── List bookings by bot ──────────────────────────────────────────────
  list: protectedProcedure
    .input(
      z.object({
        botId: z.string(),
        status: z
          .enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'])
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

      const bookings = await ctx.prisma.booking.findMany({
        where: {
          botId: input.botId,
          ...(input.status && { status: input.status }),
        },
        orderBy: { dateTime: 'asc' },
        take: input.limit + 1,
        ...(input.cursor && { cursor: { id: input.cursor }, skip: 1 }),
      })

      let nextCursor: string | undefined
      if (bookings.length > input.limit) {
        const nextItem = bookings.pop()
        nextCursor = nextItem?.id
      }

      return { bookings, nextCursor }
    }),

  // ─── Update booking status ─────────────────────────────────────────────
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        botId: z.string(),
        status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']),
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

      const existing = await ctx.prisma.booking.findUnique({
        where: { id: input.id },
      })
      if (!existing || existing.botId !== input.botId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Booking not found' })
      }

      const booking = await ctx.prisma.booking.update({
        where: { id: input.id },
        data: { status: input.status },
      })

      return booking
    }),

  // ─── Get booking by ID ─────────────────────────────────────────────────
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

      const booking = await ctx.prisma.booking.findUnique({
        where: { id: input.id },
      })

      if (!booking || booking.botId !== input.botId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Booking not found' })
      }

      return booking
    }),
})
