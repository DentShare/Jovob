import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

const PAYME_MERCHANT_ID = process.env.PAYME_MERCHANT_ID ?? ''

/**
 * Generate Payme payment link for an order.
 * Amount is in tiyin (1 UZS = 100 tiyin).
 */
export function generatePaymePaymentLink(orderId: string, amountUZS: number): string {
  const amountTiyin = amountUZS * 100
  const params = Buffer.from(
    `m=${PAYME_MERCHANT_ID};ac.order_id=${orderId};a=${amountTiyin}`
  ).toString('base64')

  return `https://checkout.paycom.uz/${params}`
}

interface PaymeRequest {
  method: string
  params: Record<string, unknown>
  id: number
}

/**
 * Handle Payme JSON-RPC webhook.
 */
export async function handlePaymeWebhook(
  body: PaymeRequest
): Promise<Record<string, unknown>> {
  const { method, params, id } = body

  switch (method) {
    case 'CheckPerformTransaction': {
      const orderId = (params.account as Record<string, string>)?.order_id
      if (!orderId) {
        return jsonRpcError(id, -31050, 'Order not found')
      }

      const order = await prisma.order.findUnique({ where: { id: orderId } })
      if (!order) {
        return jsonRpcError(id, -31050, 'Order not found')
      }

      if (order.paymentStatus === 'PAID') {
        return jsonRpcError(id, -31051, 'Already paid')
      }

      const amountTiyin = Number(params.amount)
      if (amountTiyin !== Number(order.total) * 100) {
        return jsonRpcError(id, -31001, 'Invalid amount')
      }

      return { jsonrpc: '2.0', id, result: { allow: true } }
    }

    case 'CreateTransaction': {
      const orderId = (params.account as Record<string, string>)?.order_id
      const transId = params.id as string

      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'PENDING', paymentMethod: 'payme', paymentId: transId },
      })

      return {
        jsonrpc: '2.0',
        id,
        result: {
          create_time: Date.now(),
          transaction: transId,
          state: 1,
        },
      }
    }

    case 'PerformTransaction': {
      const transId = params.id as string
      const order = await prisma.order.findFirst({
        where: { paymentId: transId },
        include: { bot: { select: { telegramToken: true } }, conversation: true },
      })

      if (!order) {
        return jsonRpcError(id, -31003, 'Transaction not found')
      }

      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'PAID', status: 'CONFIRMED' },
      })

      // Notify customer
      if (order.bot.telegramToken && order.conversation?.platformChatId) {
        await fetch(`https://api.telegram.org/bot${order.bot.telegramToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: order.conversation.platformChatId,
            text: `Оплата через Payme получена! Заказ #${order.id.slice(-6)} подтверждён.`,
          }),
        }).catch(() => {})
      }

      logger.info('Payme payment completed', { orderId: order.id, transId })

      return {
        jsonrpc: '2.0',
        id,
        result: { transaction: transId, perform_time: Date.now(), state: 2 },
      }
    }

    case 'CancelTransaction': {
      const transId = params.id as string
      const order = await prisma.order.findFirst({ where: { paymentId: transId } })

      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'FAILED' },
        })
      }

      return {
        jsonrpc: '2.0',
        id,
        result: { transaction: transId, cancel_time: Date.now(), state: -1 },
      }
    }

    default:
      return jsonRpcError(id, -32601, 'Method not found')
  }
}

function jsonRpcError(id: number, code: number, message: string) {
  return { jsonrpc: '2.0', id, error: { code, message: { ru: message, uz: message, en: message } } }
}
