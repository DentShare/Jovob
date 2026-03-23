"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc";

interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  href?: string;
}

export default function OnboardingPage() {
  const searchParams = useSearchParams();
  const botId = searchParams.get("botId");

  const botQuery = trpc.bot.getById.useQuery(
    { id: botId! },
    { enabled: !!botId }
  );

  const bot = botQuery.data;

  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: "created", label: "\u0411\u043E\u0442 \u0441\u043E\u0437\u0434\u0430\u043D", done: true },
    { id: "telegram", label: "Telegram \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0451\u043D", done: false },
    { id: "products", label: "\u0414\u043E\u0431\u0430\u0432\u044C\u0442\u0435 \u0442\u043E\u0432\u0430\u0440\u044B", done: false, href: "/dashboard/products" },
    { id: "faq", label: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u0442\u0435 FAQ", done: false, href: "/dashboard/knowledge" },
  ]);

  useEffect(() => {
    if (bot) {
      setChecklist((prev) =>
        prev.map((item) => {
          if (item.id === "telegram") return { ...item, done: !!bot.telegramToken };
          return item;
        })
      );
    }
  }, [bot]);

  const completedCount = checklist.filter((c) => c.done).length;
  const progress = Math.round((completedCount / checklist.length) * 100);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-100 mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {bot ? `${bot.name} \u0441\u043E\u0437\u0434\u0430\u043D!` : "\u0411\u043E\u0442 \u0441\u043E\u0437\u0434\u0430\u043D!"}
        </h1>
        <p className="text-gray-500">
          {"\u0412\u044B\u043F\u043E\u043B\u043D\u0438\u0442\u0435 \u044D\u0442\u0438 \u0448\u0430\u0433\u0438, \u0447\u0442\u043E\u0431\u044B \u043D\u0430\u0447\u0430\u0442\u044C \u043F\u0440\u0438\u043D\u0438\u043C\u0430\u0442\u044C \u043A\u043B\u0438\u0435\u043D\u0442\u043E\u0432"}
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-medium text-gray-700">{"\u041F\u0440\u043E\u0433\u0440\u0435\u0441\u0441 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438"}</span>
          <span className="text-gray-500">{completedCount}/{checklist.length}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-3 mb-8">
        {checklist.map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${
              item.done
                ? "bg-green-50 border-green-200"
                : "bg-white border-gray-200 hover:border-blue-200"
            }`}
          >
            <div
              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                item.done
                  ? "bg-green-500 text-white"
                  : "border-2 border-gray-300"
              }`}
            >
              {item.done && (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className={`flex-1 text-sm font-medium ${item.done ? "text-green-700" : "text-gray-700"}`}>
              {item.label}
            </span>
            {!item.done && item.href && (
              <Link
                href={item.href}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                {"\u041D\u0430\u0441\u0442\u0440\u043E\u0438\u0442\u044C \u2192"}
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Telegram QR */}
      {bot?.telegramBotName && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center mb-8">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            {"\u041E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 \u0431\u043E\u0442\u0430 \u0432 Telegram"}
          </h3>
          <a
            href={`https://t.me/${bot.telegramBotName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#2AABEE] text-white font-medium rounded-xl hover:bg-[#229ED9] transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
            @{bot.telegramBotName}
          </a>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-center gap-4">
        <Link
          href="/dashboard"
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium text-sm hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          {"\u041F\u0435\u0440\u0435\u0439\u0442\u0438 \u0432 \u0434\u0430\u0448\u0431\u043E\u0440\u0434"}
        </Link>
        <Link
          href="/dashboard/settings"
          className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
        >
          {"\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0431\u043E\u0442\u0430"}
        </Link>
      </div>
    </div>
  );
}
