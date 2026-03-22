import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from '../trpc'

const productInput = z.object({
  name: z.string().min(1).max(200),
  nameUz: z.string().optional(),
  description: z.string().optional(),
  price: z.number().positive(),
  currency: z.string().default('UZS'),
  category: z.string().optional(),
  imageUrl: z.string().url().optional(),
  inStock: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})

/** Verify user owns the bot and return it */
async function verifyBotOwnership(
  prisma: typeof import('@/lib/prisma').prisma,
  botId: string,
  userId: string
) {
  const bot = await prisma.bot.findUnique({ where: { id: botId } })
  if (!bot) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Bot not found' })
  }
  if (bot.userId !== userId) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
  }
  return bot
}

export const productRouter = router({
  // ─── Create product ─────────────────────────────────────────────────────────
  create: protectedProcedure
    .input(productInput.extend({ botId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      const { botId, ...data } = input

      await verifyBotOwnership(ctx.prisma, botId, userId)

      const product = await ctx.prisma.product.create({
        data: { ...data, botId, price: data.price },
      })

      return product
    }),

  // ─── List products by bot ──────────────────────────────────────────────────
  list: protectedProcedure
    .input(
      z.object({
        botId: z.string(),
        category: z.string().optional(),
        inStock: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      await verifyBotOwnership(ctx.prisma, input.botId, userId)

      const products = await ctx.prisma.product.findMany({
        where: {
          botId: input.botId,
          ...(input.category && { category: input.category }),
          ...(input.inStock !== undefined && { inStock: input.inStock }),
        },
        orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
      })

      return products
    }),

  // ─── Update product ────────────────────────────────────────────────────────
  update: protectedProcedure
    .input(
      productInput.partial().extend({
        id: z.string(),
        botId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      const { id, botId, ...data } = input

      await verifyBotOwnership(ctx.prisma, botId, userId)

      const existing = await ctx.prisma.product.findUnique({ where: { id } })
      if (!existing || existing.botId !== botId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' })
      }

      const product = await ctx.prisma.product.update({
        where: { id },
        data,
      })

      return product
    }),

  // ─── Delete product ────────────────────────────────────────────────────────
  delete: protectedProcedure
    .input(z.object({ id: z.string(), botId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      await verifyBotOwnership(ctx.prisma, input.botId, userId)

      const existing = await ctx.prisma.product.findUnique({
        where: { id: input.id },
      })
      if (!existing || existing.botId !== input.botId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' })
      }

      await ctx.prisma.product.delete({ where: { id: input.id } })

      return { success: true }
    }),

  // ─── Bulk create (for Excel import) ────────────────────────────────────────
  bulkCreate: protectedProcedure
    .input(
      z.object({
        botId: z.string(),
        products: z.array(productInput).min(1).max(500),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      await verifyBotOwnership(ctx.prisma, input.botId, userId)

      const created = await ctx.prisma.product.createMany({
        data: input.products.map((p, index) => ({
          ...p,
          botId: input.botId,
          price: p.price,
          sortOrder: p.sortOrder ?? index,
        })),
      })

      return { count: created.count }
    }),
})
