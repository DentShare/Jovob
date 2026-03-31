import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { refreshLongLivedToken } from '@/lib/meta-oauth'
import { logger } from '@/lib/logger'

/**
 * Cron job: Refresh Meta tokens that expire within 7 days.
 * Should be called daily via external cron (e.g., Vercel Cron, Railway Cron).
 *
 * GET /api/cron/refresh-tokens?key=CRON_SECRET
 */
export async function GET(request: Request) {
  // Simple auth for cron endpoint
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')
  if (key !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  // Find bots with tokens expiring within 7 days
  const botsToRefresh = await prisma.bot.findMany({
    where: {
      metaUserToken: { not: null },
      metaTokenExpiresAt: {
        not: null,
        lte: sevenDaysFromNow,
      },
    },
    select: {
      id: true,
      metaUserToken: true,
    },
  })

  let refreshed = 0
  let failed = 0

  for (const bot of botsToRefresh) {
    if (!bot.metaUserToken) continue

    const result = await refreshLongLivedToken(bot.metaUserToken)
    if (result) {
      await prisma.bot.update({
        where: { id: bot.id },
        data: {
          metaUserToken: result.token,
          metaTokenExpiresAt: new Date(Date.now() + result.expiresIn * 1000),
        },
      })
      refreshed++
    } else {
      failed++
      logger.warn('Failed to refresh Meta token', { botId: bot.id })
    }
  }

  logger.info('Token refresh cron completed', {
    total: botsToRefresh.length,
    refreshed,
    failed,
  })

  return NextResponse.json({
    total: botsToRefresh.length,
    refreshed,
    failed,
  })
}
