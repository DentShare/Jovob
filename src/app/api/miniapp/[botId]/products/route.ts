import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  const { botId } = await params

  const products = await prisma.product.findMany({
    where: { botId, inStock: true },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      name: true,
      nameUz: true,
      description: true,
      price: true,
      currency: true,
      category: true,
      imageUrl: true,
      inStock: true,
    },
  })

  return NextResponse.json({
    products: products.map((p) => ({ ...p, price: Number(p.price) })),
  })
}
