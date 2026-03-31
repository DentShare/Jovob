import { prisma } from '@/lib/prisma'
import { processMessage } from './ai-engine'
import { logger } from '@/lib/logger'

// ─── WhatsApp Cloud API Message Handling ─────────────────────────────────────

interface WhatsAppWebhookEntry {
  id: string
  changes: Array<{
    value: {
      messaging_product: string
      metadata: { phone_number_id: string; display_phone_number: string }
      contacts?: Array<{ profile: { name: string }; wa_id: string }>
      messages?: Array<{
        id: string
        from: string
        timestamp: string
        type: string
        text?: { body: string }
      }>
      statuses?: Array<{ id: string; status: string }>
    }
    field: string
  }>
}

/**
 * Process incoming WhatsApp webhook events.
 */
export async function handleWhatsAppWebhook(
  entries: WhatsAppWebhookEntry[]
): Promise<void> {
  for (const entry of entries) {
    for (const change of entry.changes) {
      if (change.field !== 'messages') continue
      const { value } = change

      if (!value.messages) continue

      for (const msg of value.messages) {
        if (msg.type !== 'text' || !msg.text?.body) continue

        try {
          const phoneNumberId = value.metadata.phone_number_id

          // Find bot by WhatsApp phone ID
          const bot = await prisma.bot.findFirst({
            where: { whatsappPhoneId: phoneNumberId, isActive: true },
            select: { id: true, whatsappAccessToken: true },
          })

          if (!bot) {
            logger.warn('WhatsApp bot not found', { phoneNumberId })
            continue
          }

          const senderId = msg.from
          const text = msg.text.body
          const contactName = value.contacts?.[0]?.profile?.name ?? null

          // Upsert customer
          prisma.customer.upsert({
            where: { botId_platformChatId_platform: { botId: bot.id, platformChatId: senderId, platform: 'whatsapp' } },
            create: { botId: bot.id, platformChatId: senderId, platform: 'whatsapp', name: contactName, phone: senderId },
            update: { lastContact: new Date(), ...(contactName && { name: contactName }) },
          }).catch(() => {})

          // Check operator mode
          const existingConv = await prisma.conversation.findFirst({
            where: { botId: bot.id, platformChatId: senderId, platform: 'whatsapp', isResolved: false },
            orderBy: { updatedAt: 'desc' },
          })

          if (existingConv?.operatorMode) {
            await prisma.message.create({
              data: { conversationId: existingConv.id, role: 'USER', content: text, platform: 'whatsapp' },
            })
            await prisma.conversation.update({ where: { id: existingConv.id }, data: { updatedAt: new Date() } })
            continue
          }

          // Process through AI
          const result = await processMessage(bot.id, senderId, 'whatsapp', text, contactName)

          // Send reply via WhatsApp Cloud API
          if (bot.whatsappAccessToken) {
            const visibleResponse = result.response.replace(/```order\s*\n?[\s\S]*?```/g, '').trim()
            if (visibleResponse) {
              await sendWhatsAppMessage(bot.whatsappAccessToken, phoneNumberId, senderId, visibleResponse)
            }
          }
        } catch (error) {
          logger.error('WhatsApp webhook processing error', { error: String(error) })
        }
      }
    }
  }
}

/**
 * Send a text message via WhatsApp Cloud API.
 */
async function sendWhatsAppMessage(
  accessToken: string,
  phoneNumberId: string,
  to: string,
  text: string
): Promise<boolean> {
  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: text },
        }),
      }
    )
    const data = (await res.json()) as { error?: { message: string } }
    if (data.error) {
      logger.error('WhatsApp send error', { error: data.error.message })
      return false
    }
    return true
  } catch {
    return false
  }
}

/**
 * Send an interactive message with buttons via WhatsApp.
 */
export async function sendWhatsAppInteractive(
  accessToken: string,
  phoneNumberId: string,
  to: string,
  bodyText: string,
  buttons: Array<{ id: string; title: string }>
): Promise<boolean> {
  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: bodyText },
            action: {
              buttons: buttons.slice(0, 3).map((b) => ({
                type: 'reply',
                reply: { id: b.id, title: b.title.slice(0, 20) },
              })),
            },
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
 * Verify WhatsApp webhook subscription.
 */
export function verifyWhatsAppWebhook(
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
