import * as XLSX from 'xlsx'

interface OrderExport {
  id: string
  customerName: string | null
  customerPhone: string | null
  total: number
  currency: string
  status: string
  items: string
  deliveryAddress: string | null
  createdAt: Date
}

interface CustomerExport {
  name: string | null
  phone: string | null
  platform: string
  language: string | null
  totalOrders: number
  totalSpent: number
  tags: string[]
  firstContact: Date
  lastContact: Date
}

interface DialogExport {
  customerName: string | null
  platform: string
  messagesCount: number
  isResolved: boolean
  messages: Array<{ role: string; content: string; createdAt: Date }>
}

/**
 * Export orders to Excel (.xlsx) and return as Buffer.
 */
export function exportOrdersToExcel(orders: OrderExport[]): Buffer {
  const data = orders.map((o) => ({
    'ID Заказа': o.id,
    'Клиент': o.customerName ?? '',
    'Телефон': o.customerPhone ?? '',
    'Сумма': o.total,
    'Валюта': o.currency,
    'Статус': o.status,
    'Товары': o.items,
    'Адрес доставки': o.deliveryAddress ?? '',
    'Дата': new Date(o.createdAt).toLocaleDateString('ru-RU'),
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Заказы')

  // Set column widths
  ws['!cols'] = [
    { wch: 12 }, { wch: 20 }, { wch: 15 }, { wch: 12 },
    { wch: 6 }, { wch: 12 }, { wch: 40 }, { wch: 30 }, { wch: 12 },
  ]

  const uint8 = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
  return Buffer.from(uint8)
}

/**
 * Export customers to CSV.
 */
export function exportCustomersToCSV(customers: CustomerExport[]): string {
  const header = 'Имя,Телефон,Платформа,Язык,Заказов,Потрачено,Теги,Первый контакт,Последний контакт'
  const rows = customers.map((c) =>
    [
      escapeCSV(c.name ?? ''),
      escapeCSV(c.phone ?? ''),
      c.platform,
      c.language ?? '',
      c.totalOrders,
      c.totalSpent,
      escapeCSV(c.tags.join('; ')),
      new Date(c.firstContact).toLocaleDateString('ru-RU'),
      new Date(c.lastContact).toLocaleDateString('ru-RU'),
    ].join(',')
  )

  return [header, ...rows].join('\n')
}

/**
 * Export conversations to plain text.
 */
export function exportDialogsToText(dialogs: DialogExport[]): string {
  const parts: string[] = []

  for (const d of dialogs) {
    parts.push(`═══ Диалог: ${d.customerName ?? 'Без имени'} (${d.platform}) ═══`)
    parts.push(`Сообщений: ${d.messagesCount} | Статус: ${d.isResolved ? 'Завершён' : 'Активный'}`)
    parts.push('')

    for (const m of d.messages) {
      const role = m.role === 'USER' ? 'Клиент' : m.role === 'ASSISTANT' ? 'Бот' : 'Система'
      const time = new Date(m.createdAt).toLocaleString('ru-RU')
      parts.push(`[${time}] ${role}: ${m.content}`)
    }

    parts.push('')
    parts.push('')
  }

  return parts.join('\n')
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}
