"use client";

import { useState, useEffect } from "react";
import { useBotContext } from "./BotContext";
import { trpc } from "@/lib/trpc";

interface BotConfig {
  name: string;
  description: string;
  personality: string;
  welcomeMessage: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  workingDays: string[];
  isActive: boolean;
}

const defaultConfig: BotConfig = {
  name: "FlowerShop Bot",
  description: "AI-помощник для цветочного магазина в Ташкенте. Помогает с заказами, доставкой и консультациями.",
  personality: "Дружелюбный и вежливый. Отвечаю на узбекском и русском. Всегда предлагаю помощь и рекомендации.",
  welcomeMessage: "Здравствуйте! Добро пожаловать в наш цветочный магазин. Чем могу помочь?",
  workingHoursStart: "08:00",
  workingHoursEnd: "22:00",
  workingDays: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
  isActive: true,
};

const allDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export default function BotSettings() {
  const { currentBotId, isDemo } = useBotContext();
  const [config, setConfig] = useState(defaultConfig);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch real bot data
  const botQuery = trpc.bot.getById.useQuery(
    { id: currentBotId! },
    { enabled: !isDemo && !!currentBotId, retry: false }
  );

  // Mutation for saving
  const updateMutation = trpc.bot.update.useMutation({
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      botQuery.refetch();
    },
  });

  const deleteMutation = trpc.bot.delete.useMutation({
    onSuccess: () => {
      // Redirect after deletion
      if (typeof window !== "undefined") {
        window.location.href = "/create";
      }
    },
  });

  // Populate config from real bot data
  useEffect(() => {
    if (!isDemo && botQuery.data) {
      const bot = botQuery.data;
      const wh = bot.workingHours as Record<string, unknown> | null;
      setConfig({
        name: bot.name,
        description: bot.description ?? "",
        personality: bot.personality ?? "",
        welcomeMessage: bot.welcomeMessage ?? "",
        workingHoursStart: (wh?.start as string) ?? "08:00",
        workingHoursEnd: (wh?.end as string) ?? "22:00",
        workingDays: (wh?.days as string[]) ?? allDays,
        isActive: bot.isActive,
      });
    }
  }, [isDemo, botQuery.data]);

  const handleSave = () => {
    if (isDemo) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      return;
    }
    updateMutation.mutate({
      id: currentBotId!,
      name: config.name,
      description: config.description,
      personality: config.personality,
      welcomeMessage: config.welcomeMessage,
      workingHours: {
        start: config.workingHoursStart,
        end: config.workingHoursEnd,
        days: config.workingDays,
      },
    });
  };

  const handleDelete = () => {
    if (isDemo) {
      setShowDeleteConfirm(false);
      return;
    }
    deleteMutation.mutate({ id: currentBotId! });
  };

  const toggleDay = (day: string) => {
    setConfig((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day],
    }));
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Bot info */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Основная информация
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Имя бота
            </label>
            <input
              type="text"
              value={config.name}
              onChange={(e) => setConfig({ ...config, name: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Описание
            </label>
            <textarea
              value={config.description}
              onChange={(e) =>
                setConfig({ ...config, description: e.target.value })
              }
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Личность бота
            </label>
            <textarea
              value={config.personality}
              onChange={(e) =>
                setConfig({ ...config, personality: e.target.value })
              }
              rows={3}
              placeholder="Опишите характер и стиль общения бота..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] resize-none"
            />
            <p className="mt-1 text-xs text-gray-400">
              AI будет адаптировать стиль общения под это описание
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Приветственное сообщение
            </label>
            <textarea
              value={config.welcomeMessage}
              onChange={(e) =>
                setConfig({ ...config, welcomeMessage: e.target.value })
              }
              rows={2}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] resize-none"
            />
          </div>
        </div>
      </div>

      {/* Working hours */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Рабочее время
        </h3>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Начало
              </label>
              <input
                type="time"
                value={config.workingHoursStart}
                onChange={(e) =>
                  setConfig({ ...config, workingHoursStart: e.target.value })
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Конец
              </label>
              <input
                type="time"
                value={config.workingHoursEnd}
                onChange={(e) =>
                  setConfig({ ...config, workingHoursEnd: e.target.value })
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Рабочие дни
            </label>
            <div className="flex flex-wrap gap-2">
              {allDays.map((day) => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    config.workingDays.includes(day)
                      ? "bg-[#3B82F6] text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Вне рабочего времени бот будет информировать клиентов о графике работы
          </p>
        </div>
      </div>

      {/* Status */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Статус бота
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {config.isActive
                ? "Бот активен и отвечает на сообщения"
                : "Бот приостановлен и не отвечает"}
            </p>
          </div>
          <button
            onClick={() => setConfig({ ...config, isActive: !config.isActive })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              config.isActive ? "bg-[#3B82F6]" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white transition-transform shadow-sm ${
                config.isActive ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className={`rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-all ${
            saved
              ? "bg-green-500"
              : "bg-[#3B82F6] hover:bg-[#2563EB]"
          } disabled:opacity-50`}
        >
          {updateMutation.isPending ? "Сохранение..." : saved ? "Сохранено!" : "Сохранить изменения"}
        </button>
      </div>

      {/* Danger zone */}
      <div className="rounded-xl border border-red-200 bg-red-50/50 p-6">
        <h3 className="text-base font-semibold text-red-900 mb-1">
          Опасная зона
        </h3>
        <p className="text-sm text-red-700/70 mb-4">
          Эти действия необратимы. Будьте осторожны.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setConfig({ ...config, isActive: false })}
            className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
          >
            Деактивировать бота
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
          >
            Удалить бота
          </button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h4 className="text-center text-lg font-semibold text-gray-900">
              Удалить бота?
            </h4>
            <p className="mt-2 text-center text-sm text-gray-500">
              Все данные, диалоги, заказы и настройки будут удалены безвозвратно.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Удаление..." : "Удалить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
