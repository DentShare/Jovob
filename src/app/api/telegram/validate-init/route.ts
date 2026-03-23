import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

// Validate Telegram Mini App initData
// https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app

export async function POST(request: NextRequest) {
  const { initData } = await request.json()
  if (!initData) return NextResponse.json({ error: 'Missing initData' }, { status: 400 })

  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 })

  // Parse initData
  const params = new URLSearchParams(initData)
  const hash = params.get('hash')
  params.delete('hash')

  // Sort and build data-check-string
  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n')

  // Validate HMAC
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest()
  const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

  if (computedHash !== hash) {
    return NextResponse.json({ error: 'Invalid hash' }, { status: 401 })
  }

  // Check auth_date (not older than 24 hours)
  const authDate = parseInt(params.get('auth_date') || '0')
  if (Date.now() / 1000 - authDate > 86400) {
    return NextResponse.json({ error: 'Data expired' }, { status: 401 })
  }

  // Extract user
  const userData = JSON.parse(params.get('user') || '{}')

  // Find or create user
  let user = await prisma.user.findUnique({ where: { telegramId: BigInt(userData.id) } })
  if (!user) {
    user = await prisma.user.create({
      data: {
        telegramId: BigInt(userData.id),
        name: [userData.first_name, userData.last_name].filter(Boolean).join(' '),
        language: userData.language_code === 'uz' ? 'uz' : 'ru',
      },
    })
  }

  return NextResponse.json({
    valid: true,
    userId: user.id,
    name: user.name,
  })
}
