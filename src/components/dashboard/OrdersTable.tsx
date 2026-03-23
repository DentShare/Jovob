"use client";

import { useState, useMemo } from "react";
import { useDemo } from "./DemoContext";
import { useBotContext } from "./BotContext";
import { trpc } from "@/lib/trpc";

type OrderStatus = "NEW" | "CONFIRMED" | "PREPARING" | "DELIVERED" | "CANCELLED";

interface Order {
  id: string;
  orderNumber: number;
  customerName: string;
  phone: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: OrderStatus;
  date: string;
  address?: string;
  note?: string;
}

const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  NEW: { label: "Новый", color: "text-blue-700", bg: "bg-blue-50" },
  CONFIRMED: { label: "Подтвержден", color: "text-yellow-700", bg: "bg-yellow-50" },
  PREPARING: { label: "Готовится", color: "text-orange-700", bg: "bg-orange-50" },
  DELIVERED: { label: "Доставлен", color: "text-green-700", bg: "bg-green-50" },
  CANCELLED: { label: "Отменен", color: "text-red-700", bg: "bg-red-50" },
};

const demoOrders: Order[] = [
  {
    id: "1",
    orderNumber: 1025,
    customerName: "Азиз Каримов",
    phone: "+998 90 123 45 67",
    items: [
      { name: "Розы красные", qty: 15, price: 15000 },
      { name: "Упаковка премиум", qty: 1, price: 25000 },
    ],
    total: 250000,
    status: "NEW",
    date: "22.03.2026, 12:45",
    address: "Ташкент, ул. Навои 15",
    note: "Позвонить за 30 мин до доставки",
  },
  {
    id: "2",
    orderNumber: 1024,
    customerName: "Нилуфар Хасанова",
    phone: "+998 91 234 56 78",
    items: [
      { name: "Букет свадебный", qty: 1, price: 500000 },
    ],
    total: 500000,
    status: "CONFIRMED",
    date: "22.03.2026, 11:30",
    address: "Ташкент, ул. Амира Темура 50",
  },
  {
    id: "3",
    orderNumber: 1023,
    customerName: "Фарход Ахмедов",
    phone: "+998 93 345 67 89",
    items: [
      { name: "Тюльпаны белые", qty: 25, price: 10000 },
      { name: "Ваза стеклянная", qty: 1, price: 80000 },
    ],
    total: 330000,
    status: "PREPARING",
    date: "22.03.2026, 10:15",
  },
  {
    id: "4",
    orderNumber: 1022,
    customerName: "Дилноза Рахимова",
    phone: "+998 94 456 78 90",
    items: [
      { name: "Хризантемы микс", qty: 11, price: 12000 },
    ],
    total: 132000,
    status: "DELIVERED",
    date: "21.03.2026, 16:00",
    address: "Ташкент, Чиланзар 7",
  },
  {
    id: "5",
    orderNumber: 1021,
    customerName: "Бахром Усманов",
    phone: "+998 95 567 89 01",
    items: [
      { name: "Лилии розовые", qty: 7, price: 18000 },
    ],
    total: 126000,
    status: "CANCELLED",
    date: "21.03.2026, 14:30",
  },
  {
    id: "6",
    orderNumber: 1020,
    customerName: "Шахноза Алимова",
    phone: "+998 90 678 90 12",
    items: [
      { name: "Розы белые", qty: 30, price: 15000 },
      { name: "Корзина", qty: 1, price: 45000 },
    ],
    total: 495000,
    status: "DELIVERED",
    date: "21.03.2026, 09:00",
    address: "Ташкент, Юнусабад 4",
  },
];

function formatPrice(sum: number): string {
  return sum.toLocaleString("ru-RU") + " сум";
}

