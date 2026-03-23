"use client";

import { useState } from "react";
import { useBotContext } from "@/components/dashboard/BotContext";
import { trpc } from "@/lib/trpc";

const scenarioTemplates = [
  {
    id: "greeting",
    name: "Приветствие",
    icon: "👋",
    description: "Автоматическое приветствие при первом сообщении",
    trigger: "Первое сообщение",
  },
  {
    id: "catalog",
    name: "Каталог товаров",
    icon: "📦",
    description: "Показать каталог по запросу клиента",
    trigger: "Запрос каталога / товаров",
  },
  {
    id: "order",
    name: "Оформление заказа",
    icon: "🛒",
    description: "Пошаговый сбор данных для заказа",
    trigger: "Клиент хочет купить",
  },
  {
    id: "faq",
    name: "Частые вопросы",
    icon: "❓",
    description: "Ответы на типичные вопросы из базы знаний",
    trigger: "Вопрос клиента",
  },
  {
    id: "handoff",
    name: "Переключение на оператора",
    icon: "👤",
    description: "Передача диалога менеджеру",
    trigger: "Сложный вопрос / жалоба",
  },
  {
    id: "working_hours",
    name: "Режим работы",
    icon: "🕐",
    description: "Информация о графике и адресе",
    trigger: "Вопрос о времени работы",
  },
];

export default function ConstructorPage() {
  const { currentBotId, isDemo } = useBotContext();
  const [activeScenarios, setActiveScenarios] = useState<string[]>([
    "greeting", "catalog", "order", "faq", "handoff", "working_hours",
  ]);

  const botQuery = trpc.bot.getById.useQuery(
    { id: currentBotId! },
    { enabled: !!currentBotId && !isDemo }
  );

  const toggleScenario = (id: string) => {
    setActiveScenarios((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Конструктор бота</h1>
        <p className="mt-1 text-sm text-gray-500">
          Настройте сценарии работы вашего AI-бота
        </p>
      </div>

      {/* Bot personality */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Текущие настройки</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-xs text-blue-600 font-medium mb-1">AI-модель</p>
            <p className="text-sm font-semibold text-gray-900">
              {botQuery.data?.aiModel ?? "gpt-4o-mini"}
            </p>
          </div>
          <div className="rounded-lg bg-purple-50 p-4">
            <p className="text-xs text-purple-600 font-medium mb-1">Тон общения</p>
            <p className="text-sm font-semibold text-gray-900 capitalize">
              {botQuery.data?.personality ?? "friendly"}
            </p>
          </div>
          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-xs text-green-600 font-medium mb-1">Порог уверенности</p>
            <p className="text-sm font-semibold text-gray-900">
              {((botQuery.data?.confidenceThreshold ?? 0.6) * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      </div>

      {/* Scenarios */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Сценарии</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarioTemplates.map((scenario) => {
            const isActive = activeScenarios.includes(scenario.id);
            return (
              <div
                key={scenario.id}
                onClick={() => toggleScenario(scenario.id)}
                className={`cursor-pointer rounded-xl border-2 p-5 transition-all ${
                  isActive
                    ? "border-[#3B82F6] bg-blue-50/50 shadow-sm"
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{scenario.icon}</span>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      isActive ? "bg-[#3B82F6]" : "border-2 border-gray-300"
                    }`}
                  >
                    {isActive && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{scenario.name}</h3>
                <p className="text-xs text-gray-500 mb-2">{scenario.description}</p>
                <div className="flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-[10px] text-gray-400 font-medium">{scenario.trigger}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Coming soon */}
      <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
        <div className="mx-auto w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Визуальный редактор скоро</h3>
        <p className="text-xs text-gray-500">Drag-and-drop конструктор сценариев появится в следующем обновлении</p>
      </div>
    </div>
  );
}
