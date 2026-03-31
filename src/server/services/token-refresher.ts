import { prisma } from '@/lib/prisma'
import { refreshLongLivedToken } from '@/lib/meta-oauth'
import { logger } from '@/lib/logger'

/**
 * Refresh Meta tokens that expire within 7 days.
 * Called from the daily cron job.
 */
export async function refreshExpiringTokens(): Promise<{
  total: number
  refreshed: number
  failed: number
}> {
  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

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
      logger.info('Meta token refreshed', { botId: bot.id })
    } else {
      failed++
      logger.warn('Failed to refresh Meta token', { botId: bot.id })
    }
  }

  logger.info('Token refresh completed', {
    total: botsToRefresh.length,
    refreshed,
    failed,
  })

  return { total: botsToRefresh.length, refreshed, failed }
}
