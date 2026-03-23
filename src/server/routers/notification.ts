import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'

export const notificationRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(20),
        unreadOnly: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      return ctx.prisma.notification.findMany({
        where: {
          userId,
          ...(input.unreadOnly && { isRead: false }),
        },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
      })
    }),

  count: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session!.user!.id as string
    return ctx.prisma.notification.count({
      where: { userId, isRead: false },
    })
  }),

  markRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      return ctx.prisma.notification.updateMany({
        where: { id: input.id, userId },
        data: { isRead: true },
      })
    }),

  markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session!.user!.id as string
    return ctx.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    })
  }),
})
