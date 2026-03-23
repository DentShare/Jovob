"use client";

import { useState } from "react";
import { useBotContext } from "@/components/dashboard/BotContext";
import { trpc } from "@/lib/trpc";

const platforms = [
  {
    id: "telegram",
    name: "Telegram",
    icon: "\u2708\uFE0F",
    color: "bg-blue-500",
    description: "\u0421\u0430\u043C\u0430\u044F \u043F\u043E\u043F\u0443\u043B\u044F\u0440\u043D\u0430\u044F \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430 \u0432 \u0423\u0437\u0431\u0435\u043A\u0438\u0441\u0442\u0430\u043D\u0435",
    available: true,
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "\uD83D\uDCF7",
    color: "bg-pink-500",
    description: "Direct \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F \u0438 \u043A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0438",
    available: false,
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: "\uD83D\uDCF1",
    color: "bg-green-500",
    description: "WhatsApp Business API",
    available: false,
  },
];

export default function PlatformsPage() {
  const { currentBotId, isDemo } = useBotContext();

  const botQuery = trpc.bot.getById.useQuery(
    { id: currentBotId! },
    { enabled: !!currentBotId && !isDemo }
  );

  const bot = botQuery.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{"\u041F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u044B"}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {"\u0423\u043F\u0440\u0430\u0432\u043B\u044F\u0439\u0442\u0435 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u043D\u044B\u043C\u0438 \u043C\u0435\u0441\u0441\u0435\u043D\u0434\u0436\u0435\u0440\u0430\u043C\u0438"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {platforms.map((platform) => {
          const isConnected =
            platform.id === "telegram" && bot?.telegramToken
              ? true
              : false;

          return (
            <div
              key={platform.id}
              className={`rounded-2xl border-2 p-6 transition-all ${
                isConnected
                  ? "border-green-300 bg-green-50/30"
                  : platform.available
                  ? "border-gray-200 bg-white hover:border-gray-300"
                  : "border-gray-100 bg-gray-50 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${platform.color} flex items-center justify-center text-2xl text-white`}>
                  {platform.icon}
                </div>
                {isConnected && (
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                    {"\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D"}
                  </span>
                )}
                {!platform.available && (
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                    {"\u0421\u043A\u043E\u0440\u043E"}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-1">{platform.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{platform.description}</p>

              {isConnected && bot?.telegramBotName && (
                <div className="mb-4 rounded-lg bg-white border border-green-200 p-3">
                  <p className="text-xs text-gray-500 mb-1">Bot username</p>
                  <p className="text-sm font-medium text-gray-900">@{bot.telegramBotName}</p>
                </div>
              )}

              <button
                disabled={!platform.available}
                className={`w-full rounded-xl py-2.5 text-sm font-medium transition-colors ${
                  isConnected
                    ? "border-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                    : platform.available
                    ? "bg-[#3B82F6] text-white hover:bg-[#2563EB]"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isConnected ? "\u041D\u0430\u0441\u0442\u0440\u043E\u0438\u0442\u044C" : platform.available ? "\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0438\u0442\u044C" : "\u0421\u043A\u043E\u0440\u043E"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
