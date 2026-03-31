import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from '../trpc'

export const conversationRouter = router({
  // ─── List conversations by bot ─────────────────────────────────────────────
  list: protectedProcedure
    .input(
      z.object({
        botId: z.string(),
        isResolved: z.boolean().optional(),
        platform: z.string().optional(),
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

      const conversations = await ctx.prisma.conversation.findMany({
        where: {
          botId: input.botId,
          ...(input.isResolved !== undefined && {
            isResolved: input.isResolved,
          }),
          ...(input.platform && { platform: input.platform }),
        },
        orderBy: { updatedAt: 'desc' },
        take: input.limit + 1,
        ...(input.cursor && { cursor: { id: input.cursor }, skip: 1 }),
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          _count: {
            select: { messages: true, orders: true },
          },
        },
      })

      let nextCursor: string | undefined
      if (conversations.length > input.limit) {
        const nextItem = conversations.pop()
        nextCursor = nextItem?.id
      }

      return { conversations, nextCursor }
    }),

  // ─── Get conversation by ID with messages ─────────────────────────────────
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        botId: z.string(),
        messageLimit: z.number().int().min(1).max(200).default(100),
        messageCursor: z.string().optional(),
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

      const conversation = await ctx.prisma.conversation.findUnique({
        where: { id: input.id },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: input.messageLimit + 1,
            ...(input.messageCursor && {
              cursor: { id: input.messageCursor },
              skip: 1,
            }),
          },
          orders: {
            orderBy: { createdAt: 'desc' },
          },
        },
      })

      if (!conversation || conversation.botId !== input.botId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Conversation not found',
        })
      }

      let nextMessageCursor: string | undefined
      if (conversation.messages.length > input.messageLimit) {
        const nextItem = conversation.messages.pop()
        nextMessageCursor = nextItem?.id
      }

      // Reverse messages to chronological order
      conversation.messages.reverse()

      return { conversation, nextMessageCursor }
    }),

  // ─── Get unanswered conversations ─────────────────────────────────────────
  getUnanswered: protectedProcedure
    .input(z.object({ botId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      const bot = await ctx.prisma.bot.findUnique({
        where: { id: input.botId },
      })
      if (!bot || bot.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
      }

      // Conversations where the last message is from the USER (not ASSISTANT)
      // and the conversation is not resolved
      const conversations = await ctx.prisma.conversation.findMany({
        where: {
          botId: input.botId,
          isResolved: false,
        },
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          _count: {
            select: { messages: true },
          },
        },
      })

      // Filter to only those where the last message is from USER
      const unanswered = conversations.filter(
        (c) => c.messages.length > 0 && c.messages[0].role === 'USER'
      )

      return unanswered
    }),

  // ─── Get operator queue (operatorMode=true) ─────────────────────────────
  getOperatorQueue: protectedProcedure
    .input(z.object({ botId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      const bot = await ctx.prisma.bot.findUnique({ where: { id: input.botId } })
      if (!bot || bot.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
      }

      return ctx.prisma.conversation.findMany({
        where: { botId: input.botId, operatorMode: true, isResolved: false },
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
          _count: { select: { messages: true } },
        },
      })
    }),

  // ─── Toggle operator mode ───────────────────────────────────────────────
  setOperatorMode: protectedProcedure
    .input(z.object({
      id: z.string(),
      botId: z.string(),
      operatorMode: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      const bot = await ctx.prisma.bot.findUnique({ where: { id: input.botId } })
      if (!bot || bot.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
      }

      return ctx.prisma.conversation.update({
        where: { id: input.id },
        data: { operatorMode: input.operatorMode },
      })
    }),

  // ─── Send operator message ──────────────────────────────────────────────
  sendOperatorMessage: protectedProcedure
    .input(z.object({
      conversationId: z.string(),
      botId: z.string(),
      content: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      const bot = await ctx.prisma.bot.findUnique({ where: { id: input.botId } })
      if (!bot || bot.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
      }

      const conversation = await ctx.prisma.conversation.findUnique({
        where: { id: input.conversationId },
      })
      if (!conversation || conversation.botId !== input.botId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Conversation not found' })
      }

      // Save operator message to DB
      const message = await ctx.prisma.message.create({
        data: {
          conversationId: input.conversationId,
          role: 'ASSISTANT',
          content: input.content,
          platform: conversation.platform,
          handedOff: true,
        },
      })

      // Send via Telegram
      if (bot.telegramToken && conversation.platform === 'telegram') {
        await fetch(`https://api.telegram.org/bot${bot.telegramToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: conversation.platformChatId,
            text: input.content,
          }),
        }).catch(() => {})
      }

      // Update conversation timestamp
      await ctx.prisma.conversation.update({
        where: { id: input.conversationId },
        data: { updatedAt: new Date() },
      })

      return message
    }),

  // ─── Resolve conversation ───────────────────────────────────────────────
  resolve: protectedProcedure
    .input(z.object({ id: z.string(), botId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      const bot = await ctx.prisma.bot.findUnique({ where: { id: input.botId } })
      if (!bot || bot.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
      }

      return ctx.prisma.conversation.update({
        where: { id: input.id },
        data: { isResolved: true, operatorMode: false },
      })
    }),
})
