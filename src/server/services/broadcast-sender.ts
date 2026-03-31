import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

const BATCH_SIZE = 25
const BATCH_DELAY_MS = 1100

export async function sendBroadcast(broadcastId: string): Promise<void> {
  const broadcast = await prisma.broadcast.findUnique({
    where: { id: broadcastId },
    include: {
      bot: {
        select: {
          telegramToken: true,
          instagramAccessToken: true,
          instagramPageId: true,
          messengerPageId: true,
          whatsappAccessToken: true,
          whatsappPhoneId: true,
        },
      },
    },
  })

  if (!broadcast) {
    logger.error('Broadcast not found', { broadcastId })
    return
  }

  const targetPlatforms = broadcast.platforms ?? ['telegram']
  const filters = broadcast.filters as Record<string, unknown> | null

  // Collect all recipients across platforms
  let allRecipients: Array<{ platformChatId: string; platform: string; language: string | null }> = []

  for (const platform of targetPlatforms) {
    let recipients = await prisma.conversation.findMany({
      where: { botId: broadcast.botId, platform },
      select: { platformChatId: true, language: true },
      distinct: ['platformChatId'],
    })

    // Apply filters
    if (filters?.language) {
      recipients = recipients.filter((r) => r.language === filters.language)
    }
    if (filters?.activeDays) {
      const cutoff = new Date(Date.now() - Number(filters.activeDays) * 86400000)
      const activeChats = await prisma.conversation.findMany({
        where: { botId: broadcast.botId, platform, updatedAt: { gte: cutoff } },
        select: { platformChatId: true },
        distinct: ['platformChatId'],
      })
      const activeSet = new Set(activeChats.map((c) => c.platformChatId))
      recipients = recipients.filter((r) => activeSet.has(r.platformChatId))
    }

    allRecipients = allRecipients.concat(
      recipients.map((r) => ({ platformChatId: r.platformChatId, platform, language: r.language }))
    )
  }

  await prisma.broadcast.update({
    where: { id: broadcastId },
    data: { status: 'SENDING' },
  })

  let totalSent = 0
  let totalFailed = 0
  const bot = broadcast.bot

  // Send in batches
  for (let i = 0; i < allRecipients.length; i += BATCH_SIZE) {
    const batch = allRecipients.slice(i, i + BATCH_SIZE)

    const results = await Promise.allSettled(
      batch.map((r) => {
        switch (r.platform) {
          case 'telegram':
            return bot.telegramToken
              ? sendTelegramMessage(bot.telegramToken, r.platformChatId, broadcast.message, broadcast.imageUrl)
              : Promise.resolve(false)
          case 'instagram':
            return bot.instagramAccessToken
              ? sendMetaMessage(bot.instagramAccessToken, r.platformChatId, broadcast.message)
              : Promise.resolve(false)
          case 'messenger':
            return bot.instagramAccessToken
              ? sendMetaMessage(bot.instagramAccessToken, r.platformChatId, broadcast.message)
              : Promise.resolve(false)
          case 'whatsapp':
            return bot.whatsappAccessToken && bot.whatsappPhoneId
              ? sendWhatsAppBroadcast(bot.whatsappAccessToken, bot.whatsappPhoneId, r.platformChatId, broadcast.message)
              : Promise.resolve(false)
          default:
            return Promise.resolve(false)
        }
      })
    )

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        totalSent++
      } else {
        totalFailed++
      }
    }

    await prisma.broadcast.update({
      where: { id: broadcastId },
      data: { totalSent, totalFailed },
    })

    if (i + BATCH_SIZE < allRecipients.length) {
      await new Promise((r) => setTimeout(r, BATCH_DELAY_MS))
    }
  }

  await prisma.broadcast.update({
    where: { id: broadcastId },
    data: {
      status: totalFailed > totalSent ? 'FAILED' : 'COMPLETED',
      totalSent,
      totalFailed,
      sentAt: new Date(),
    },
  })

  logger.info('Broadcast completed', { broadcastId, totalSent, totalFailed })
}

// ─── Platform-specific send functions ──────────────────────────────────────

async function sendTelegramMessage(
  token: string,
  chatId: string,
  text: string,
  imageUrl?: string | null
): Promise<boolean> {
  try {
    if (imageUrl) {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, photo: imageUrl, caption: text }),
      })
      const data = (await res.json()) as { ok: boolean }
      return data.ok
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    })
    const data = (await res.json()) as { ok: boolean }
    return data.ok
  } catch {
    return false
  }
}

async function sendMetaMessage(
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
    return !data.error
  } catch {
    return false
  }
}

async function sendWhatsAppBroadcast(
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
    return !data.error
  } catch {
    return false
  }
}
