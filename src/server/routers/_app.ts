import { router } from '../trpc'
import { botRouter } from './bot'
import { productRouter } from './product'
import { faqRouter } from './faq'
import { orderRouter } from './order'
import { conversationRouter } from './conversation'
import { wizardRouter } from './wizard'

export const appRouter = router({
  bot: botRouter,
  product: productRouter,
  faq: faqRouter,
  order: orderRouter,
  conversation: conversationRouter,
  wizard: wizardRouter,
})

export type AppRouter = typeof appRouter
