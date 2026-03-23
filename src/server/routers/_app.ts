import { router } from '../trpc'
import { botRouter } from './bot'
import { productRouter } from './product'
import { serviceRouter } from './service'
import { faqRouter } from './faq'
import { orderRouter } from './order'
import { bookingRouter } from './booking'
import { conversationRouter } from './conversation'
import { wizardRouter } from './wizard'
import { userRouter } from './user'
import { notificationRouter } from './notification'
import { broadcastRouter } from './broadcast'

export const appRouter = router({
  bot: botRouter,
  product: productRouter,
  service: serviceRouter,
  faq: faqRouter,
  order: orderRouter,
  booking: bookingRouter,
  conversation: conversationRouter,
  wizard: wizardRouter,
  user: userRouter,
  notification: notificationRouter,
  broadcast: broadcastRouter,
})

export type AppRouter = typeof appRouter
