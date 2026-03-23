import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import type { Prisma } from '@prisma/client'

export const broadcastRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        botId: z.string(),
        message: z.string().min(1).max(4096),
        imageUrl: z.string().url().optional(),
        filters: z.record(z.string(), z.string()).optional(),
        scheduledAt: z.string().datetime().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      const bot = await ctx.prisma.bot.findUnique({ where: { id: input.botId } })
      if (!bot || bot.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      return ctx.prisma.broadcast.create({
        data: {
          botId: input.botId,
          message: input.message,
          imageUrl: input.imageUrl,
          filters: input.filters ? (input.filters as Prisma.InputJsonValue) : undefined,
          scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
          status: input.scheduledAt ? 'SCHEDULED' : 'DRAFT',
        },
      })
    }),

  list: protectedProcedure
    .input(z.object({ botId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      const bot = await ctx.prisma.bot.findUnique({ where: { id: input.botId } })
      if (!bot || bot.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      return ctx.prisma.broadcast.findMany({
        where: { botId: input.botId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      })
    }),

  send: protectedProcedure
    .input(z.object({ id: z.string(), botId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      const bot = await ctx.prisma.bot.findUnique({ where: { id: input.botId } })
      if (!bot || bot.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      const broadcast = await ctx.prisma.broadcast.findUnique({ where: { id: input.id } })
      if (!broadcast || broadcast.botId !== input.botId) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      if (broadcast.status !== 'DRAFT' && broadcast.status !== 'SCHEDULED') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Broadcast already sent' })
      }

      // Mark as sending — actual send will be handled by a worker/job
      return ctx.prisma.broadcast.update({
        where: { id: input.id },
        data: { status: 'SENDING', sentAt: new Date() },
      })
    }),

  stats: protectedProcedure
    .input(z.object({ id: z.string(), botId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      const bot = await ctx.prisma.bot.findUnique({ where: { id: input.botId } })
      if (!bot || bot.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      return ctx.prisma.broadcast.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          status: true,
          totalSent: true,
          totalFailed: true,
          sentAt: true,
        },
      })
    }),
})
