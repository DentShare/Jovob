"use client";

import { useState, useEffect, useMemo } from "react";
import { useDemo } from "./DemoContext";
import { useBotContext } from "./BotContext";
import { trpc } from "@/lib/trpc";
import type { DemoUnanswered } from "./DemoContext";

export default function UnansweredQuestions() {
  const { currentBot: demoBot } = useDemo();
  const { currentBotId, isDemo } = useBotContext();

  const unansweredQuery = trpc.conversation.getUnanswered.useQuery(
    { botId: currentBotId! },
    { enabled: !isDemo && !!currentBotId, retry: false }
  );

  // Map real unanswered to DemoUnanswered format
  const realUnanswered: DemoUnanswered[] = useMemo(() => {
    if (isDemo || !unansweredQuery.data) return [];
    return unansweredQuery.data.map((c) => ({
      id: c.id,
      question: c.messages[0]?.content ?? "Без текста",
      askedCount: c._count.messages,
      lastAsked: new Date(c.updatedAt).toLocaleDateString("ru-RU"),
    }));
  }, [isDemo, unansweredQuery.data]);

  const source = isDemo ? demoBot.unanswered : realUnanswered;

  const [questions, setQuestions] = useState<DemoUnanswered[]>(source);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");

  // Reset questions when bot switches or data changes
  useEffect(() => {
    setQuestions(source);
    setEditingId(null);
    setAnswerText("");
  }, [source]);

  const handleAddAnswer = (id: string) => {
    if (!answerText.trim()) return;
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    setEditingId(null);
    setAnswerText("");
  };

  const handleDismiss = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  if (questions.length === 0) {
    return (
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Неотвеченные вопросы
        </h2>
        <div className="rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-900">Все вопросы отвечены!</p>
          <p className="mt-1 text-xs text-gray-500">Бот справляется отлично</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Неотвеченные вопросы
        </h2>
        <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
          {questions.length} вопросов
        </span>
      </div>
      <div className="space-y-3">
        {questions.map((q) => (
          <div
            key={q.id}
            className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{q.question}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                  <span>Спрашивали {q.askedCount} раз</span>
                  <span>&middot;</span>
                  <span>{q.lastAsked}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {editingId !== q.id && (
                  <>
                    <button
                      onClick={() => {
                        setEditingId(q.id);
                        setAnswerText("");
                      }}
                      className="rounded-lg bg-[#3B82F6] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#2563EB] transition-colors"
                    >
                      Добавить ответ
                    </button>
                    <button
                      onClick={() => handleDismiss(q.id)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Inline answer form */}
            {editingId === q.id && (
              <div className="mt-3 border-t border-gray-100 pt-3">
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Введите ответ на вопрос..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] resize-none"
                  autoFocus
                />
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => handleAddAnswer(q.id)}
                    disabled={!answerText.trim()}
                    className="rounded-lg bg-[#3B82F6] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#2563EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Сохранить в FAQ
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setAnswerText("");
                    }}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
