import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { compare, hash } from 'bcryptjs'
import { formatPhoneUz } from '@/lib/auth-utils'

export const userRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user?.id
    if (!userId) throw new TRPCError({ code: 'UNAUTHORIZED' })

    const user = await ctx.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        language: true,
        plan: true,
        planExpiresAt: true,
        isVerified: true,
        image: true,
        createdAt: true,
        lastLoginAt: true,
        _count: { select: { bots: true } },
      },
    })

    if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })
    return user
  }),

  update: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100).optional(),
        language: z.enum(['ru', 'uz', 'en']).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user?.id
      if (!userId) throw new TRPCError({ code: 'UNAUTHORIZED' })

      const data: Record<string, unknown> = {}
      if (input.name) data.name = input.name
      if (input.language) data.language = input.language

      if (input.email) {
        const existing = await ctx.prisma.user.findFirst({
          where: { email: input.email.toLowerCase(), NOT: { id: userId } },
        })
        if (existing) throw new TRPCError({ code: 'CONFLICT', message: 'Email уже используется' })
        data.email = input.email.toLowerCase()
      }

      if (input.phone) {
        const phone = formatPhoneUz(input.phone)
        const existing = await ctx.prisma.user.findFirst({
          where: { phone, NOT: { id: userId } },
        })
        if (existing) throw new TRPCError({ code: 'CONFLICT', message: 'Телефон уже используется' })
        data.phone = phone
      }

      return ctx.prisma.user.update({
        where: { id: userId },
        data,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          language: true,
        },
      })
    }),

  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(6).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user?.id
      if (!userId) throw new TRPCError({ code: 'UNAUTHORIZED' })

      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
        select: { hashedPassword: true },
      })

      if (!user?.hashedPassword) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Пароль не установлен' })
      }

      const valid = await compare(input.currentPassword, user.hashedPassword)
      if (!valid) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Неверный текущий пароль' })
      }

      const hashedPassword = await hash(input.newPassword, 12)
      await ctx.prisma.user.update({
        where: { id: userId },
        data: { hashedPassword },
      })

      return { success: true }
    }),
})
