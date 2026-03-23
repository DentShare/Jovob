"use client";

import { useDemo } from "./DemoContext";
import Link from "next/link";

export default function DemoBanner() {
  const { currentBot, switchBot } = useDemo();

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
      {/* Animated background shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_3s_infinite] -skew-x-12" />

      <div className="relative flex items-center justify-between px-4 py-2.5 lg:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 text-sm backdrop-blur-sm flex-shrink-0">
            {currentBot.emoji}
          </span>
          <p className="text-sm font-medium text-white truncate">
            <span className="hidden sm:inline">Вы просматриваете демо-аккаунт </span>
            <span className="sm:hidden">Демо: </span>
            <span className="font-bold">{currentBot.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={switchBot}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm border border-white/20 hover:bg-white/25 transition-all duration-200"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span className="hidden sm:inline">Переключить демо</span>
            <span className="sm:hidden">Другой</span>
          </button>

          <Link
            href="/create"
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-gray-50 transition-all duration-200 shadow-sm"
          >
            <span className="hidden sm:inline">Создать своего бота</span>
            <span className="sm:hidden">Создать</span>
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
