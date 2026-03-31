"use client";

import { useState } from "react";
import { useBotContext } from "@/components/dashboard/BotContext";
import { trpc } from "@/lib/trpc";

export default function BroadcastsPage() {
  const { currentBotId, isDemo } = useBotContext();
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);

  const broadcastsQuery = trpc.broadcast.list.useQuery(
    { botId: currentBotId! },
    { enabled: !isDemo && !!currentBotId }
  );

  const createMutation = trpc.broadcast.create.useMutation({
    onSuccess: () => {
      broadcastsQuery.refetch();
      setMessage("");
      setShowForm(false);
    },
  });

  const sendMutation = trpc.broadcast.send.useMutation({
    onSuccess: () => broadcastsQuery.refetch(),
  });

  const handleCreate = () => {
    if (!message.trim() || !currentBotId) return;
    createMutation.mutate({
      botId: currentBotId,
      message: message.trim(),
      filters: filter !== "all" ? { language: filter } : undefined,
    });
  };

  const handleSend = (id: string) => {
    if (!currentBotId) return;
    sendMutation.mutate({ id, botId: currentBotId });
  };

  const broadcasts = broadcastsQuery.data ?? [];

  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700",
    SCHEDULED: "bg-blue-100 text-blue-700",
    SENDING: "bg-yellow-100 text-yellow-700",
    COMPLETED: "bg-green-100 text-green-700",
    FAILED: "bg-red-100 text-red-700",
  };

  const statusLabels: Record<string, string> = {
    DRAFT: "Черновик",
    SCHEDULED: "Запланирована",
    SENDING: "Отправляется...",
    COMPLETED: "Отправлена",
    FAILED: "Ошибка",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Рассылки</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          {showForm ? "Отмена" : "+ Новая рассылка"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-900">Новая рассылка</h2>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Текст сообщения..."
            rows={4}
            maxLength={4096}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm resize-none"
          />
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-600">Сегмент:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
            >
              <option value="all">Все клиенты</option>
              <option value="ru">Русскоязычные</option>
              <option value="uz">Узбекскоязычные</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              disabled={!message.trim() || createMutation.isPending}
              className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
              {createMutation.isPending ? "Сохранение..." : "Сохранить черновик"}
            </button>
          </div>
          <p className="text-xs text-gray-400">{message.length}/4096 символов</p>
        </div>
      )}

      {broadcasts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400">Рассылок пока нет</p>
          <p className="text-sm text-gray-300 mt-1">Создайте первую рассылку для ваших клиентов</p>
        </div>
      ) : (
        <div className="space-y-3">
          {broadcasts.map((b) => (
            <div key={b.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap line-clamp-3">
                    {b.message}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[b.status]}`}>
                      {statusLabels[b.status]}
                    </span>
                    {b.totalSent > 0 && (
                      <span className="text-xs text-gray-400">
                        {b.totalSent} отправлено
                        {b.totalFailed > 0 && `, ${b.totalFailed} ошибок`}
                      </span>
                    )}
                    <span className="text-xs text-gray-300">
                      {new Date(b.createdAt).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                </div>
                {(b.status === "DRAFT" || b.status === "SCHEDULED") && (
                  <button
                    onClick={() => handleSend(b.id)}
                    disabled={sendMutation.isPending}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-all whitespace-nowrap"
                  >
                    Отправить
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
