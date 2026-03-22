"use client";

import { useState } from "react";

interface Message {
  role: "customer" | "bot" | "operator";
  text: string;
  time: string;
}

interface Conversation {
  id: string;
  customerName: string;
  phone: string;
  platform: "telegram" | "instagram" | "whatsapp";
  status: "ai_answered" | "operator_needed" | "active";
  lastMessage: string;
  time: string;
  unread: boolean;
  messages: Message[];
}

const demoConversations: Conversation[] = [
  {
    id: "1",
    customerName: "Азиз Каримов",
    phone: "+998 90 123 45 67",
    platform: "telegram",
    status: "ai_answered",
    lastMessage: "Спасибо, заказ получил!",
    time: "2 мин назад",
    unread: false,
    messages: [
      { role: "customer", text: "Здравствуйте! Какие цветы есть?", time: "10:30" },
      { role: "bot", text: "Здравствуйте! У нас розы, тюльпаны, хризантемы, лилии. Что интересует?", time: "10:30" },
      { role: "customer", text: "Красные розы, 15 штук", time: "10:31" },
      { role: "bot", text: "15 красных роз — 225 000 сум. Оформить?", time: "10:31" },
      { role: "customer", text: "Да!", time: "10:32" },
      { role: "bot", text: "Заказ #1025 создан! Доставка 2 часа.", time: "10:32" },
      { role: "customer", text: "Спасибо, заказ получил!", time: "12:45" },
    ],
  },
  {
    id: "2",
    customerName: "Нилуфар Хасанова",
    phone: "+998 91 234 56 78",
    platform: "instagram",
    status: "operator_needed",
    lastMessage: "А можно заказать на завтра к 10 утра?",
    time: "15 мин назад",
    unread: true,
    messages: [
      { role: "customer", text: "Добрый день! Хочу букет на свадьбу", time: "11:00" },
      { role: "bot", text: "Добрый день! Какой бюджет и предпочтения?", time: "11:00" },
      { role: "customer", text: "Бюджет 500 000, белые и розовые", time: "11:01" },
      { role: "bot", text: "Отличный выбор! Свадебный букет из белых роз и розовых пионов. Нужен оператор для деталей.", time: "11:01" },
      { role: "customer", text: "А можно заказать на завтра к 10 утра?", time: "11:05" },
    ],
  },
  {
    id: "3",
    customerName: "Фарход Ахмедов",
    phone: "+998 93 345 67 89",
    platform: "telegram",
    status: "ai_answered",
    lastMessage: "Спасибо за информацию!",
    time: "32 мин назад",
    unread: false,
    messages: [
      { role: "customer", text: "Доставка по Ташкенту бесплатная?", time: "11:20" },
      { role: "bot", text: "Бесплатная при заказе от 100 000 сум. Менее — 15 000 сум.", time: "11:20" },
      { role: "customer", text: "Спасибо за информацию!", time: "11:21" },
    ],
  },
  {
    id: "4",
    customerName: "Дилноза Рахимова",
    phone: "+998 94 456 78 90",
    platform: "whatsapp",
    status: "active",
    lastMessage: "Ок, жду ссылку на оплату",
    time: "1 час назад",
    unread: true,
    messages: [
      { role: "customer", text: "Хочу заказать букет лилий", time: "10:00" },
      { role: "bot", text: "Отличный выбор! Лилии розовые — 18 000 сум/шт. Сколько штук?", time: "10:00" },
      { role: "customer", text: "7 штук", time: "10:01" },
      { role: "bot", text: "7 розовых лилий — 126 000 сум. Оформляю заказ.", time: "10:01" },
      { role: "customer", text: "Ок, жду ссылку на оплату", time: "10:02" },
    ],
  },
  {
    id: "5",
    customerName: "Бахром Усманов",
    phone: "+998 95 567 89 01",
    platform: "telegram",
    status: "operator_needed",
    lastMessage: "Мне нужен корпоративный заказ на 50 букетов",
    time: "2 часа назад",
    unread: true,
    messages: [
      { role: "customer", text: "Мне нужен корпоративный заказ на 50 букетов", time: "09:00" },
      { role: "bot", text: "Для корпоративных заказов свяжу вас с менеджером.", time: "09:00" },
    ],
  },
  {
    id: "6",
    customerName: "Шахноза Алимова",
    phone: "+998 90 678 90 12",
    platform: "telegram",
    status: "ai_answered",
    lastMessage: "Отлично, спасибо!",
    time: "3 часа назад",
    unread: false,
    messages: [
      { role: "customer", text: "Какие акции сейчас?", time: "08:30" },
      { role: "bot", text: "Сейчас скидка 20% на все букеты от 200 000 сум! Акция до конца месяца.", time: "08:30" },
      { role: "customer", text: "Отлично, спасибо!", time: "08:31" },
    ],
  },
];

