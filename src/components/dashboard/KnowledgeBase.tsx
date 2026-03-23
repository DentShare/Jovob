"use client";

import { useState, useEffect, useMemo } from "react";
import { useBotContext } from "./BotContext";
import { trpc } from "@/lib/trpc";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface Document {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  type: "pdf" | "docx" | "txt";
}

const demoFaq: FaqItem[] = [
  {
    id: "1",
    question: "Как сделать заказ?",
    answer: "Выберите товары из каталога, добавьте в корзину и нажмите \"Оформить заказ\". Укажите адрес доставки и способ оплаты.",
  },
  {
    id: "2",
    question: "Какие способы оплаты принимаете?",
    answer: "Мы принимаем оплату через Click, Payme, Uzum Pay, а также наличными при доставке.",
  },
  {
    id: "3",
    question: "Сколько стоит доставка?",
    answer: "Доставка по Ташкенту бесплатная при заказе от 100 000 сум. При заказе менее этой суммы -- 15 000 сум.",
  },
  {
    id: "4",
    question: "Можно ли вернуть товар?",
    answer: "К сожалению, цветы являются скоропортящимся товаром и возврату не подлежат. Если букет пришел поврежденным, свяжитесь с нами для замены.",
  },
  {
    id: "5",
    question: "Время работы?",
    answer: "Мы работаем ежедневно с 8:00 до 22:00. Заказы принимаются круглосуточно через бота.",
  },
];

const demoDocs: Document[] = [
  { id: "1", name: "Каталог весна 2026.pdf", size: "2.4 МБ", uploadedAt: "20.03.2026", type: "pdf" },
  { id: "2", name: "Правила доставки.docx", size: "156 КБ", uploadedAt: "15.03.2026", type: "docx" },
  { id: "3", name: "Описание услуг.txt", size: "12 КБ", uploadedAt: "10.03.2026", type: "txt" },
];

const docIcons: Record<string, string> = {
  pdf: "\uD83D\uDCC4",
  docx: "\uD83D\uDCDD",
  txt: "\uD83D\uDCC3",
};

