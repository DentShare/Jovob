"use client";

import React from "react";
import { motion } from "framer-motion";
import { useWizard } from "../WizardContext";

const t = {
  ru: {
    title: "На каких языках будет общаться бот?",
    subtitle: "Выберите языки, на которых бот будет отвечать клиентам",
    tip: "Один язык дешевле в обслуживании ИИ",
    continue: "Продолжить",
  },
  uz: {
    title: "Bot qaysi tillarda muloqot qiladi?",
    subtitle: "Mijozlarga javob berish tillarini tanlang",
    tip: "Bitta til AI xizmatiga arzonroq",
    continue: "Davom etish",
  },
  en: {
    title: "What languages will the bot speak?",
    subtitle: "Choose the languages your bot will respond in",
    tip: "One language is cheaper to run with AI",
    continue: "Continue",
  },
};

const options = [
  {
    id: "ru_only",
    langs: ["ru"],
    labels: { ru: "Только русский", uz: "Faqat ruscha", en: "Russian only" },
    price: "$",
    badge: null,
  },
  {
    id: "uz_only",
    langs: ["uz"],
    labels: { ru: "Только узбекский", uz: "Faqat o'zbekcha", en: "Uzbek only" },
    price: "$",
    badge: null,
  },
  {
    id: "ru_uz",
    langs: ["ru", "uz"],
    labels: { ru: "Русский + Узбекский", uz: "Ruscha + O'zbekcha", en: "Russian + Uzbek" },
    price: "$$",
    badge: { ru: "ПОПУЛЯРНЫЙ", uz: "OMMABOP", en: "POPULAR" },
  },
];

export default function Step2BotLanguage() {
  const { state, setStepData, goNext } = useWizard();
  const lang = state.language;
  const texts = t[lang] || t.ru;

  const selected = state.botLanguages;

  const handleSelect = (langs: string[]) => {
    setStepData({ botLanguages: langs });
  };

  const isSelected = (id: string) => {
    const opt = options.find((o) => o.id === id);
    if (!opt) return false;
    return JSON.stringify(opt.langs) === JSON.stringify(selected);
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-6">
        {options.map((opt, i) => (
          <motion.button
            key={opt.id}
            onClick={() => handleSelect(opt.langs)}
            className={`relative bg-white rounded-2xl border-2 p-6 flex flex-col items-center gap-3 transition-all duration-200 cursor-pointer ${
              isSelected(opt.id)
                ? "border-blue-500 shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/20"
                : "border-slate-200 hover:border-blue-400 hover:shadow-md"
            }`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {opt.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                {opt.badge[lang] || opt.badge.ru}
              </span>
            )}
            <span className="text-lg font-semibold text-slate-800">
              {opt.labels[lang] || opt.labels.ru}
            </span>
            <span className="text-2xl font-bold text-blue-500">{opt.price}</span>
          </motion.button>
        ))}
      </div>

      <motion.div
        className="flex items-center justify-center gap-2 text-sm text-slate-400 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {texts.tip}
      </motion.div>

      <motion.button
        onClick={goNext}
        disabled={selected.length === 0}
        className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        whileHover={{ scale: selected.length > 0 ? 1.05 : 1 }}
        whileTap={{ scale: 0.97 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {texts.continue}
      </motion.button>
    </div>
  );
}
