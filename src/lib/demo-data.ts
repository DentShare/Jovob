// This file provides demo data for the dashboard and other components
// to work without a database connection (for demo/preview purposes)

export const demoMetrics = {
  messagesToday: 127,
  ordersTotal: 23,
  newClients: 8,
  aiAnswerRate: 89,
}

export const demoDialogs = [
  { id: '1', customerName: 'Дилноза', lastMessage: 'Есть ли размер XL?', aiAnswered: true, time: '14:32' },
  { id: '2', customerName: 'Алишер', lastMessage: 'Как оплатить через Click?', aiAnswered: true, time: '14:15' },
  { id: '3', customerName: 'Бахтиёр', lastMessage: 'Можете сшить на заказ?', aiAnswered: false, time: '13:48' },
  { id: '4', customerName: 'Нодира', lastMessage: 'Когда будет доставка?', aiAnswered: true, time: '12:30' },
  { id: '5', customerName: 'Шерзод', lastMessage: 'Есть ли скидки?', aiAnswered: true, time: '11:22' },
]

export const demoOrders = [
  { id: '1', customer: 'Дилноза Рахимова', phone: '+998931112233', items: 'Платье "Гюзель" (M)', total: 189000, status: 'CONFIRMED' as const, date: '2026-03-22' },
  { id: '2', customer: 'Алишер Маматов', phone: '+998907778899', items: 'Джинсы Mom Fit + 2x Футболка', total: 337000, status: 'NEW' as const, date: '2026-03-22' },
  { id: '3', customer: 'Нодира Усманова', phone: '+998945556677', items: 'Кардиган + Палантин', total: 368000, status: 'DELIVERED' as const, date: '2026-03-21' },
  { id: '4', customer: 'Шерзод Ахмедов', phone: '+998991234567', items: 'Жакет "Бахор" (L)', total: 259000, status: 'PREPARING' as const, date: '2026-03-21' },
  { id: '5', customer: 'Камола Ибрагимова', phone: '+998933334455', items: 'Комбинезон летний (S)', total: 229000, status: 'CANCELLED' as const, date: '2026-03-20' },
]

export const demoProducts = [
  { id: '1', name: 'Платье летнее "Гюзель"', price: 189000, category: 'Платья', inStock: true, imageUrl: null },
  { id: '2', name: 'Платье вечернее "Лале"', price: 349000, category: 'Платья', inStock: true, imageUrl: null },
  { id: '3', name: 'Блузка "Севинч"', price: 129000, category: 'Блузки', inStock: true, imageUrl: null },
  { id: '4', name: 'Юбка миди "Дилноза"', price: 159000, category: 'Юбки', inStock: false, imageUrl: null },
  { id: '5', name: 'Брюки классические', price: 179000, category: 'Брюки', inStock: true, imageUrl: null },
  { id: '6', name: 'Жакет "Бахор"', price: 259000, category: 'Верхняя одежда', inStock: true, imageUrl: null },
  { id: '7', name: 'Футболка базовая', price: 69000, category: 'Топы', inStock: true, imageUrl: null },
  { id: '8', name: 'Джинсы Mom Fit', price: 199000, category: 'Брюки', inStock: true, imageUrl: null },
]

export const demoUnanswered = [
  { question: 'Можете сшить на заказ?', count: 3 },
  { question: 'Есть ли рассрочка?', count: 2 },
  { question: 'Когда поступление новой коллекции?', count: 1 },
]

export const demoBotInfo = {
  name: 'Bella Moda',
  description: 'Интернет-магазин женской одежды из Турции',
  businessType: 'clothing_store',
  personality: 'friendly',
  isActive: true,
  platforms: { telegram: true, instagram: false, whatsapp: false },
}

export function formatUZS(amount: number): string {
  return new Intl.NumberFormat('uz-UZ').format(amount) + ' сум'
}
