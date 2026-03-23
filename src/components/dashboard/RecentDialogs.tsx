"use client";

import { useState, useMemo } from "react";
import { useDemo } from "./DemoContext";
import { useBotContext } from "./BotContext";
import { trpc } from "@/lib/trpc";
import type { DemoDialog } from "./DemoContext";

const platformIcons = {
  telegram: "\u2708\uFE0F",
  instagram: "\uD83D\uDCF7",
  whatsapp: "\uD83D\uDCF1",
};

export default function RecentDialogs() {
  const { currentBot: demoBot } = useDemo();
  const { currentBotId, isDemo } = useBotContext();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const conversationsQuery = trpc.conversation.list.useQuery(
    { botId: currentBotId!, limit: 6 },
    { enabled: !isDemo && !!currentBotId, retry: false }
  );

  // Map real conversations to DemoDialog format for unified rendering
  const realDialogs: DemoDialog[] = useMemo(() => {
    if (isDemo || !conversationsQuery.data) return [];
    return conversationsQuery.data.conversations.map((c) => ({
      id: c.id,
      customerName: c.customerName ?? c.platformChatId ?? "Unknown",
      lastMessage: c.messages[0]?.content ?? "",
      time: new Date(c.updatedAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
      platform: (c.platform?.toLowerCase() ?? "telegram") as "telegram" | "instagram" | "whatsapp",
      status: c.isResolved ? "ai_answered" as const : "operator_needed" as const,
      unread: !c.isResolved,
      messages: [],
    }));
  }, [isDemo, conversationsQuery.data]);

  const dialogs = isDemo ? demoBot.dialogs : realDialogs;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Последние диалоги</h2>
        <a
          href="/dashboard/dialogs"
          className="text-sm font-medium text-[#3B82F6] hover:text-[#2563EB] transition-colors"
        >
          Все диалоги &rarr;
        </a>
      </div>
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {dialogs.map((dialog: DemoDialog) => {
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
                    {dialog.status === "ai_answered" ? "\u2705 AI" : "\u274C \u041E\u043F\u0435\u0440\u0430\u0442\u043E\u0440"}
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
                            {msg.role === "bot" ? "\uD83E\uDD16 " : msg.role === "operator" ? "\uD83D\uDC64 " : ""}
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
