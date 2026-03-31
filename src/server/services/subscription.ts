import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { generateClickPaymentLink } from './payments/click'
import { generatePaymePaymentLink } from './payments/payme'

// Prices in UZS
const PLAN_PRICES: Record<string, number> = {
  STARTER: 65000,
  BUSINESS: 195000,
}

/**
 * Create a subscription payment and return payment links.
 */
export async function createSubscriptionPayment(
  userId: string,
  plan: 'STARTER' | 'BUSINESS'
): Promise<{ clickUrl: string; paymeUrl: string; paymentId: string }> {
  const price = PLAN_PRICES[plan]
  if (!price) throw new Error('Invalid plan')

  const payment = await prisma.payment.create({
    data: {
      userId,
      provider: 'pending',
      amount: price,
      currency: 'UZS',
      status: 'PENDING',
      description: `Подписка ${plan} — 30 дней`,
    },
  })

  const clickUrl = generateClickPaymentLink(payment.id, price)
  const paymeUrl = generatePaymePaymentLink(payment.id, price)

  return { clickUrl, paymeUrl, paymentId: payment.id }
}

/**
 * Activate subscription after payment.
 */
export async function activateSubscription(paymentId: string, provider: string): Promise<void> {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } })
  if (!payment || payment.status === 'COMPLETED') return

  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: 'COMPLETED', provider },
  })

  // Determine plan from amount
  let plan: 'STARTER' | 'BUSINESS' = 'STARTER'
  if (Number(payment.amount) >= PLAN_PRICES.BUSINESS) {
    plan = 'BUSINESS'
  }

  const now = new Date()
  const endDate = new Date(now.getTime() + 30 * 86400000)

  // Update user plan
  await prisma.user.update({
    where: { id: payment.userId },
    data: { plan, planExpiresAt: endDate },
  })

  // Create subscription record
  await prisma.subscription.create({
    data: {
      userId: payment.userId,
      plan,
      startDate: now,
      endDate,
      isActive: true,
    },
  })

  // Send notification
  await prisma.notification.create({
    data: {
      userId: payment.userId,
      type: 'subscription_activated',
      title: 'Подписка активирована',
      body: `Тариф ${plan} активен до ${endDate.toLocaleDateString('ru-RU')}`,
    },
  })

  logger.info('Subscription activated', { userId: payment.userId, plan, paymentId })
}

/**
 * Check and expire subscriptions.
 */
export async function checkExpiredSubscriptions(): Promise<number> {
  const now = new Date()

  // Find expired users
  const expired = await prisma.user.findMany({
    where: {
      plan: { not: 'FREE' },
      planExpiresAt: { lte: now },
    },
  })

  for (const user of expired) {
    await prisma.user.update({
      where: { id: user.id },
      data: { plan: 'FREE', planExpiresAt: null },
    })

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'subscription_expired',
        title: 'Подписка истекла',
        body: 'Ваш тариф переведён на бесплатный план. Повысьте тариф для продолжения.',
      },
    })
  }

  return expired.length
}
