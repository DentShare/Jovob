import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from '../trpc'

export const serviceRouter = router({
  // ─── Create service ──────────────────────────────────────────────────────
  create: protectedProcedure
    .input(
      z.object({
        botId: z.string(),
        name: z.string().min(1),
        nameUz: z.string().optional(),
        description: z.string().optional(),
        price: z.number().positive(),
        currency: z.string().default('UZS'),
        durationMin: z.number().int().positive().optional(),
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

      const service = await ctx.prisma.service.create({
        data: input,
      })

      return service
    }),

  // ─── List services by bot ──────────────────────────────────────────────
  list: protectedProcedure
    .input(z.object({ botId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      const bot = await ctx.prisma.bot.findUnique({
        where: { id: input.botId },
      })
      if (!bot || bot.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
      }

      const services = await ctx.prisma.service.findMany({
        where: { botId: input.botId },
        orderBy: { createdAt: 'desc' },
      })

      return services
    }),

  // ─── Update service ────────────────────────────────────────────────────
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        botId: z.string(),
        name: z.string().min(1).optional(),
        nameUz: z.string().optional(),
        description: z.string().optional(),
        price: z.number().positive().optional(),
        currency: z.string().optional(),
        durationMin: z.number().int().positive().optional(),
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

      const existing = await ctx.prisma.service.findUnique({
        where: { id: input.id },
      })
      if (!existing || existing.botId !== input.botId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Service not found' })
      }

      const { id, botId, ...data } = input
      const service = await ctx.prisma.service.update({
        where: { id },
        data,
      })

      return service
    }),

  // ─── Delete service ────────────────────────────────────────────────────
  delete: protectedProcedure
    .input(z.object({ id: z.string(), botId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      const bot = await ctx.prisma.bot.findUnique({
        where: { id: input.botId },
      })
      if (!bot || bot.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
      }

      const existing = await ctx.prisma.service.findUnique({
        where: { id: input.id },
      })
      if (!existing || existing.botId !== input.botId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Service not found' })
      }

      await ctx.prisma.service.delete({ where: { id: input.id } })

      return { success: true }
    }),
})
