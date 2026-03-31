"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDemo } from "./DemoContext";
import { useBotContext } from "./BotContext";

const navItems = [
  { href: "/dashboard", icon: "📊", label: "Главная" },
  { href: "/dashboard/analytics", icon: "📈", label: "Аналитика" },
  { href: "/dashboard/dialogs", icon: "💬", label: "Диалоги" },
  { href: "/dashboard/orders", icon: "🛒", label: "Заказы" },
  { href: "/dashboard/customers", icon: "👥", label: "Клиенты" },
  { href: "/dashboard/products", icon: "📦", label: "Товары" },
  { href: "/dashboard/knowledge", icon: "🧠", label: "База знаний" },
  { href: "/dashboard/broadcasts", icon: "📣", label: "Рассылки" },
  { href: "/dashboard/constructor", icon: "🔧", label: "Конструктор" },
  { href: "/dashboard/platforms", icon: "📡", label: "Платформы" },
  { href: "/dashboard/plan", icon: "💳", label: "Тариф" },
  { href: "/dashboard/settings", icon: "⚙️", label: "Настройки" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { currentBot: demoBot, switchBot: switchDemoBot } = useDemo();
  const { currentBot: realBot, bots, switchBot: switchRealBot, isDemo, currentBotId } = useBotContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [botDropdownOpen, setBotDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Unified bot info for display
  const displayName = isDemo
    ? demoBot.name
    : (realBot && "name" in realBot ? realBot.name : "Бот");
  const displayEmoji = isDemo ? demoBot.emoji : "\uD83E\uDD16";

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-full overflow-hidden bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#1E293B] transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-6 border-b border-white/10">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-lg font-bold text-white">
            J
          </div>
          <span className="text-lg font-semibold text-white">Jovob</span>
          <span className="ml-auto rounded-full bg-[#8B5CF6]/20 px-2 py-0.5 text-xs text-[#8B5CF6]">
            v1
          </span>
          <button
            className="ml-2 text-white/60 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#3B82F6]/15 text-[#3B82F6]"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
                {item.label === "Диалоги" && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white">
                    3
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3B82F6] text-sm font-medium text-white">
              А
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-white">
                Алишер
              </p>
              <p className="truncate text-xs text-gray-400">Бизнес план</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 lg:px-6">
          {/* Hamburger */}
          <button
            className="text-gray-500 hover:text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Bot selector */}
          <div className="relative">
            <button
              onClick={() => setBotDropdownOpen(!botDropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded bg-[#3B82F6]/10 text-xs">
                {displayEmoji}
              </span>
              <span className="max-w-[140px] truncate">
                {displayName}
              </span>
              <svg
                className={`h-4 w-4 text-gray-400 transition-transform ${
                  botDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {botDropdownOpen && (
              <div className="absolute top-full left-0 z-50 mt-1 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                {isDemo ? (
                  <>
                    <button
                      onClick={() => {
                        if (demoBot.id !== "bellaModa") switchDemoBot();
                        setBotDropdownOpen(false);
                      }}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 ${
                        demoBot.id === "bellaModa"
                          ? "text-[#3B82F6] font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      <span className="text-xs">{"\uD83D\uDC57"}</span>
                      Bella Moda
                      {demoBot.id === "bellaModa" && (
                        <span className="ml-auto text-[#3B82F6]">{"\u2713"}</span>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (demoBot.id !== "opiPlov") switchDemoBot();
                        setBotDropdownOpen(false);
                      }}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 ${
                        demoBot.id === "opiPlov"
                          ? "text-[#3B82F6] font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      <span className="text-xs">{"\uD83C\uDF7D\uFE0F"}</span>
                      Opi Plov
                      {demoBot.id === "opiPlov" && (
                        <span className="ml-auto text-[#3B82F6]">{"\u2713"}</span>
                      )}
                    </button>
                  </>
                ) : (
                  bots.map((bot) => (
                    <button
                      key={bot.id}
                      onClick={() => {
                        switchRealBot(bot.id);
                        setBotDropdownOpen(false);
                      }}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 ${
                        bot.id === currentBotId
                          ? "text-[#3B82F6] font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      <span className="text-xs">{"\uD83E\uDD16"}</span>
                      {bot.name}
                      {bot.id === currentBotId && (
                        <span className="ml-auto text-[#3B82F6]">{"\u2713"}</span>
                      )}
                    </button>
                  ))
                )}
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <Link
                    href="/create"
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[#3B82F6] hover:bg-gray-50"
                  >
                    <span>+</span> Создать своего бота
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Status badge */}
          <div className="hidden items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 sm:flex">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-green-700">Онлайн</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
                5
              </span>
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 top-full z-50 mt-1 w-80 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
                <p className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">
                  Уведомления
                </p>
                {[
                  {
                    text: "Новый заказ #1024 от клиента",
                    time: "2 мин назад",
                  },
                  {
                    text: "Бот не смог ответить на вопрос",
                    time: "15 мин назад",
                  },
                  {
                    text: "Оплата получена: 150 000 сум",
                    time: "1 час назад",
                  },
                ].map((n, i) => (
                  <button
                    key={i}
                    className="flex w-full flex-col gap-0.5 px-4 py-2 text-left hover:bg-gray-50"
                  >
                    <span className="text-sm text-gray-700">{n.text}</span>
                    <span className="text-xs text-gray-400">{n.time}</span>
                  </button>
                ))}
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button className="w-full px-4 py-2 text-center text-xs text-[#3B82F6] hover:bg-gray-50">
                    Все уведомления
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-sm font-medium text-white">
              А
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
