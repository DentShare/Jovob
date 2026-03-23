import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createBotInstance, setupHandlers, getWebhookHandler } from '@/server/services/telegram-bot'

// ─── Dynamic Telegram Webhook Handler ───────────────────────────────────────
// URL format: /api/telegram/{botId}
// This matches the webhook URL registered in bot.ts router:
//   `${APP_URL}/api/telegram/${bot.id}`

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  try {
    const { botId } = await params

    if (!botId) {
      return NextResponse.json(
        { error: 'Missing botId parameter' },
        { status: 400 }
      )
    }

    // Look up the bot in the database
    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      select: {
        id: true,
        telegramToken: true,
        isActive: true,
      },
    })

    if (!bot) {
      return NextResponse.json(
        { error: 'Bot not found' },
        { status: 404 }
      )
    }

    if (!bot.isActive) {
      return NextResponse.json({ ok: true, skipped: true })
    }

    if (!bot.telegramToken) {
      return NextResponse.json(
        { error: 'Bot has no Telegram token configured' },
        { status: 400 }
      )
    }

    // Get or create the bot instance with handlers
    const botInstance = createBotInstance(bot.telegramToken, bot.id)

    if (!botInstance.isInited()) {
      setupHandlers(botInstance, bot.id)
      await botInstance.init()
    }

    // Process the update through grammY
    const handler = getWebhookHandler(botInstance)
    return handler(request)
  } catch (error) {
    console.error('[Telegram Webhook] Error processing update:', error)
    // Always return 200 to Telegram to prevent retry storms
    return NextResponse.json({ ok: true, error: 'Internal processing error' })
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  const { botId } = await params
  return NextResponse.json({
    status: 'ok',
    botId,
    service: 'Jovob Telegram Webhook',
    timestamp: new Date().toISOString(),
  })
}