export default function KnowledgeBase() {
  const { currentBotId, isDemo } = useBotContext();
  const [activeTab, setActiveTab] = useState<"faq" | "docs">("faq");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQ, setEditQ] = useState("");
  const [editA, setEditA] = useState("");
  const [showAddFaq, setShowAddFaq] = useState(false);
  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");

  // Fetch real FAQ
  const faqQuery = trpc.faq.list.useQuery(
    { botId: currentBotId! },
    { enabled: !isDemo && !!currentBotId, retry: false }
  );

  // Mutations
  const createFaqMutation = trpc.faq.create.useMutation({
    onSuccess: () => {
      faqQuery.refetch();
      setShowAddFaq(false);
      setNewQ("");
      setNewA("");
    },
  });

  const updateFaqMutation = trpc.faq.update.useMutation({
    onSuccess: () => {
      faqQuery.refetch();
      setEditingId(null);
    },
  });

  const deleteFaqMutation = trpc.faq.delete.useMutation({
    onSuccess: () => faqQuery.refetch(),
  });

  // Map real FAQ to local format
  const realFaqItems: FaqItem[] = useMemo(() => {
    if (isDemo || !faqQuery.data) return [];
    return faqQuery.data.map((f) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
    }));
  }, [isDemo, faqQuery.data]);

  // Local state for demo mode editing
  const [localDemoFaq, setLocalDemoFaq] = useState(demoFaq);

  const faqItems = isDemo ? localDemoFaq : realFaqItems;

  const startEdit = (item: FaqItem) => {
    setEditingId(item.id);
    setEditQ(item.question);
    setEditA(item.answer);
  };

  const saveEdit = () => {
    if (!editQ.trim() || !editA.trim()) return;
    if (isDemo) {
      setLocalDemoFaq((prev) =>
        prev.map((f) =>
          f.id === editingId ? { ...f, question: editQ, answer: editA } : f
        )
      );
      setEditingId(null);
    } else {
      updateFaqMutation.mutate({
        id: editingId!,
        botId: currentBotId!,
        question: editQ,
        answer: editA,
      });
    }
  };

  const deleteFaq = (id: string) => {
    if (isDemo) {
      setLocalDemoFaq((prev) => prev.filter((f) => f.id !== id));
    } else {
      deleteFaqMutation.mutate({ id, botId: currentBotId! });
    }
  };

  const addFaq = () => {
    if (!newQ.trim() || !newA.trim()) return;
    if (isDemo) {
      setLocalDemoFaq((prev) => [
        ...prev,
        { id: Date.now().toString(), question: newQ, answer: newA },
      ]);
      setNewQ("");
      setNewA("");
      setShowAddFaq(false);
    } else {
      createFaqMutation.mutate({
        botId: currentBotId!,
        question: newQ,
        answer: newA,
      });
    }
  };

  return (
    <div>
      {/* Tabs */}
      <div className="mb-4 flex items-center gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("faq")}
          className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
            activeTab === "faq"
              ? "border-[#3B82F6] text-[#3B82F6]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          FAQ ({faqItems.length})
        </button>
        <button
          onClick={() => setActiveTab("docs")}
          className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
            activeTab === "docs"
              ? "border-[#3B82F6] text-[#3B82F6]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Документы ({demoDocs.length})
        </button>
      </div>

      {/* FAQ Tab */}
      {activeTab === "faq" && (
        <div>
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => setShowAddFaq(!showAddFaq)}
              className="flex items-center gap-1.5 rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-medium text-white hover:bg-[#2563EB] transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Добавить FAQ
            </button>
          </div>

          {/* Add new FAQ */}
          {showAddFaq && (
            <div className="mb-4 rounded-xl border border-[#3B82F6]/20 bg-blue-50/30 p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Новый вопрос-ответ</h4>
              <input
                type="text"
                placeholder="Вопрос"
                value={newQ}
                onChange={(e) => setNewQ(e.target.value)}
                className="mb-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
              />
              <textarea
                placeholder="Ответ"
                value={newA}
                onChange={(e) => setNewA(e.target.value)}
                rows={3}
                className="mb-3 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={addFaq}
                  disabled={!newQ.trim() || !newA.trim() || createFaqMutation.isPending}
                  className="rounded-lg bg-[#3B82F6] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#2563EB] transition-colors disabled:opacity-50"
                >
                  {createFaqMutation.isPending ? "..." : "Сохранить"}
                </button>
                <button
                  onClick={() => { setShowAddFaq(false); setNewQ(""); setNewA(""); }}
                  className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          )}

          {/* FAQ list */}
          <div className="space-y-3">
            {faqItems.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                {editingId === item.id ? (
                  <div>
                    <input
                      type="text"
                      value={editQ}
                      onChange={(e) => setEditQ(e.target.value)}
                      className="mb-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                    />
                    <textarea
                      value={editA}
                      onChange={(e) => setEditA(e.target.value)}
                      rows={3}
                      className="mb-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        disabled={updateFaqMutation.isPending}
                        className="rounded-lg bg-[#3B82F6] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#2563EB] transition-colors disabled:opacity-50"
                      >
                        {updateFaqMutation.isPending ? "..." : "Сохранить"}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          Q: {item.question}
                        </p>
                        <p className="mt-2 text-sm text-gray-600">
                          A: {item.answer}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => startEdit(item)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-[#3B82F6] transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteFaq(item.id)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === "docs" && (
        <div>
          <div className="mb-4 flex justify-end">
            <button className="flex items-center gap-1.5 rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-medium text-white hover:bg-[#2563EB] transition-colors">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Загрузить документ
            </button>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            {demoDocs.map((doc, i) => (
              <div
                key={doc.id}
                className={`flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors ${
                  i < demoDocs.length - 1 ? "border-b border-gray-50" : ""
                }`}
              >
                <span className="text-2xl">{docIcons[doc.type]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {doc.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {doc.size} · Загружен {doc.uploadedAt}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                  <button className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
