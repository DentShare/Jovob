"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useWizard } from "../WizardContext";

const t = {
  ru: { title: "Что будет уметь ваш бот?", subtitle: "Мы предвыбрали подходящие для вашего бизнеса", continue: "Продолжить" },
  uz: { title: "Botingiz nimalarni biladi?", subtitle: "Biznesingizga mos variantlarni tanladik", continue: "Davom etish" },
  en: { title: "What will your bot do?", subtitle: "We pre-selected features for your business", continue: "Continue" },
};

interface Cap {
  id: string;
  emoji: string;
  labels: Record<string, string>;
  desc: Record<string, string>;
}

const capabilities: Cap[] = [
  {
    id: "ai_answers",
    emoji: "💬",
    labels: { ru: "ИИ-ответы", uz: "AI javoblar", en: "AI Answers" },
    desc: { ru: "Умный чат-бот отвечает на вопросы клиентов", uz: "Aqlli chatbot mijozlar savollariga javob beradi", en: "Smart chatbot answers customer questions" },
  },
  {
    id: "catalog",
    emoji: "🛒",
    labels: { ru: "Каталог товаров", uz: "Tovarlar katalogi", en: "Product Catalog" },
    desc: { ru: "Покажите товары и услуги прямо в боте", uz: "Tovar va xizmatlarni botda ko'rsating", en: "Show products and services in the bot" },
  },
  {
    id: "orders",
    emoji: "📝",
    labels: { ru: "Приём заказов", uz: "Buyurtma qabul qilish", en: "Order Taking" },
    desc: { ru: "Клиенты заказывают через бот, вы получаете уведомление", uz: "Mijozlar bot orqali buyurtma beradi", en: "Customers order via bot, you get notified" },
  },
  {
    id: "booking",
    emoji: "📅",
    labels: { ru: "Запись / бронь", uz: "Bron qilish", en: "Booking" },
    desc: { ru: "Запись на приём или бронирование времени", uz: "Qabulga yozilish yoki vaqtni band qilish", en: "Appointment booking or time reservation" },
  },
  {
    id: "broadcast",
    emoji: "📢",
    labels: { ru: "Рассылки", uz: "Xabar tarqatish", en: "Broadcasts" },
    desc: { ru: "Отправляйте акции и новости клиентам", uz: "Aksiyalar va yangiliklar yuboring", en: "Send promotions and news to customers" },
  },
  {
    id: "handoff",
    emoji: "👤",
    labels: { ru: "Переход к оператору", uz: "Operatorga ulanish", en: "Human Handoff" },
    desc: { ru: "Клиент может позвать живого менеджера", uz: "Mijoz jonli menejerga murojaat qilishi mumkin", en: "Customer can reach a human manager" },
  },
];

const businessPresets: Record<string, string[]> = {
  clothing: ["ai_answers", "catalog", "orders", "broadcast"],
  food: ["ai_answers", "catalog", "orders", "broadcast"],
  beauty: ["ai_answers", "booking", "broadcast", "handoff"],
  electronics: ["ai_answers", "catalog", "orders", "handoff"],
  education: ["ai_answers", "booking", "broadcast"],
  home_services: ["ai_answers", "booking", "handoff"],
  auto: ["ai_answers", "catalog", "booking", "handoff"],
  pharmacy: ["ai_answers", "catalog", "orders", "broadcast"],
  other: ["ai_answers", "handoff", "broadcast"],
};

export default function Step4Capabilities() {
  const { state, setStepData, goNext } = useWizard();
  const lang = state.language;
  const texts = t[lang] || t.ru;
  const initialized = useRef(false);

  // Pre-select based on business type (only on first render if empty)
  useEffect(() => {
    if (!initialized.current && state.capabilities.length === 0 && state.businessType) {
      const preset = businessPresets[state.businessType] || businessPresets.other;
      setStepData({ capabilities: preset });
      initialized.current = true;
    }
  }, [state.businessType, state.capabilities.length, setStepData]);

  const toggle = (id: string) => {
    const current = state.capabilities;
    const next = current.includes(id) ? current.filter((c) => c !== id) : [...current, id];
    setStepData({ capabilities: next });
  };

  return (
    <div className="text-center">
      <motion.h1
        className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {texts.title}
      </motion.h1>
      <motion.p
        className="text-slate-500 mb-10 text-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {texts.subtitle}
      </motion.p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
        {capabilities.map((cap, i) => {
          const active = state.capabilities.includes(cap.id);
          return (
            <motion.button
              key={cap.id}
              onClick={() => toggle(cap.id)}
              className={`relative bg-white rounded-2xl border-2 p-5 text-left flex items-start gap-4 transition-all duration-200 cursor-pointer ${
                active
                  ? "border-blue-500 shadow-lg shadow-blue-500/10"
                  : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.06 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Toggle indicator */}
              <div
                className={`mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  active ? "bg-blue-500 border-blue-500" : "border-slate-300"
                }`}
              >
                {active && (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{cap.emoji}</span>
                  <span className="font-semibold text-slate-800">{cap.labels[lang] || cap.labels.ru}</span>
                </div>
                <p className="text-sm text-slate-500">{cap.desc[lang] || cap.desc.ru}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      <motion.button
        onClick={goNext}
        disabled={state.capabilities.length === 0}
        className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        whileHover={{ scale: state.capabilities.length > 0 ? 1.05 : 1 }}
        whileTap={{ scale: 0.97 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {texts.continue}
      </motion.button>
    </div>
  );
}
