import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createBotInstance, setupHandlers, getWebhookHandler } from '@/server/services/telegram-bot'

// ─── Telegram Webhook Handler ───────────────────────────────────────────────
// Receives updates from Telegram, identifies which bot by the botId
// in the URL search params or X-Bot-Id header, and processes the update.
//
// Webhook URL format: /api/telegram?botId=<botId>
// Alternative: /api/telegram with X-Bot-Id header
//
// The bot.ts router registers webhooks as:
//   ${APP_URL}/api/telegram?botId=${bot.id}

export async function POST(request: NextRequest) {
  try {
    // 1. Identify the bot
    const botId =
      request.nextUrl.searchParams.get('botId') ??
      request.headers.get('x-bot-id')

    if (!botId) {
      return NextResponse.json(
        { error: 'Missing botId parameter' },
        { status: 400 }
      )
    }

    // 2. Look up the bot in the database
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
      // Silently accept but don't process if bot is inactive
      return NextResponse.json({ ok: true, skipped: true })
    }

    if (!bot.telegramToken) {
      return NextResponse.json(
        { error: 'Bot has no Telegram token configured' },
        { status: 400 }
      )
    }

    // 3. Get or create the bot instance
    const botInstance = createBotInstance(bot.telegramToken, bot.id)

    // Set up handlers if not already done
    // grammY tracks whether init has been called, so this is safe to call multiple times
    if (!botInstance.isInited()) {
      setupHandlers(botInstance, bot.id)
      await botInstance.init()
    }

    // 4. Process the update through grammY's webhook handler
    const handler = getWebhookHandler(botInstance)
    return handler(request)
  } catch (error) {
    console.error('[Telegram Webhook] Error processing update:', error)

    // Always return 200 to Telegram to prevent retry storms
    // Log the error for debugging but don't expose details
    return NextResponse.json({ ok: true, error: 'Internal processing error' })
  }
}

// Telegram sends GET to verify webhook URL (optional health check)
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'BotUz Telegram Webhook',
    timestamp: new Date().toISOString(),
  })
}
