import { NextRequest, NextResponse } from 'next/server'
import { handleInstagramWebhook, verifyInstagramWebhook } from '@/server/services/instagram-bot'
import { verifyWebhookSignature } from '@/lib/meta-oauth'

const VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN || 'jovob-instagram-verify'

// GET: Facebook webhook verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode') ?? ''
  const token = searchParams.get('hub.verify_token') ?? ''
  const challenge = searchParams.get('hub.challenge') ?? ''

  const result = verifyInstagramWebhook(mode, token, challenge, VERIFY_TOKEN)

  if (result) {
    return new NextResponse(result, { status: 200 })
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 })
}

// POST: Incoming Instagram messages
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()

    // Verify webhook signature from Meta
    const signature = request.headers.get('x-hub-signature-256')
    const isValid = await verifyWebhookSignature(rawBody, signature)
    if (!isValid && process.env.META_APP_SECRET) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const body = JSON.parse(rawBody) as { object?: string; entry?: unknown[] }

    if (body.object === 'instagram' && body.entry) {
      handleInstagramWebhook(body.entry as Parameters<typeof handleInstagramWebhook>[0]).catch(console.error)
    }

    // Always return 200 to Facebook
    return NextResponse.json({ status: 'ok' })
  } catch {
    return NextResponse.json({ status: 'ok' })
  }
}
