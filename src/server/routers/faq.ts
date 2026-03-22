import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from '../trpc'

// ─── FAQ templates by business type ──────────────────────────────────────────

const FAQ_TEMPLATES: Record<string, Array<{ question: string; answer: string }>> = {
  clothing_store: [
    {
      question: 'Какие способы доставки доступны?',
      answer: 'Мы предлагаем доставку курьером по городу (1-2 дня) и самовывоз из магазина. Доставка бесплатна при заказе от 500 000 сум.',
    },
    {
      question: 'Как вернуть товар?',
      answer: 'Вы можете вернуть товар в течение 14 дней с момента покупки при сохранении товарного вида и бирок. Для возврата свяжитесь с нами.',
    },
    {
      question: 'Как подобрать размер?',
      answer: 'Ознакомьтесь с нашей размерной сеткой в каталоге. Если вы сомневаетесь, напишите нам свои мерки, и мы поможем выбрать размер.',
    },
    {
      question: 'Какие способы оплаты принимаются?',
      answer: 'Мы принимаем наличные, карты Uzcard/Humo, Click, Payme и Uzum.',
    },
    {
      question: 'Можно ли узнать о наличии товара?',
      answer: 'Да, напишите нам название или фото товара, и мы проверим наличие на складе и в магазине.',
    },
  ],
  restaurant: [
    {
      question: 'Где посмотреть меню?',
      answer: 'Наше полное меню доступно в каталоге бота. Выберите категорию, чтобы увидеть блюда с ценами и описанием.',
    },
    {
      question: 'Какое время работы?',
      answer: 'Мы работаем ежедневно с 10:00 до 23:00. Кухня принимает последний заказ в 22:30.',
    },
    {
      question: 'Есть ли доставка?',
      answer: 'Да, мы доставляем заказы по городу. Минимальная сумма заказа — 50 000 сум. Среднее время доставки — 40-60 минут.',
    },
    {
      question: 'Какая минимальная сумма заказа?',
      answer: 'Минимальная сумма заказа для доставки — 50 000 сум. Для самовывоза ограничений нет.',
    },
    {
      question: 'Есть ли информация об аллергенах?',
      answer: 'Да, вы можете уточнить состав любого блюда, написав нам. Мы предоставим полную информацию об ингредиентах и аллергенах.',
    },
  ],
  beauty_salon: [
    {
      question: 'Где посмотреть прайс-лист?',
      answer: 'Полный прайс-лист доступен в разделе «Услуги» нашего бота. Цены зависят от мастера и сложности работы.',
    },
    {
      question: 'Как записаться на приём?',
      answer: 'Вы можете записаться через бота, выбрав услугу, мастера и удобное время. Также можно написать нам напрямую.',
    },
    {
      question: 'Какие правила отмены записи?',
      answer: 'Отмена бесплатна за 3 часа до визита. При поздней отмене может взиматься штраф 50% от стоимости услуги.',
    },
    {
      question: 'Есть ли парковка?',
      answer: 'Да, для наших клиентов доступна бесплатная парковка рядом с салоном.',
    },
    {
      question: 'Как выбрать мастера?',
      answer: 'В разделе «Мастера» вы найдёте портфолио и отзывы каждого специалиста. Мы поможем подобрать мастера под ваши пожелания.',
    },
  ],
  education: [
    {
      question: 'Какое расписание занятий?',
      answer: 'Расписание зависит от выбранного курса. Мы предлагаем утренние (9:00-12:00), дневные (14:00-17:00) и вечерние (18:00-21:00) группы.',
    },
    {
      question: 'Сколько стоит обучение?',
      answer: 'Стоимость зависит от курса и формата обучения. Ознакомьтесь с нашим каталогом курсов для актуальных цен. Возможна рассрочка.',
    },
    {
      question: 'Есть ли пробный урок?',
      answer: 'Да, первый пробный урок бесплатный. Запишитесь через бота, и мы подберём удобное время.',
    },
    {
      question: 'Выдаётся ли сертификат?',
      answer: 'Да, по окончании курса выдаётся сертификат. Для получения необходимо пройти итоговый тест с результатом не менее 70%.',
    },
  ],
}

export const faqRouter = router({
  // ─── Create FAQ item ───────────────────────────────────────────────────────
  create: protectedProcedure
    .input(
      z.object({
        botId: z.string(),
        question: z.string().min(1),
        questionUz: z.string().optional(),
        answer: z.string().min(1),
        answerUz: z.string().optional(),
        sortOrder: z.number().int().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      const bot = await ctx.prisma.bot.findUnique({
        where: { id: input.botId },
      })
      if (!bot || bot.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
      }

      const faq = await ctx.prisma.fAQItem.create({ data: input })
      return faq
    }),

  // ─── List FAQ items by bot ─────────────────────────────────────────────────
  list: protectedProcedure
    .input(z.object({ botId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      const bot = await ctx.prisma.bot.findUnique({
        where: { id: input.botId },
      })
      if (!bot || bot.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
      }

      const items = await ctx.prisma.fAQItem.findMany({
        where: { botId: input.botId },
        orderBy: { sortOrder: 'asc' },
      })

      return items
    }),

  // ─── Update FAQ item ──────────────────────────────────────────────────────
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        botId: z.string(),
        question: z.string().min(1).optional(),
        questionUz: z.string().optional(),
        answer: z.string().min(1).optional(),
        answerUz: z.string().optional(),
        sortOrder: z.number().int().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      const { id, botId, ...data } = input

      const bot = await ctx.prisma.bot.findUnique({ where: { id: botId } })
      if (!bot || bot.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
      }

      const existing = await ctx.prisma.fAQItem.findUnique({ where: { id } })
      if (!existing || existing.botId !== botId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'FAQ item not found' })
      }

      const faq = await ctx.prisma.fAQItem.update({ where: { id }, data })
      return faq
    }),

  // ─── Delete FAQ item ──────────────────────────────────────────────────────
  delete: protectedProcedure
    .input(z.object({ id: z.string(), botId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string

      const bot = await ctx.prisma.bot.findUnique({
        where: { id: input.botId },
      })
      if (!bot || bot.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
      }

      const existing = await ctx.prisma.fAQItem.findUnique({
        where: { id: input.id },
      })
      if (!existing || existing.botId !== input.botId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'FAQ item not found' })
      }

      await ctx.prisma.fAQItem.delete({ where: { id: input.id } })
      return { success: true }
    }),

  // ─── Generate FAQ for niche ────────────────────────────────────────────────
  generateForNiche: protectedProcedure
    .input(
      z.object({
        botId: z.string(),
        businessType: z.enum([
          'clothing_store',
          'restaurant',
          'beauty_salon',
          'education',
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      const bot = await ctx.prisma.bot.findUnique({
        where: { id: input.botId },
      })
      if (!bot || bot.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
      }

      const templates = FAQ_TEMPLATES[input.businessType]
      if (!templates) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `No templates for business type: ${input.businessType}`,
        })
      }

      // Delete existing auto-generated FAQs for this bot
      await ctx.prisma.fAQItem.deleteMany({
        where: { botId: input.botId, isAutoGen: true },
      })

      // Create new FAQs from template
      const created = await ctx.prisma.fAQItem.createMany({
        data: templates.map((t, index) => ({
          botId: input.botId,
          question: t.question,
          answer: t.answer,
          isAutoGen: true,
          sortOrder: index,
        })),
      })

      // Return the created items
      const items = await ctx.prisma.fAQItem.findMany({
        where: { botId: input.botId, isAutoGen: true },
        orderBy: { sortOrder: 'asc' },
      })

      return { count: created.count, items }
    }),
})