const platformIcons = {
  telegram: "✈️",
  instagram: "📷",
  whatsapp: "📱",
};

const statusConfig = {
  ai_answered: { label: "AI ответил", color: "bg-green-50 text-green-700" },
  operator_needed: { label: "Нужен оператор", color: "bg-red-50 text-red-700" },
  active: { label: "Активный", color: "bg-blue-50 text-blue-700" },
};

export default function DialogsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(demoConversations[0].id);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const selected = demoConversations.find((c) => c.id === selectedId) || null;

  const filtered = demoConversations.filter((c) => {
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return c.customerName.toLowerCase().includes(q) || c.phone.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Диалоги</h1>
        <p className="mt-1 text-sm text-gray-500">
          Все разговоры с клиентами
        </p>
      </div>

      <div className="flex h-[calc(100vh-220px)] rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {/* Conversations list */}
        <div className="flex w-full flex-col border-r border-gray-100 sm:w-80 lg:w-96">
          {/* Search & filter */}
          <div className="border-b border-gray-100 p-3 space-y-2">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
              />
            </div>
            <div className="flex gap-1">
              {[
                { key: "all", label: "Все" },
                { key: "operator_needed", label: "Оператор" },
                { key: "active", label: "Активные" },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilterStatus(f.key)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    filterStatus === f.key
                      ? "bg-[#3B82F6] text-white"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {filtered.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={`flex w-full items-center gap-3 p-3 text-left border-b border-gray-50 transition-colors ${
                  selectedId === conv.id
                    ? "bg-[#3B82F6]/5 border-l-2 border-l-[#3B82F6]"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">
                    {conv.customerName.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 text-[10px]">
                    {platformIcons[conv.platform]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {conv.customerName}
                    </span>
                    <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
                      {conv.time}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500 truncate">
                    {conv.lastMessage}
                  </p>
                  <span
                    className={`mt-1 inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium ${statusConfig[conv.status].color}`}
                  >
                    {statusConfig[conv.status].label}
                  </span>
                </div>
                {conv.unread && (
                  <span className="h-2.5 w-2.5 rounded-full bg-[#3B82F6] flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat view */}
        <div className="hidden flex-1 flex-col sm:flex">
          {selected ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">
                  {selected.customerName.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {selected.customerName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selected.phone} · {platformIcons[selected.platform]}{" "}
                    {selected.platform}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig[selected.status].color}`}
                >
                  {statusConfig[selected.status].label}
                </span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {selected.messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      msg.role === "customer" ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                        msg.role === "customer"
                          ? "bg-gray-100 text-gray-800"
                          : msg.role === "bot"
                          ? "bg-[#3B82F6] text-white"
                          : "bg-[#8B5CF6] text-white"
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p
                        className={`mt-1 text-[10px] ${
                          msg.role === "customer"
                            ? "text-gray-400"
                            : "text-white/60"
                        }`}
                      >
                        {msg.role === "bot" && "AI · "}
                        {msg.role === "operator" && "Оператор · "}
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply bar */}
              <div className="border-t border-gray-100 p-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ответить как оператор..."
                    className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                  />
                  <button className="rounded-xl bg-[#3B82F6] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2563EB] transition-colors">
                    Отправить
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
              Выберите диалог
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
