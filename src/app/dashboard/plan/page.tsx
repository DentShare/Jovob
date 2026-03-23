"use client";

import { useState } from "react";
import { useBotContext } from "@/components/dashboard/BotContext";
import { trpc } from "@/lib/trpc";

const plans = [
  {
    id: "FREE",
    name: "Бесплатный",
    price: 0,
    period: "",
    features: [
      "1 бот",
      "100 контактов",
      "50 сообщений/день",
      "Telegram",
      "Базовый AI",
    ],
    limits: { bots: 1, contacts: 100, messages: 50 },
    popular: false,
  },
  {
    id: "STARTER",
    name: "Стартер",
    price: 99000,
    period: "/мес",
    features: [
      "3 бота",
      "1 000 контактов",
      "500 сообщений/день",
      "Telegram + Instagram",
      "Продвинутый AI",
      "Аналитика",
      "Рассылки",
    ],
    limits: { bots: 3, contacts: 1000, messages: 500 },
    popular: true,
  },
  {
    id: "BUSINESS",
    name: "Бизнес",
    price: 299000,
    period: "/мес",
    features: [
      "Безлимит ботов",
      "Безлимит контактов",
      "Безлимит сообщений",
      "Все каналы",
      "GPT-4o",
      "Приоритетная поддержка",
      "API доступ",
      "Собственный домен",
    ],
    limits: { bots: -1, contacts: -1, messages: -1 },
    popular: false,
  },
];

function formatPrice(price: number): string {
  if (price === 0) return "Бесплатно";
  return price.toLocaleString("ru-RU") + " сум";
}

export default function PlanPage() {
  const { isDemo } = useBotContext();
  const userQuery = trpc.user.me.useQuery(undefined, { retry: false });
  const currentPlan = userQuery.data?.plan ?? "FREE";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Тарифный план</h1>
        <p className="mt-1 text-sm text-gray-500">
          Выберите план, подходящий для вашего бизнеса
        </p>
      </div>

      {/* Current plan banner */}
      <div className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/80">Текущий план</p>
            <p className="text-2xl font-bold mt-1">
              {plans.find((p) => p.id === currentPlan)?.name ?? "Бесплатный"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
              {isDemo ? "Демо" : "Активен"}
            </span>
          </div>
        </div>
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 p-6 transition-all ${
                plan.popular
                  ? "border-[#3B82F6] shadow-lg shadow-blue-100"
                  : isCurrent
                  ? "border-green-300 bg-green-50/30"
                  : "border-gray-100 bg-white"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-1 text-xs font-bold text-white shadow-md">
                    Популярный
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-3">
                  <span className="text-3xl font-extrabold text-gray-900">
                    {formatPrice(plan.price)}
                  </span>
                  {plan.period && (
                    <span className="text-sm text-gray-500">{plan.period}</span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                disabled={isCurrent}
                className={`w-full rounded-xl py-3 text-sm font-semibold transition-all ${
                  isCurrent
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                    : plan.popular
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-md"
                    : "border-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {isCurrent ? "Текущий план" : plan.price === 0 ? "Начать бесплатно" : "Выбрать план"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Payment methods */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Способы оплаты</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5">
            <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
              C
            </div>
            <span className="text-sm text-gray-700">Click</span>
            <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">скоро</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5">
            <div className="w-8 h-8 rounded bg-teal-100 flex items-center justify-center text-xs font-bold text-teal-600">
              P
            </div>
            <span className="text-sm text-gray-700">Payme</span>
            <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">скоро</span>
          </div>
        </div>
      </div>
    </div>
  );
}
