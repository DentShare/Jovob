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
import { customerRouter } from './customer'
import { analyticsRouter } from './analytics'
import { platformRouter } from './platform'

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
  customer: customerRouter,
  analytics: analyticsRouter,
  platform: platformRouter,
})

export type AppRouter = typeof appRouter
