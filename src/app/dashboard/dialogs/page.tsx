"use client";

import { useState } from "react";
import { useBotContext } from "@/components/dashboard/BotContext";
import { useDemo } from "@/components/dashboard/DemoContext";
import { trpc } from "@/lib/trpc";

interface DisplayMessage {
  role: "customer" | "bot" | "operator";
  text: string;
  time: string;
}

interface DisplayConversation {
  id: string;
  customerName: string;
  phone: string;
  platform: "telegram" | "instagram" | "whatsapp";
  status: "ai_answered" | "operator_needed" | "active";
  lastMessage: string;
  time: string;
  unread: boolean;
  messages: DisplayMessage[];
}

const platformIcons = {
  telegram: "\u2708\uFE0F",
  instagram: "\uD83D\uDCF7",
  whatsapp: "\uD83D\uDCF1",
};

const statusConfig = {
  ai_answered: { label: "AI \u043E\u0442\u0432\u0435\u0442\u0438\u043B", color: "bg-green-50 text-green-700" },
  operator_needed: { label: "\u041D\u0443\u0436\u0435\u043D \u043E\u043F\u0435\u0440\u0430\u0442\u043E\u0440", color: "bg-red-50 text-red-700" },
  active: { label: "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0439", color: "bg-blue-50 text-blue-700" },
};

