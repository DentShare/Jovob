import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { exportOrdersToExcel, exportCustomersToCSV, exportDialogsToText } from '@/lib/export'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as any).id as string
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const botId = searchParams.get('botId')

  if (!type || !botId) {
    return NextResponse.json({ error: 'Missing type or botId' }, { status: 400 })
  }

  // Verify bot ownership
  const bot = await prisma.bot.findUnique({ where: { id: botId } })
  if (!bot || bot.userId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (type === 'orders') {
    const orders = await prisma.order.findMany({
      where: { botId },
      orderBy: { createdAt: 'desc' },
    })

    const data = orders.map((o) => ({
      id: o.id,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      total: Number(o.total),
      currency: o.currency,
      status: o.status,
      items: JSON.stringify(o.items),
      deliveryAddress: o.deliveryAddress,
      createdAt: o.createdAt,
    }))

    const buffer = exportOrdersToExcel(data)

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="orders-${botId}.xlsx"`,
      },
    })
  }

  if (type === 'customers') {
    const customers = await prisma.customer.findMany({
      where: { botId },
      orderBy: { lastContact: 'desc' },
    })

    const csv = exportCustomersToCSV(
      customers.map((c) => ({
        ...c,
        totalSpent: Number(c.totalSpent),
      }))
    )

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="customers-${botId}.csv"`,
      },
    })
  }

  if (type === 'dialogs') {
    const conversations = await prisma.conversation.findMany({
      where: { botId },
      orderBy: { updatedAt: 'desc' },
      take: 100,
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
        _count: { select: { messages: true } },
      },
    })

    const text = exportDialogsToText(
      conversations.map((c) => ({
        customerName: c.customerName,
        platform: c.platform,
        messagesCount: c._count.messages,
        isResolved: c.isResolved,
        messages: c.messages,
      }))
    )

    return new NextResponse(text, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="dialogs-${botId}.txt"`,
      },
    })
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
}