export default function OrdersTable() {
  const { currentBotId, isDemo } = useBotContext();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch real orders
  const ordersQuery = trpc.order.list.useQuery(
    { botId: currentBotId!, limit: 50 },
    { enabled: !isDemo && !!currentBotId, retry: false }
  );

  // Mutation for updating order status
  const updateStatusMutation = trpc.order.updateStatus.useMutation({
    onSuccess: () => {
      ordersQuery.refetch();
    },
  });

  // Map real orders to the Order interface
  const realOrders: Order[] = useMemo(() => {
    if (isDemo || !ordersQuery.data) return [];
    return ordersQuery.data.orders.map((o, idx) => {
      const items = Array.isArray(o.items)
        ? (o.items as Array<{ name?: string; productId?: string; quantity?: number; price?: number }>).map((item) => ({
            name: item.name ?? item.productId ?? "Item",
            qty: item.quantity ?? 1,
            price: Number(item.price ?? 0),
          }))
        : [];
      return {
        id: o.id,
        orderNumber: 1000 + idx,
        customerName: o.customerName ?? o.conversation?.customerName ?? "Unknown",
        phone: o.customerPhone ?? o.conversation?.customerPhone ?? "",
        items,
        total: Number(o.total),
        status: o.status as OrderStatus,
        date: new Date(o.createdAt).toLocaleString("ru-RU"),
        address: o.deliveryAddress ?? undefined,
        note: o.notes ?? undefined,
      };
    });
  }, [isDemo, ordersQuery.data]);

  const orders = isDemo ? demoOrders : realOrders;

  const filtered = orders.filter((o) => {
    if (filterStatus !== "ALL" && o.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        o.customerName.toLowerCase().includes(q) ||
        o.phone.includes(q) ||
        o.orderNumber.toString().includes(q)
      );
    }
    return true;
  });

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    if (isDemo) return;
    updateStatusMutation.mutate({
      id: orderId,
      botId: currentBotId!,
      status: newStatus,
    });
  };

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(["ALL", "NEW", "CONFIRMED", "PREPARING", "DELIVERED", "CANCELLED"] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  filterStatus === status
                    ? "bg-[#3B82F6] text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {status === "ALL" ? "Все" : statusConfig[status].label}
              </button>
            )
          )}
        </div>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Поиск заказа..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm text-gray-700 placeholder-gray-400 focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] sm:w-64"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 py-3 text-left font-medium text-gray-500">#</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Клиент</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 hidden md:table-cell">Телефон</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 hidden lg:table-cell">Товары</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Сумма</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Статус</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 hidden sm:table-cell">Дата</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Детали</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const sc = statusConfig[order.status];
                return (
                  <tr
                    key={order.id}
                    className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{order.customerName}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      {order.phone}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                      <span className="max-w-[200px] truncate block">
                        {order.items.map((i) => `${i.name} x${i.qty}`).join(", ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${sc.bg} ${sc.color}`}
                      >
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                      {order.date}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">
                    Заказы не найдены
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Заказ #{selectedOrder.orderNumber}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Клиент</span>
                <span className="font-medium text-gray-900">{selectedOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Телефон</span>
                <span className="text-gray-700">{selectedOrder.phone}</span>
              </div>
              {selectedOrder.address && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Адрес</span>
                  <span className="text-gray-700 text-right max-w-[60%]">{selectedOrder.address}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Дата</span>
                <span className="text-gray-700">{selectedOrder.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Статус</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig[selectedOrder.status].bg} ${statusConfig[selectedOrder.status].color}`}>
                  {statusConfig[selectedOrder.status].label}
                </span>
              </div>
              {selectedOrder.note && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Примечание</span>
                  <span className="text-gray-700 text-right max-w-[60%]">{selectedOrder.note}</span>
                </div>
              )}

              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">Товары</p>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between py-1">
                    <span className="text-gray-700">
                      {item.name} <span className="text-gray-400">x{item.qty}</span>
                    </span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(item.price * item.qty)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-gray-100 pt-2 mt-2">
                  <span className="font-semibold text-gray-900">Итого</span>
                  <span className="font-semibold text-gray-900">
                    {formatPrice(selectedOrder.total)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Закрыть
              </button>
              {!isDemo && selectedOrder.status !== "DELIVERED" && selectedOrder.status !== "CANCELLED" && (
                <select
                  className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-700 bg-white focus:border-[#3B82F6] focus:outline-none"
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      handleStatusChange(selectedOrder.id, e.target.value as OrderStatus);
                      setSelectedOrder(null);
                    }
                  }}
                >
                  <option value="" disabled>Изменить статус</option>
                  {(["NEW", "CONFIRMED", "PREPARING", "DELIVERED", "CANCELLED"] as OrderStatus[])
                    .filter((s) => s !== selectedOrder.status)
                    .map((s) => (
                      <option key={s} value={s}>{statusConfig[s].label}</option>
                    ))}
                </select>
              )}
              {isDemo && (
                <button className="flex-1 rounded-lg bg-[#3B82F6] py-2 text-sm font-medium text-white hover:bg-[#2563EB] transition-colors">
                  Изменить статус
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
