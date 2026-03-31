import { NextRequest, NextResponse } from 'next/server'
import { handleClickWebhook } from '@/server/services/payments/click'

export async function POST(request: NextRequest) {
  try {
    const body = Object.fromEntries(await request.formData()) as Record<string, string>
    const result = await handleClickWebhook(body)
    return NextResponse.json(result)
  } catch (error) {
    console.error('[Click Webhook] Error:', error)
    return NextResponse.json({ error: -1, error_note: 'Internal error' })
  }
}
