import { NextRequest, NextResponse } from 'next/server'
import { handleWhatsAppWebhook, verifyWhatsAppWebhook } from '@/server/services/whatsapp-bot'
import { verifyWebhookSignature } from '@/lib/meta-oauth'

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'jovob-whatsapp-verify'

// GET: WhatsApp webhook verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode') ?? ''
  const token = searchParams.get('hub.verify_token') ?? ''
  const challenge = searchParams.get('hub.challenge') ?? ''

  const result = verifyWhatsAppWebhook(mode, token, challenge, VERIFY_TOKEN)

  if (result) {
    return new NextResponse(result, { status: 200 })
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 })
}

// POST: Incoming WhatsApp messages
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()

    // Verify webhook signature from Meta
    const signature = request.headers.get('x-hub-signature-256')
    const isValid = await verifyWebhookSignature(rawBody, signature)
    if (!isValid) {
      console.warn('[WhatsApp Webhook] Invalid signature, rejecting request')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const body = JSON.parse(rawBody) as { object?: string; entry?: unknown[] }

    if (body.object === 'whatsapp_business_account' && body.entry) {
      handleWhatsAppWebhook(body.entry as Parameters<typeof handleWhatsAppWebhook>[0]).catch(console.error)
    }

    return NextResponse.json({ status: 'ok' })
  } catch {
    return NextResponse.json({ status: 'ok' })
  }
}
