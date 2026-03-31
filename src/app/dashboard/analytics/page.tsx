"use client";

import { useState } from "react";
import { useBotContext } from "@/components/dashboard/BotContext";
import { trpc } from "@/lib/trpc";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function AnalyticsPage() {
  const { currentBotId, isDemo } = useBotContext();
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");

  const chartQuery = trpc.analytics.getChart.useQuery(
    { botId: currentBotId!, period },
    { enabled: !isDemo && !!currentBotId }
  );

  const funnelQuery = trpc.analytics.getFunnel.useQuery(
    { botId: currentBotId! },
    { enabled: !isDemo && !!currentBotId }
  );

  const aiQuery = trpc.analytics.getAiPerformance.useQuery(
    { botId: currentBotId! },
    { enabled: !isDemo && !!currentBotId }
  );

  const topQuestionsQuery = trpc.analytics.getTopQuestions.useQuery(
    { botId: currentBotId!, limit: 10 },
    { enabled: !isDemo && !!currentBotId }
  );

  const popularProductsQuery = trpc.analytics.getPopularProducts.useQuery(
    { botId: currentBotId! },
    { enabled: !isDemo && !!currentBotId }
  );

  const chartData = chartQuery.data ?? [];
  const funnel = funnelQuery.data;
  const ai = aiQuery.data;
  const topQuestions = topQuestionsQuery.data ?? [];
  const popularProducts = popularProductsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Аналитика</h1>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(["7d", "30d", "90d"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                period === p
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {p === "7d" ? "7 дней" : p === "30d" ? "30 дней" : "90 дней"}
            </button>
          ))}
        </div>
      </div>

      {/* Messages chart */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-4">Сообщения по дням</h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => new Date(v).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                labelFormatter={(v) => new Date(v as string).toLocaleDateString("ru-RU")}
                formatter={(v) => [String(v), "Сообщений"]}
              />
              <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-400">
            Нет данных за выбранный период
          </div>
        )}
      </div>

      {/* AI Performance + Funnel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Performance */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">AI Performance</h2>
          {ai ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Всего ответов AI</span>
                <span className="text-lg font-bold text-gray-900">{ai.totalResponses}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Авто-ответы (conf &ge; 0.6)</span>
                <span className="text-lg font-bold text-green-600">{ai.autoResolved}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Переданы оператору</span>
                <span className="text-lg font-bold text-amber-600">{ai.handoffs}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Уровень автоматизации</span>
                  <span className="text-xl font-bold text-blue-600">{ai.autoResolvedRate}%</span>
                </div>
                <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    style={{ width: `${ai.autoResolvedRate}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Загрузка...</p>
          )}
        </div>

        {/* Funnel */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Воронка (30 дней)</h2>
          {funnel ? (
            <div className="space-y-3">
              {[
                { label: "Диалогов", value: funnel.totalConversations, color: "bg-blue-500" },
                { label: "Запросы каталога", value: funnel.catalogQueries, color: "bg-purple-500" },
                { label: "Заказов", value: funnel.orders, color: "bg-green-500" },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                  <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-lg transition-all duration-500`}
                      style={{
                        width: `${funnel.totalConversations > 0 ? Math.max(5, (item.value / funnel.totalConversations) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Загрузка...</p>
          )}
        </div>
      </div>

      {/* Top Questions + Popular Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Questions */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Топ вопросы клиентов</h2>
          {topQuestions.length > 0 ? (
            <div className="space-y-2">
              {topQuestions.map((q, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-xs font-bold text-gray-300 mt-0.5 w-5">{i + 1}</span>
                  <span className="text-sm text-gray-700 flex-1">{q.question}</span>
                  <span className="text-xs font-medium text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                    {q.count}x
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Нет данных</p>
          )}
        </div>

        {/* Popular Products */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Популярные товары</h2>
          {popularProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={popularProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  width={120}
                />
                <Tooltip formatter={(v) => [String(v), "Заказов"]} />
                <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm">Нет данных о заказах</p>
          )}
        </div>
      </div>
    </div>
  );
}
