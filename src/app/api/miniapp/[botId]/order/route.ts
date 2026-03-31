import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  const { botId } = await params

  try {
    const body = await request.json()
    const { items, total, customerName, customerPhone, deliveryAddress } = body

    if (!items?.length || !customerPhone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const order = await prisma.order.create({
      data: {
        botId,
        items,
        total,
        currency: 'UZS',
        customerName,
        customerPhone,
        deliveryAddress,
        notes: 'Mini App order',
      },
    })

    return NextResponse.json({ orderId: order.id, success: true })
  } catch (error) {
    console.error('[MiniApp Order] Error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
