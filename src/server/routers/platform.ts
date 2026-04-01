import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from '../trpc'
import {
  exchangeForLongLivedToken,
  getUserPages,
  subscribePageToWebhook,
  getWhatsAppBusinessInfo,
} from '@/lib/meta-oauth'

export const platformRouter = router({
  // ─── Get available platforms status for a bot ─────────────────────────────
  getStatus: protectedProcedure
    .input(z.object({ botId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      const bot = await ctx.prisma.bot.findUnique({
        where: { id: input.botId },
        select: {
          userId: true,
          telegramToken: true,
          telegramBotName: true,
          instagramPageId: true,
          instagramAccountId: true,
          messengerPageId: true,
          messengerPageName: true,
          whatsappPhoneId: true,
          whatsappPhoneNumber: true,
        },
      })

      if (!bot || bot.userId !== userId) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      return {
        telegram: {
          connected: !!bot.telegramToken,
          name: bot.telegramBotName,
        },
        instagram: {
          connected: !!bot.instagramPageId && !!bot.instagramAccountId,
          accountId: bot.instagramAccountId,
        },
        messenger: {
          connected: !!bot.messengerPageId,
          pageName: bot.messengerPageName,
        },
        whatsapp: {
          connected: !!bot.whatsappPhoneId,
          phoneNumber: bot.whatsappPhoneNumber,
        },
      }
    }),

  // ─── Connect Instagram + Messenger via Meta OAuth ────────────────────────
  connectMeta: protectedProcedure
    .input(
      z.object({
        botId: z.string(),
        accessToken: z.string(), // Short-lived token from Facebook Login JS SDK
        selectedPageId: z.string(),
        connectInstagram: z.boolean().default(true),
        connectMessenger: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      const bot = await ctx.prisma.bot.findUnique({
        where: { id: input.botId },
      })
      if (!bot || bot.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      // Exchange for long-lived token
      const longLived = await exchangeForLongLivedToken(input.accessToken)
      if (!longLived) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Failed to exchange token. Please try again.',
        })
      }

      // Get user's pages
      const pages = await getUserPages(longLived.token)
      const selectedPage = pages.find((p) => p.pageId === input.selectedPageId)
      if (!selectedPage) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Selected page not found. Make sure you granted access.',
        })
      }

      // Subscribe page to webhooks
      const fields = ['messages', 'messaging_postbacks', 'messaging_optins']
      await subscribePageToWebhook(
        selectedPage.pageId,
        selectedPage.pageAccessToken,
        fields
      )

      // Build update data
      const updateData: Record<string, unknown> = {
        metaUserToken: longLived.token,
        metaTokenExpiresAt: new Date(
          Date.now() + longLived.expiresIn * 1000
        ),
        instagramAccessToken: selectedPage.pageAccessToken,
      }

      if (input.connectInstagram && selectedPage.instagramAccountId) {
        updateData.instagramPageId = selectedPage.pageId
        updateData.instagramAccountId = selectedPage.instagramAccountId
      }

      if (input.connectMessenger) {
        updateData.messengerPageId = selectedPage.pageId
        updateData.messengerPageName = selectedPage.pageName
      }

      // Activate bot if not active
      updateData.isActive = true

      const updated = await ctx.prisma.bot.update({
        where: { id: input.botId },
        data: updateData,
      })

      return {
        instagram: input.connectInstagram && !!selectedPage.instagramAccountId,
        messenger: input.connectMessenger,
        pageName: selectedPage.pageName,
        instagramAccountId: selectedPage.instagramAccountId,
      }
    }),

  // ─── Connect WhatsApp via Embedded Signup ──────────────────────────────────
  connectWhatsApp: protectedProcedure
    .input(
      z.object({
        botId: z.string(),
        accessToken: z.string(),
        wabaId: z.string(), // WhatsApp Business Account ID from Embedded Signup
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      const bot = await ctx.prisma.bot.findUnique({
        where: { id: input.botId },
      })
      if (!bot || bot.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      // Exchange for long-lived token
      const longLived = await exchangeForLongLivedToken(input.accessToken)
      if (!longLived) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Failed to exchange token.',
        })
      }

      // Get WhatsApp phone number info
      const waInfo = await getWhatsAppBusinessInfo(longLived.token, input.wabaId)
      if (!waInfo) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Failed to get WhatsApp business info.',
        })
      }

      const updated = await ctx.prisma.bot.update({
        where: { id: input.botId },
        data: {
          whatsappBusinessId: input.wabaId,
          whatsappPhoneId: waInfo.phoneNumberId,
          whatsappPhoneNumber: waInfo.displayPhoneNumber,
          whatsappAccessToken: longLived.token,
          metaUserToken: longLived.token,
          metaTokenExpiresAt: new Date(
            Date.now() + longLived.expiresIn * 1000
          ),
          isActive: true,
        },
      })

      return {
        phoneNumber: waInfo.displayPhoneNumber,
        phoneNumberId: waInfo.phoneNumberId,
      }
    }),

  // ─── Disconnect a platform ─────────────────────────────────────────────────
  disconnect: protectedProcedure
    .input(
      z.object({
        botId: z.string(),
        platform: z.enum(['instagram', 'messenger', 'whatsapp']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      const bot = await ctx.prisma.bot.findUnique({
        where: { id: input.botId },
      })
      if (!bot || bot.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      const clearData: Record<string, unknown> = {}

      switch (input.platform) {
        case 'instagram':
          clearData.instagramPageId = null
          clearData.instagramAccountId = null
          clearData.instagramAccessToken = null
          // If Messenger also uses this token and is still connected, keep it
          if (bot.messengerPageId) {
            delete clearData.instagramAccessToken
          }
          break
        case 'messenger':
          clearData.messengerPageId = null
          clearData.messengerPageName = null
          // Clear shared token only if Instagram is also disconnected
          if (!bot.instagramPageId) {
            clearData.instagramAccessToken = null
          }
          break
        case 'whatsapp':
          clearData.whatsappBusinessId = null
          clearData.whatsappPhoneId = null
          clearData.whatsappPhoneNumber = null
          clearData.whatsappAccessToken = null
          break
      }

      await ctx.prisma.bot.update({
        where: { id: input.botId },
        data: clearData,
      })

      return { success: true }
    }),

  // ─── Get user's Meta pages (for connection UI) ────────────────────────────
  getMetaPages: protectedProcedure
    .input(z.object({ accessToken: z.string() }))
    .mutation(async ({ input }) => {
      const longLived = await exchangeForLongLivedToken(input.accessToken)
      if (!longLived) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid access token.',
        })
      }

      const pages = await getUserPages(longLived.token)
      return {
        pages: pages.map((p) => ({
          pageId: p.pageId,
          pageName: p.pageName,
          hasInstagram: !!p.instagramAccountId,
          instagramAccountId: p.instagramAccountId,
        })),
        longLivedToken: longLived.token,
      }
    }),
})
