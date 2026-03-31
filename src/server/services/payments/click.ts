import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

const CLICK_MERCHANT_ID = process.env.CLICK_MERCHANT_ID ?? ''
const CLICK_SERVICE_ID = process.env.CLICK_SERVICE_ID ?? ''

/**
 * Generate Click payment link for an order.
 */
export function generateClickPaymentLink(orderId: string, amount: number): string {
  const params = new URLSearchParams({
    service_id: CLICK_SERVICE_ID,
    merchant_id: CLICK_MERCHANT_ID,
    amount: amount.toString(),
    transaction_param: orderId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
  })

  return `https://my.click.uz/services/pay?${params.toString()}`
}

/**
 * Handle Click webhook callback.
 * Click sends: prepare → complete flow.
 */
export async function handleClickWebhook(
  body: Record<string, string>
): Promise<{ error: number; error_note: string }> {
  const { click_trans_id, merchant_trans_id, amount, action, error: clickError } = body

  if (!merchant_trans_id) {
    return { error: -5, error_note: 'Order not found' }
  }

  const order = await prisma.order.findUnique({
    where: { id: merchant_trans_id },
    include: { bot: { select: { telegramToken: true } }, conversation: true },
  })

  if (!order) {
    return { error: -5, error_note: 'Order not found' }
  }

  if (Number(amount) !== Number(order.total)) {
    return { error: -2, error_note: 'Invalid amount' }
  }

  // Action 0 = prepare, Action 1 = complete
  if (action === '1' && clickError === '0') {
    await prisma.order.update({
      where: { id: merchant_trans_id },
      data: {
        paymentStatus: 'PAID',
        paymentMethod: 'click',
        paymentId: click_trans_id,
        status: 'CONFIRMED',
      },
    })

    // Notify customer via Telegram
    if (order.bot.telegramToken && order.conversation?.platformChatId) {
      await fetch(`https://api.telegram.org/bot${order.bot.telegramToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: order.conversation.platformChatId,
          text: `Оплата получена! Ваш заказ #${order.id.slice(-6)} подтверждён. Спасибо!`,
        }),
      }).catch(() => {})
    }

    logger.info('Click payment completed', { orderId: merchant_trans_id, amount })
  } else if (action === '0') {
    await prisma.order.update({
      where: { id: merchant_trans_id },
      data: { paymentStatus: 'PENDING', paymentMethod: 'click', paymentId: click_trans_id },
    })
  }

  return { error: 0, error_note: 'Success' }
}
