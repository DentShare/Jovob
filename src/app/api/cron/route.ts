import { NextRequest, NextResponse } from 'next/server'
import { processOnboardingMessages } from '@/server/services/onboarding'
import { checkExpiredSubscriptions } from '@/server/services/subscription'
import { refreshExpiringTokens } from '@/server/services/token-refresher'

const CRON_SECRET = process.env.CRON_SECRET ?? ''

/**
 * Daily cron endpoint.
 * Call via external scheduler (Railway cron, Vercel cron, or curl).
 * Authorization via CRON_SECRET header.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [onboardingSent, expiredCount, tokenRefreshResult] = await Promise.all([
      processOnboardingMessages(),
      checkExpiredSubscriptions(),
      refreshExpiringTokens(),
    ])

    return NextResponse.json({
      status: 'ok',
      onboardingSent,
      expiredSubscriptions: expiredCount,
      tokensRefreshed: tokenRefreshResult.refreshed,
      tokensRefreshFailed: tokenRefreshResult.failed,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Cron] Error:', error)
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}
