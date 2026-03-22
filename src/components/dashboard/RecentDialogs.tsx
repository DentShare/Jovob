"use client";

import { useState } from "react";

interface Dialog {
  id: string;
  customerName: string;
  lastMessage: string;
  time: string;
  platform: "telegram" | "instagram" | "whatsapp";
  status: "ai_answered" | "operator_needed";
  unread: boolean;
  messages: { role: "customer" | "bot" | "operator"; text: string; time: string }[];
}

const demoDialogs: Dialog[] = [
  {
    id: "1",
    customerName: "Азиз Каримов",
    lastMessage: "Спасибо, заказ получил! Все отлично.",
    time: "2 мин назад",
    platform: "telegram",
    status: "ai_answered",
    unread: false,
    messages: [
      { role: "customer", text: "Здравствуйте! Какие цветы есть в наличии?", time: "10:30" },
      { role: "bot", text: "Здравствуйте! У нас большой выбор: розы, тюльпаны, хризантемы, лилии. Что вас интересует?", time: "10:30" },
      { role: "customer", text: "Красные розы, 15 штук. Сколько будет?", time: "10:31" },
      { role: "bot", text: "15 красных роз — 225 000 сум. Оформить заказ?", time: "10:31" },
      { role: "customer", text: "Да, оформляйте!", time: "10:32" },
      { role: "bot", text: "Заказ #1025 создан! Доставка в течение 2 часов. Спасибо!", time: "10:32" },
      { role: "customer", text: "Спасибо, заказ получил! Все отлично.", time: "12:45" },
    ],
  },
  {
    id: "2",
    customerName: "Нилуфар Хасанова",
    lastMessage: "А можно заказать на завтра к 10 утра?",
    time: "15 мин назад",
    platform: "instagram",
    status: "operator_needed",
    unread: true,
    messages: [
      { role: "customer", text: "Добрый день! Хочу заказать букет на свадьбу", time: "11:00" },
      { role: "bot", text: "Добрый день! С радостью помогу. Какой бюджет и предпочтения по цветам?", time: "11:00" },
      { role: "customer", text: "Бюджет 500 000, белые и розовые", time: "11:01" },
      { role: "bot", text: "Отличный выбор! Могу предложить свадебный букет из белых роз и розовых пионов. Нужна помощь оператора для уточнения деталей.", time: "11:01" },
      { role: "customer", text: "А можно заказать на завтра к 10 утра?", time: "11:05" },
    ],
  },
  {
    id: "3",
    customerName: "Фарход Ахмедов",
    lastMessage: "Доставка по Ташкенту бесплатная?",
    time: "32 мин назад",
    platform: "telegram",
    status: "ai_answered",
    unread: false,
    messages: [
      { role: "customer", text: "Доставка по Ташкенту бесплатная?", time: "11:20" },
      { role: "bot", text: "Да, доставка по Ташкенту бесплатная при заказе от 100 000 сум. При заказе менее — доставка 15 000 сум.", time: "11:20" },
    ],
  },
  {
    id: "4",
    customerName: "Дилноза Рахимова",
    lastMessage: "Как оплатить через Click?",
    time: "1 час назад",
    platform: "whatsapp",
    status: "ai_answered",
    unread: false,
    messages: [
      { role: "customer", text: "Как оплатить через Click?", time: "10:00" },
      { role: "bot", text: "После оформления заказа вы получите ссылку на оплату через Click. Нажмите на неё и следуйте инструкциям в приложении Click.", time: "10:00" },
    ],
  },
  {
    id: "5",
    customerName: "Бахром Усманов",
    lastMessage: "Мне нужен корпоративный заказ на 50 букетов",
    time: "2 часа назад",
    platform: "telegram",
    status: "operator_needed",
    unread: true,
    messages: [
      { role: "customer", text: "Мне нужен корпоративный заказ на 50 букетов", time: "09:00" },
      { role: "bot", text: "Для корпоративных заказов свяжу вас с менеджером. Пожалуйста, подождите.", time: "09:00" },
    ],
  },
];

const platformIcons = {
  telegram: "✈️",
  instagram: "📷",
  whatsapp: "📱",
};

export default function RecentDialogs() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Последние диалоги</h2>
        <a
          href="/dashboard/dialogs"
          className="text-sm font-medium text-[#3B82F6] hover:text-[#2563EB] transition-colors"
        >
          Все диалоги →
        </a>
      </div>
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {demoDialogs.map((dialog) => {
          const isExpanded = expandedId === dialog.id;
          return (
            <div key={dialog.id} className="border-b border-gray-50 last:border-b-0">
              <button
                onClick={() => setExpandedId(isExpanded ? null : dialog.id)}
                className={`flex w-full items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors ${
                  dialog.unread ? "bg-blue-50/50" : ""
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">
                    {dialog.customerName.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 text-xs">
                    {platformIcons[dialog.platform]}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 truncate">
                      {dialog.customerName}
                    </span>
                    {dialog.unread && (
                      <span className="h-2 w-2 rounded-full bg-[#3B82F6] flex-shrink-0" />
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500 truncate">
                    {dialog.lastMessage}
                  </p>
                </div>

                {/* Meta */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-xs text-gray-400">{dialog.time}</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      dialog.status === "ai_answered"
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {dialog.status === "ai_answered" ? "✅ AI" : "❌ Оператор"}
                  </span>
                </div>

                {/* Chevron */}
                <svg
                  className={`h-4 w-4 text-gray-400 transition-transform flex-shrink-0 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Expanded conversation */}
              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {dialog.messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${
                          msg.role === "customer" ? "justify-start" : "justify-end"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                            msg.role === "customer"
                              ? "bg-white border border-gray-200 text-gray-800"
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
                                : "text-white/70"
                            }`}
                          >
                            {msg.role === "bot" ? "🤖 " : msg.role === "operator" ? "👤 " : ""}
                            {msg.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
