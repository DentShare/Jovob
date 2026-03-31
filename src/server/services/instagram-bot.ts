import { prisma } from '@/lib/prisma'
import { processMessage } from './ai-engine'
import { logger } from '@/lib/logger'

// ─── Instagram Graph API Message Handling ────────────────────────────────────

interface InstagramWebhookEntry {
  id: string
  time: number
  messaging?: InstagramMessagingEvent[]
}

interface InstagramMessagingEvent {
  sender: { id: string }
  recipient: { id: string }
  timestamp: number
  message?: {
    mid: string
    text?: string
    attachments?: Array<{ type: string; payload: { url: string } }>
  }
}

/**
 * Process incoming Instagram webhook events.
 */
export async function handleInstagramWebhook(
  entries: InstagramWebhookEntry[]
): Promise<void> {
  for (const entry of entries) {
    if (!entry.messaging) continue

    for (const event of entry.messaging) {
      if (!event.message?.text) continue

      try {
        // Find bot by Instagram page ID
        const bot = await prisma.bot.findFirst({
          where: { instagramPageId: entry.id, isActive: true },
          select: { id: true, instagramPageId: true, instagramAccessToken: true },
        })

        if (!bot) {
          logger.warn('Instagram bot not found for page', { pageId: entry.id })
          continue
        }

        const senderId = event.sender.id
        const text = event.message.text

        // Upsert customer
        prisma.customer.upsert({
          where: { botId_platformChatId_platform: { botId: bot.id, platformChatId: senderId, platform: 'instagram' } },
          create: { botId: bot.id, platformChatId: senderId, platform: 'instagram' },
          update: { lastContact: new Date() },
        }).catch(() => {})

        // Check operator mode
        const existingConv = await prisma.conversation.findFirst({
          where: { botId: bot.id, platformChatId: senderId, platform: 'instagram', isResolved: false },
          orderBy: { updatedAt: 'desc' },
        })

        if (existingConv?.operatorMode) {
          await prisma.message.create({
            data: { conversationId: existingConv.id, role: 'USER', content: text, platform: 'instagram' },
          })
          await prisma.conversation.update({ where: { id: existingConv.id }, data: { updatedAt: new Date() } })
          continue
        }

        // Process through AI
        const result = await processMessage(bot.id, senderId, 'instagram', text)

        // Send reply via Instagram Graph API
        if (bot.instagramAccessToken) {
          const visibleResponse = result.response.replace(/```order\s*\n?[\s\S]*?```/g, '').trim()
          if (visibleResponse) {
            await sendInstagramMessage(bot.instagramAccessToken, senderId, visibleResponse)
          }
        }
      } catch (error) {
        logger.error('Instagram webhook processing error', { error: String(error) })
      }
    }
  }
}

/**
 * Send a message via Instagram Graph API.
 */
async function sendInstagramMessage(
  accessToken: string,
  recipientId: string,
  text: string
): Promise<boolean> {
  try {
    const res = await fetch('https://graph.facebook.com/v21.0/me/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text },
      }),
    })
    const data = (await res.json()) as { error?: { message: string } }
    if (data.error) {
      logger.error('Instagram send error', { error: data.error.message })
      return false
    }
    return true
  } catch {
    return false
  }
}

/**
 * Verify Instagram webhook subscription.
 */
export function verifyInstagramWebhook(
  mode: string,
  token: string,
  challenge: string,
  verifyToken: string
): string | null {
  if (mode === 'subscribe' && token === verifyToken) {
    return challenge
  }
  return null
}