function timeAgo(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "\u0442\u043E\u043B\u044C\u043A\u043E \u0447\u0442\u043E";
  if (diff < 3600) return `${Math.floor(diff / 60)} \u043C\u0438\u043D \u043D\u0430\u0437\u0430\u0434`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} \u0447 \u043D\u0430\u0437\u0430\u0434`;
  return `${Math.floor(diff / 86400)} \u0434\u043D. \u043D\u0430\u0437\u0430\u0434`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

// Demo data fallback
const demoConversations: DisplayConversation[] = [
  {
    id: "1",
    customerName: "\u0410\u0437\u0438\u0437 \u041A\u0430\u0440\u0438\u043C\u043E\u0432",
    phone: "+998 90 123 45 67",
    platform: "telegram",
    status: "ai_answered",
    lastMessage: "\u0421\u043F\u0430\u0441\u0438\u0431\u043E, \u0437\u0430\u043A\u0430\u0437 \u043F\u043E\u043B\u0443\u0447\u0438\u043B!",
    time: "2 \u043C\u0438\u043D \u043D\u0430\u0437\u0430\u0434",
    unread: false,
    messages: [
      { role: "customer", text: "\u0417\u0434\u0440\u0430\u0432\u0441\u0442\u0432\u0443\u0439\u0442\u0435! \u041A\u0430\u043A\u0438\u0435 \u0446\u0432\u0435\u0442\u044B \u0435\u0441\u0442\u044C?", time: "10:30" },
      { role: "bot", text: "\u0417\u0434\u0440\u0430\u0432\u0441\u0442\u0432\u0443\u0439\u0442\u0435! \u0423 \u043D\u0430\u0441 \u0440\u043E\u0437\u044B, \u0442\u044E\u043B\u044C\u043F\u0430\u043D\u044B, \u0445\u0440\u0438\u0437\u0430\u043D\u0442\u0435\u043C\u044B. \u0427\u0442\u043E \u0438\u043D\u0442\u0435\u0440\u0435\u0441\u0443\u0435\u0442?", time: "10:30" },
      { role: "customer", text: "\u041A\u0440\u0430\u0441\u043D\u044B\u0435 \u0440\u043E\u0437\u044B, 15 \u0448\u0442\u0443\u043A", time: "10:31" },
      { role: "bot", text: "15 \u043A\u0440\u0430\u0441\u043D\u044B\u0445 \u0440\u043E\u0437 \u2014 225 000 \u0441\u0443\u043C. \u041E\u0444\u043E\u0440\u043C\u0438\u0442\u044C?", time: "10:31" },
      { role: "customer", text: "\u0421\u043F\u0430\u0441\u0438\u0431\u043E, \u0437\u0430\u043A\u0430\u0437 \u043F\u043E\u043B\u0443\u0447\u0438\u043B!", time: "12:45" },
    ],
  },
  {
    id: "2",
    customerName: "\u041D\u0438\u043B\u0443\u0444\u0430\u0440 \u0425\u0430\u0441\u0430\u043D\u043E\u0432\u0430",
    phone: "+998 91 234 56 78",
    platform: "instagram",
    status: "operator_needed",
    lastMessage: "\u0410 \u043C\u043E\u0436\u043D\u043E \u0437\u0430\u043A\u0430\u0437\u0430\u0442\u044C \u043D\u0430 \u0437\u0430\u0432\u0442\u0440\u0430 \u043A 10 \u0443\u0442\u0440\u0430?",
    time: "15 \u043C\u0438\u043D \u043D\u0430\u0437\u0430\u0434",
    unread: true,
    messages: [
      { role: "customer", text: "\u0414\u043E\u0431\u0440\u044B\u0439 \u0434\u0435\u043D\u044C! \u0425\u043E\u0447\u0443 \u0431\u0443\u043A\u0435\u0442 \u043D\u0430 \u0441\u0432\u0430\u0434\u044C\u0431\u0443", time: "11:00" },
      { role: "bot", text: "\u0414\u043E\u0431\u0440\u044B\u0439 \u0434\u0435\u043D\u044C! \u041A\u0430\u043A\u043E\u0439 \u0431\u044E\u0434\u0436\u0435\u0442 \u0438 \u043F\u0440\u0435\u0434\u043F\u043E\u0447\u0442\u0435\u043D\u0438\u044F?", time: "11:00" },
      { role: "customer", text: "\u0410 \u043C\u043E\u0436\u043D\u043E \u0437\u0430\u043A\u0430\u0437\u0430\u0442\u044C \u043D\u0430 \u0437\u0430\u0432\u0442\u0440\u0430 \u043A 10 \u0443\u0442\u0440\u0430?", time: "11:05" },
    ],
  },
];

export default function DialogsPage() {
  const { currentBotId, isDemo } = useBotContext();
  const { currentBot: demoBot } = useDemo();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch real conversations
  const conversationsQuery = trpc.conversation.list.useQuery(
    { botId: currentBotId!, limit: 50 },
    { enabled: !isDemo && !!currentBotId }
  );

  // Fetch selected conversation messages
  const selectedConvQuery = trpc.conversation.getById.useQuery(
    { id: selectedId!, botId: currentBotId!, messageLimit: 100 },
    { enabled: !isDemo && !!selectedId && !!currentBotId }
  );

  // Map real data to display format
  const conversations: DisplayConversation[] = isDemo
    ? (demoBot.dialogs?.length ? demoBot.dialogs.map((d: any) => ({
        id: d.id,
        customerName: d.customerName,
        phone: "",
        platform: (d.platform || "telegram") as "telegram" | "instagram" | "whatsapp",
        status: (d.status === "needs_operator" ? "operator_needed" : d.status === "active" ? "active" : "ai_answered") as DisplayConversation["status"],
        lastMessage: d.lastMessage,
        time: d.time,
        unread: d.unread || false,
        messages: d.messages?.map((m: any) => ({
          role: m.role === "user" ? "customer" as const : "bot" as const,
          text: m.text,
          time: m.time,
        })) || [],
      })) : demoConversations)
    : (conversationsQuery.data?.conversations || []).map((c) => {
        const lastMsg = c.messages[0];
        const lastMsgIsUser = lastMsg?.role === "USER";
        const hasHandoff = lastMsg?.handedOff;
        const status: DisplayConversation["status"] = hasHandoff
          ? "operator_needed"
          : lastMsgIsUser && !c.isResolved
          ? "active"
          : "ai_answered";

        return {
          id: c.id,
          customerName: c.customerName || c.platformChatId,
          phone: c.customerPhone || "",
          platform: (c.platform || "telegram") as "telegram" | "instagram" | "whatsapp",
          status,
          lastMessage: lastMsg?.content || "",
          time: timeAgo(new Date(c.updatedAt)),
          unread: lastMsgIsUser && !c.isResolved,
          messages: [], // loaded separately via getById
        };
      });

  // Get messages for selected conversation
  const selectedMessages: DisplayMessage[] = isDemo
    ? (conversations.find((c) => c.id === selectedId)?.messages || [])
    : (selectedConvQuery.data?.conversation?.messages || []).map((m) => ({
        role: m.role === "USER" ? "customer" as const : "bot" as const,
        text: m.content,
        time: formatTime(new Date(m.createdAt)),
      }));

  const selected = conversations.find((c) => c.id === selectedId) || null;

  const filtered = conversations.filter((c) => {
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return c.customerName.toLowerCase().includes(q) || c.phone.includes(q);
    }
    return true;
  });

  // Auto-select first conversation
  if (!selectedId && filtered.length > 0) {
    setSelectedId(filtered[0].id);
  }

  const isLoading = !isDemo && conversationsQuery.isLoading;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{"\u0414\u0438\u0430\u043B\u043E\u0433\u0438"}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {"\u0412\u0441\u0435 \u0440\u0430\u0437\u0433\u043E\u0432\u043E\u0440\u044B \u0441 \u043A\u043B\u0438\u0435\u043D\u0442\u0430\u043C\u0438"}
        </p>
      </div>

      <div className="flex h-[calc(100vh-220px)] rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {/* Conversations list */}
        <div className="flex w-full flex-col border-r border-gray-100 sm:w-80 lg:w-96">
          {/* Search & filter */}
          <div className="border-b border-gray-100 p-3 space-y-2">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={"\u041F\u043E\u0438\u0441\u043A..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
              />
            </div>
            <div className="flex gap-1">
              {[
                { key: "all", label: "\u0412\u0441\u0435" },
                { key: "operator_needed", label: "\u041E\u043F\u0435\u0440\u0430\u0442\u043E\u0440" },
                { key: "active", label: "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0435" },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilterStatus(f.key)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    filterStatus === f.key
                      ? "bg-[#3B82F6] text-white"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                      <div className="h-2 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm p-6 text-center">
                <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
                {"\u041F\u043E\u043A\u0430 \u043D\u0435\u0442 \u0434\u0438\u0430\u043B\u043E\u0433\u043E\u0432"}
              </div>
            ) : (
              filtered.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={`flex w-full items-center gap-3 p-3 text-left border-b border-gray-50 transition-colors ${
                    selectedId === conv.id
                      ? "bg-[#3B82F6]/5 border-l-2 border-l-[#3B82F6]"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">
                      {conv.customerName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 text-[10px]">
                      {platformIcons[conv.platform] || platformIcons.telegram}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {conv.customerName}
                      </span>
                      <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
                        {conv.time}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500 truncate">
                      {conv.lastMessage}
                    </p>
                    <span
                      className={`mt-1 inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium ${statusConfig[conv.status].color}`}
                    >
                      {statusConfig[conv.status].label}
                    </span>
                  </div>
                  {conv.unread && (
                    <span className="h-2.5 w-2.5 rounded-full bg-[#3B82F6] flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat view */}
        <div className="hidden flex-1 flex-col sm:flex">
          {selected ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">
                  {selected.customerName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {selected.customerName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selected.phone ? `${selected.phone} \u00B7 ` : ""}{platformIcons[selected.platform] || ""}{" "}
                    {selected.platform}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig[selected.status].color}`}
                >
                  {statusConfig[selected.status].label}
                </span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {(!isDemo && selectedConvQuery.isLoading) ? (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    {"\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0439..."}
                  </div>
                ) : selectedMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    {"\u041D\u0435\u0442 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0439"}
                  </div>
                ) : (
                  selectedMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${
                        msg.role === "customer" ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                          msg.role === "customer"
                            ? "bg-gray-100 text-gray-800"
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
                              : "text-white/60"
                          }`}
                        >
                          {msg.role === "bot" && "AI \u00B7 "}
                          {msg.role === "operator" && "\u041E\u043F\u0435\u0440\u0430\u0442\u043E\u0440 \u00B7 "}
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Reply bar */}
              <div className="border-t border-gray-100 p-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={"\u041E\u0442\u0432\u0435\u0442\u0438\u0442\u044C \u043A\u0430\u043A \u043E\u043F\u0435\u0440\u0430\u0442\u043E\u0440..."}
                    className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                  />
                  <button className="rounded-xl bg-[#3B82F6] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2563EB] transition-colors">
                    {"\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
              {"\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u0438\u0430\u043B\u043E\u0433"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
