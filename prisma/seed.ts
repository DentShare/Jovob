import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Create demo user
  const user = await prisma.user.create({
    data: {
      name: 'Алишер Каримов',
      email: 'alisher@demo.uz',
      phone: '+998901234567',
      language: 'ru',
      plan: 'STARTER',
    },
  })

  // Create demo bot: Bella Moda (clothing store)
  const bellaModa = await prisma.bot.create({
    data: {
      userId: user.id,
      name: 'Bella Moda',
      description: 'Интернет-магазин женской одежды из Турции. Доставка по всему Узбекистану за 1-3 дня.',
      businessType: 'clothing_store',
      botLanguages: ['ru', 'uz'],
      personality: 'friendly',
      welcomeMessage: 'Здравствуйте! 👋 Я помощник магазина Bella Moda. Помогу выбрать одежду, расскажу о ценах и оформлю заказ. Что вас интересует?',
      workingHours: { mon: '09:00-21:00', tue: '09:00-21:00', wed: '09:00-21:00', thu: '09:00-21:00', fri: '09:00-21:00', sat: '09:00-18:00', sun: 'выходной' },
      address: 'Ташкент, Юнусабад, ул. Амира Темура 15',
      managerContact: '+998901234567',
      isActive: true,
      capabilities: ['ai_answers', 'catalog', 'orders', 'handoff'],
    },
  })

  // Create 15 demo products for Bella Moda
  const products = [
    { name: 'Платье летнее "Гюзель"', price: 189000, category: 'Платья', description: 'Хлопок 100%, размеры S-XL' },
    { name: 'Платье вечернее "Лале"', price: 349000, category: 'Платья', description: 'Атлас, размеры S-L' },
    { name: 'Блузка "Севинч"', price: 129000, category: 'Блузки', description: 'Шёлк, размеры S-M-L' },
    { name: 'Юбка миди "Дилноза"', price: 159000, category: 'Юбки', description: 'Креп, размеры S-XL' },
    { name: 'Брюки классические', price: 179000, category: 'Брюки', description: 'Костюмная ткань, размеры S-XXL' },
    { name: 'Жакет "Бахор"', price: 259000, category: 'Верхняя одежда', description: 'Лёгкий жакет, размеры S-L' },
    { name: 'Футболка базовая', price: 69000, category: 'Топы', description: 'Хлопок, 8 цветов, размеры S-XXL' },
    { name: 'Кардиган длинный', price: 219000, category: 'Верхняя одежда', description: 'Вязаный, размеры S-L' },
    { name: 'Джинсы Mom Fit', price: 199000, category: 'Брюки', description: 'Деним, размеры 26-32' },
    { name: 'Платье-рубашка', price: 169000, category: 'Платья', description: 'Хлопок-лён, размеры S-L' },
    { name: 'Комбинезон летний', price: 229000, category: 'Комбинезоны', description: 'Лён, размеры S-M-L' },
    { name: 'Шорты высокая посадка', price: 109000, category: 'Шорты', description: 'Деним, размеры S-L' },
    { name: 'Топ с вышивкой', price: 89000, category: 'Топы', description: 'Узбекская вышивка, размеры S-M' },
    { name: 'Палантин шёлковый', price: 149000, category: 'Аксессуары', description: 'Натуральный шёлк' },
    { name: 'Сумка кожаная', price: 289000, category: 'Аксессуары', description: 'Натуральная кожа, 3 цвета' },
  ]

  for (const [i, p] of products.entries()) {
    await prisma.product.create({
      data: { botId: bellaModa.id, name: p.name, price: p.price, currency: 'UZS', category: p.category, description: p.description, inStock: true, sortOrder: i },
    })
  }

  // Create FAQ items
  const faqs = [
    { question: 'Как оформить заказ?', answer: 'Напишите название товара или выберите из каталога. Я помогу оформить заказ — потребуется ваше имя, телефон и адрес доставки.' },
    { question: 'Какие способы доставки?', answer: 'Доставка по Ташкенту — 1 день (бесплатно от 300 000 сум). По Узбекистану — 2-3 дня через Yandex Express.' },
    { question: 'Можно ли вернуть товар?', answer: 'Да, в течение 14 дней с момента получения, если сохранены бирки и товарный вид.' },
    { question: 'Какие способы оплаты?', answer: 'Наличные при получении, UzCard, Humo через Click и Payme.' },
    { question: 'Есть ли размерная сетка?', answer: 'Размеры указаны в описании каждого товара. Если сомневаетесь — напишите рост и вес, поможем подобрать.' },
    { question: 'Работаете ли в выходные?', answer: 'Пн-Пт с 9:00 до 21:00, Сб с 9:00 до 18:00. Воскресенье — выходной.' },
    { question: 'Есть ли примерка?', answer: 'Да, при доставке по Ташкенту можно примерить. Если не подойдёт — курьер заберёт обратно.' },
    { question: 'Какие скидки есть?', answer: 'Скидки публикуем в нашем Telegram-канале. Также есть накопительная система: от 5 покупок — скидка 5%.' },
  ]

  for (const [i, f] of faqs.entries()) {
    await prisma.fAQItem.create({
      data: { botId: bellaModa.id, question: f.question, answer: f.answer, isAutoGen: i < 5, sortOrder: i },
    })
  }

  // Create demo conversations
  const conv1 = await prisma.conversation.create({
    data: { botId: bellaModa.id, platform: 'telegram', platformChatId: '123456789', customerName: 'Дилноза', language: 'ru' },
  })
  await prisma.message.createMany({
    data: [
      { conversationId: conv1.id, role: 'USER', content: 'Привет! Есть ли у вас летние платья?', platform: 'telegram' },
      { conversationId: conv1.id, role: 'ASSISTANT', content: 'Здравствуйте! 👋 Да, у нас есть несколько моделей летних платьев:\n\n1. Платье летнее "Гюзель" — 189 000 сум (хлопок)\n2. Платье-рубашка — 169 000 сум (хлопок-лён)\n\nОба доступны в размерах S-XL. Какое вас интересует?', platform: 'telegram', confidence: 0.95 },
      { conversationId: conv1.id, role: 'USER', content: 'Гюзель в размере M есть?', platform: 'telegram' },
      { conversationId: conv1.id, role: 'ASSISTANT', content: 'Да, "Гюзель" в размере M в наличии! 🎉\n\nХотите оформить заказ? Мне потребуются:\n- Ваше имя\n- Номер телефона\n- Адрес доставки', platform: 'telegram', confidence: 0.92 },
    ],
  })

  const conv2 = await prisma.conversation.create({
    data: { botId: bellaModa.id, platform: 'telegram', platformChatId: '987654321', customerName: 'Бахтиёр', language: 'ru' },
  })
  await prisma.message.createMany({
    data: [
      { conversationId: conv2.id, role: 'USER', content: 'Можете сшить на заказ?', platform: 'telegram' },
      { conversationId: conv2.id, role: 'ASSISTANT', content: 'К сожалению, я не могу ответить на этот вопрос. Давайте я свяжу вас с менеджером — +998901234567. Или напишите @alisher_manager в Telegram.', platform: 'telegram', confidence: 0.3, handedOff: true },
    ],
  })

  // Create demo orders
  await prisma.order.create({
    data: {
      botId: bellaModa.id,
      conversationId: conv1.id,
      items: [{ productName: 'Платье летнее "Гюзель"', qty: 1, price: 189000, size: 'M' }],
      total: 189000,
      currency: 'UZS',
      status: 'CONFIRMED',
      customerName: 'Дилноза Рахимова',
      customerPhone: '+998931112233',
      deliveryAddress: 'Ташкент, Мирзо-Улугбекский р-н, ул. Буюк Ипак Йули 42',
    },
  })

  await prisma.order.create({
    data: {
      botId: bellaModa.id,
      items: [
        { productName: 'Джинсы Mom Fit', qty: 1, price: 199000, size: '28' },
        { productName: 'Футболка базовая', qty: 2, price: 69000, color: 'белый' },
      ],
      total: 337000,
      currency: 'UZS',
      status: 'NEW',
      customerName: 'Алишер Маматов',
      customerPhone: '+998907778899',
      deliveryAddress: 'Самарканд, ул. Регистан 5',
    },
  })

  // Create second demo bot: restaurant
  const opiPlov = await prisma.bot.create({
    data: {
      userId: user.id,
      name: 'Opi Plov',
      description: 'Ресторан узбекской кухни с доставкой. Плов, шашлык, самса и другие национальные блюда.',
      businessType: 'restaurant',
      botLanguages: ['ru', 'uz'],
      personality: 'fun',
      welcomeMessage: "Ассалому алейкум! 😊🍽️ Добро пожаловать в Opi Plov! Наш плов — лучший в городе 🔥 Посмотрите меню или спросите — чем помочь?",
      workingHours: { mon: '10:00-23:00', tue: '10:00-23:00', wed: '10:00-23:00', thu: '10:00-23:00', fri: '10:00-00:00', sat: '10:00-00:00', sun: '10:00-22:00' },
      address: 'Ташкент, Чиланзар, ул. Катартал 7',
      managerContact: '+998909876543',
      isActive: true,
      capabilities: ['ai_answers', 'catalog', 'orders', 'broadcast', 'handoff'],
    },
  })

  // Restaurant products
  const dishes = [
    { name: 'Плов по-ташкентски', price: 45000, category: 'Основные блюда', description: 'Порция 350г, баранина, рис, морковь, нут' },
    { name: 'Шашлык из баранины', price: 35000, category: 'Шашлыки', description: '1 шампур, 200г мяса' },
    { name: 'Самса тандырная', price: 12000, category: 'Выпечка', description: 'С мясом и луком' },
    { name: 'Лагман домашний', price: 38000, category: 'Супы', description: 'Лапша ручной работы, 400мл' },
    { name: 'Манты', price: 28000, category: 'Основные блюда', description: '3 штуки, баранина с тыквой' },
    { name: 'Чай зелёный (чайник)', price: 8000, category: 'Напитки', description: '0.5л' },
    { name: 'Компот домашний', price: 10000, category: 'Напитки', description: '0.5л, из сухофруктов' },
    { name: 'Нон тандырный', price: 5000, category: 'Выпечка', description: 'Свежевыпеченный' },
  ]

  for (const [i, d] of dishes.entries()) {
    await prisma.product.create({
      data: { botId: opiPlov.id, name: d.name, price: d.price, currency: 'UZS', category: d.category, description: d.description, inStock: true, sortOrder: i },
    })
  }

  console.log('✅ Demo data seeded successfully!')
  console.log(`   User: ${user.name} (${user.email})`)
  console.log(`   Bot 1: ${bellaModa.name} — ${products.length} products, ${faqs.length} FAQs`)
  console.log(`   Bot 2: ${opiPlov.name} — ${dishes.length} products`)
  console.log(`   Conversations: 2, Orders: 2`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
