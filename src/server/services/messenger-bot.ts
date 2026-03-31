import { prisma } from '@/lib/prisma'
import { processMessage } from './ai-engine'
import { logger } from '@/lib/logger'

// ─── Facebook Messenger Message Handling ─────────────────────────────────────

interface MessengerWebhookEntry {
  id: string
  time: number
  messaging?: MessengerMessagingEvent[]
}

interface MessengerMessagingEvent {
  sender: { id: string }
  recipient: { id: string }
  timestamp: number
  message?: {
    mid: string
    text?: string
    attachments?: Array<{ type: string; payload: { url: string } }>
    quick_reply?: { payload: string }
  }
  postback?: {
    title: string
    payload: string
  }
}

/**
 * Process incoming Messenger webhook events.
 */
export async function handleMessengerWebhook(
  entries: MessengerWebhookEntry[]
): Promise<void> {
  for (const entry of entries) {
    if (!entry.messaging) continue

    for (const event of entry.messaging) {
      try {
        // Handle text messages
        const text = event.message?.text ?? event.postback?.payload
        if (!text) continue

        const pageId = entry.id

        // Find bot by Messenger page ID
        const bot = await prisma.bot.findFirst({
          where: { messengerPageId: pageId, isActive: true },
          select: { id: true, instagramAccessToken: true, messengerPageId: true },
        })

        if (!bot) {
          logger.warn('Messenger bot not found for page', { pageId })
          continue
        }

        const senderId = event.sender.id

        // Upsert customer
        prisma.customer.upsert({
          where: {
            botId_platformChatId_platform: {
              botId: bot.id,
              platformChatId: senderId,
              platform: 'messenger',
            },
          },
          create: {
            botId: bot.id,
            platformChatId: senderId,
            platform: 'messenger',
          },
          update: { lastContact: new Date() },
        }).catch(() => {})

        // Check operator mode
        const existingConv = await prisma.conversation.findFirst({
          where: {
            botId: bot.id,
            platformChatId: senderId,
            platform: 'messenger',
            isResolved: false,
          },
          orderBy: { updatedAt: 'desc' },
        })

        if (existingConv?.operatorMode) {
          await prisma.message.create({
            data: {
              conversationId: existingConv.id,
              role: 'USER',
              content: text,
              platform: 'messenger',
            },
          })
          await prisma.conversation.update({
            where: { id: existingConv.id },
            data: { updatedAt: new Date() },
          })
          continue
        }

        // Process through AI
        const result = await processMessage(bot.id, senderId, 'messenger', text)

        // Send reply via Messenger Send API (uses Page Access Token)
        const accessToken = await getMessengerAccessToken(bot.id)
        if (accessToken) {
          const visibleResponse = result.response
            .replace(/```order\s*\n?[\s\S]*?```/g, '')
            .trim()
          if (visibleResponse) {
            await sendMessengerMessage(accessToken, senderId, visibleResponse)
          }
        }
      } catch (error) {
        logger.error('Messenger webhook processing error', {
          error: String(error),
        })
      }
    }
  }
}

/**
 * Send a message via Messenger Send API.
 */
async function sendMessengerMessage(
  accessToken: string,
  recipientId: string,
  text: string
): Promise<boolean> {
  try {
    const res = await fetch(
      'https://graph.facebook.com/v21.0/me/messages',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text },
        }),
      }
    )
    const data = (await res.json()) as { error?: { message: string } }
    if (data.error) {
      logger.error('Messenger send error', { error: data.error.message })
      return false
    }
    return true
  } catch {
    return false
  }
}

/**
 * Send a message with quick reply buttons.
 */
export async function sendMessengerQuickReply(
  accessToken: string,
  recipientId: string,
  text: string,
  buttons: Array<{ title: string; payload: string }>
): Promise<boolean> {
  try {
    const res = await fetch(
      'https://graph.facebook.com/v21.0/me/messages',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: {
            text,
            quick_replies: buttons.map((b) => ({
              content_type: 'text',
              title: b.title,
              payload: b.payload,
            })),
          },
        }),
      }
    )
    const data = (await res.json()) as { error?: { message: string } }
    return !data.error
  } catch {
    return false
  }
}

/**
 * Get Messenger access token for a bot.
 * Messenger uses the same Page Access Token as Instagram (if same page).
 */
async function getMessengerAccessToken(botId: string): Promise<string | null> {
  const bot = await prisma.bot.findUnique({
    where: { id: botId },
    select: { instagramAccessToken: true },
  })
  return bot?.instagramAccessToken ?? null
}

/**
 * Verify Messenger webhook subscription.
 */
export function verifyMessengerWebhook(
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
