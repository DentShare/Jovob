import { NextRequest, NextResponse } from 'next/server'
import { handlePaymeWebhook } from '@/server/services/payments/payme'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = await handlePaymeWebhook(body)
    return NextResponse.json(result)
  } catch (error) {
    console.error('[Payme Webhook] Error:', error)
    return NextResponse.json({
      jsonrpc: '2.0',
      id: 0,
      error: { code: -32400, message: 'Internal error' },
    })
  }
}
