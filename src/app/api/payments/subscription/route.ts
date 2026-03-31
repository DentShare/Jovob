import { NextRequest, NextResponse } from 'next/server'
import { activateSubscription } from '@/server/services/subscription'

// Click callback for subscription payments
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') ?? ''

    if (contentType.includes('json')) {
      // Payme-style JSON-RPC
      const body = await request.json()
      if (body.method === 'PerformTransaction' && body.params?.id) {
        // Find payment by Payme transaction ID
        const { prisma } = await import('@/lib/prisma')
        const payment = await prisma.payment.findFirst({
          where: { externalId: body.params.id },
        })
        if (payment) {
          await activateSubscription(payment.id, 'payme')
        }
      }
      return NextResponse.json({ jsonrpc: '2.0', id: body.id, result: { state: 2 } })
    }

    // Click-style form data
    const formData = await request.formData()
    const action = formData.get('action') as string
    const merchantTransId = formData.get('merchant_trans_id') as string
    const error = formData.get('error') as string

    if (action === '1' && error === '0' && merchantTransId) {
      await activateSubscription(merchantTransId, 'click')
    }

    return NextResponse.json({ error: 0, error_note: 'Success' })
  } catch (error) {
    console.error('[Subscription Webhook] Error:', error)
    return NextResponse.json({ error: -1, error_note: 'Internal error' })
  }
}
