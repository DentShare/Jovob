"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useWizard } from "../WizardContext";

const t = {
  ru: { title: "Какой у вас бизнес?", subtitle: "Мы подберём подходящие функции", otherPlaceholder: "Опишите ваш бизнес..." },
  uz: { title: "Sizning biznesingiz qanday?", subtitle: "Biz mos funksiyalarni tanlaymiz", otherPlaceholder: "Biznesingizni tavsiflang..." },
  en: { title: "What's your business?", subtitle: "We'll suggest the right features", otherPlaceholder: "Describe your business..." },
};

const businessTypes = [
  { id: "clothing", emoji: "🛍️", labels: { ru: "Одежда", uz: "Kiyim-kechak", en: "Clothing" } },
  { id: "food", emoji: "🍕", labels: { ru: "Еда и напитки", uz: "Ovqat va ichimlik", en: "Food & Drink" } },
  { id: "beauty", emoji: "💇", labels: { ru: "Красота", uz: "Go'zallik", en: "Beauty" } },
  { id: "electronics", emoji: "📱", labels: { ru: "Электроника", uz: "Elektronika", en: "Electronics" } },
  { id: "education", emoji: "🎓", labels: { ru: "Образование", uz: "Ta'lim", en: "Education" } },
  { id: "home_services", emoji: "🏠", labels: { ru: "Услуги для дома", uz: "Uy xizmatlari", en: "Home Services" } },
  { id: "auto", emoji: "🚗", labels: { ru: "Авто", uz: "Avto", en: "Auto" } },
  { id: "pharmacy", emoji: "💊", labels: { ru: "Аптека", uz: "Dorixona", en: "Pharmacy" } },
  { id: "other", emoji: "✨", labels: { ru: "Другое", uz: "Boshqa", en: "Other" } },
];

export default function Step3BusinessType() {
  const { state, setStepData, goNext } = useWizard();
  const lang = state.language;
  const texts = t[lang] || t.ru;
  const [showOtherInput, setShowOtherInput] = useState(state.businessType === "other");
  const [customType, setCustomType] = useState(state.customBusinessType || "");

  const handleSelect = (id: string) => {
    if (id === "other") {
      setShowOtherInput(true);
      setStepData({ businessType: "other" });
      return;
    }
    setShowOtherInput(false);
    setStepData({ businessType: id, customBusinessType: undefined });
    setTimeout(goNext, 200);
  };

  const handleOtherSubmit = () => {
    if (customType.trim()) {
      setStepData({ businessType: "other", customBusinessType: customType.trim() });
      goNext();
    }
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

      <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto mb-6">
        {businessTypes.map((bt, i) => (
          <motion.button
            key={bt.id}
            onClick={() => handleSelect(bt.id)}
            className={`bg-white rounded-2xl border-2 p-4 sm:p-5 flex flex-col items-center gap-2 transition-all duration-200 cursor-pointer ${
              state.businessType === bt.id
                ? "border-blue-500 shadow-lg shadow-blue-500/10"
                : "border-slate-200 hover:border-blue-400 hover:shadow-md"
            }`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-3xl sm:text-4xl">{bt.emoji}</span>
            <span className="text-xs sm:text-sm font-medium text-slate-700">
              {bt.labels[lang] || bt.labels.ru}
            </span>
          </motion.button>
        ))}
      </div>

      {showOtherInput && (
        <motion.div
          className="max-w-md mx-auto"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          <input
            type="text"
            value={customType}
            onChange={(e) => setCustomType(e.target.value)}
            placeholder={texts.otherPlaceholder}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-800 focus:border-blue-500 focus:outline-none transition-colors mb-4"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleOtherSubmit()}
          />
          <motion.button
            onClick={handleOtherSubmit}
            disabled={!customType.trim()}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 disabled:opacity-40 disabled:cursor-not-allowed"
            whileHover={{ scale: customType.trim() ? 1.05 : 1 }}
            whileTap={{ scale: 0.97 }}
          >
            {lang === "ru" ? "Продолжить" : lang === "uz" ? "Davom etish" : "Continue"}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
