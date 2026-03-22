"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useWizard } from "../WizardContext";

const t = {
  ru: {
    title: "Всё готово к запуску!",
    subtitle: "Проверьте настройки вашего бота",
    edit: "Изменить",
    business: "Бизнес",
    languages: "Языки бота",
    platforms: "Платформы",
    capabilities: "Возможности",
    products: "Каталог",
    knowledge: "База знаний",
    personality: "Личность",
    productsCount: "товаров",
    faqCount: "вопросов",
    test: "Протестировать бота в Telegram",
    launch: "Запустить бота!",
    freeBadge: "100 контактов бесплатно, без карты",
    launched: "Бот успешно запущен!",
    launchedSub: "Перейдите в Telegram чтобы протестировать",
    formal: "Деловой",
    friendly: "Дружеский",
    fun: "Весёлый",
    telegram: "Telegram",
  },
  uz: {
    title: "Hammasi tayyor!",
    subtitle: "Bot sozlamalarini tekshiring",
    edit: "O'zgartirish",
    business: "Biznes",
    languages: "Bot tillari",
    platforms: "Platformalar",
    capabilities: "Imkoniyatlar",
    products: "Katalog",
    knowledge: "Bilimlar bazasi",
    personality: "Shaxsiyat",
    productsCount: "tovar",
    faqCount: "savol",
    test: "Botni Telegramda sinash",
    launch: "Botni ishga tushirish!",
    freeBadge: "100 ta kontakt bepul, karta kerak emas",
    launched: "Bot muvaffaqiyatli ishga tushirildi!",
    launchedSub: "Sinash uchun Telegramga o'ting",
    formal: "Rasmiy",
    friendly: "Do'stona",
    fun: "Quvnoq",
    telegram: "Telegram",
  },
  en: {
    title: "Ready to launch!",
    subtitle: "Review your bot settings",
    edit: "Edit",
    business: "Business",
    languages: "Bot languages",
    platforms: "Platforms",
    capabilities: "Capabilities",
    products: "Catalog",
    knowledge: "Knowledge base",
    personality: "Personality",
    productsCount: "products",
    faqCount: "questions",
    test: "Test bot in Telegram",
    launch: "Launch bot!",
    freeBadge: "100 contacts free, no card needed",
    launched: "Bot launched successfully!",
    launchedSub: "Go to Telegram to test it",
    formal: "Formal",
    friendly: "Friendly",
    fun: "Fun",
    telegram: "Telegram",
  },
};

const capLabels: Record<string, Record<string, string>> = {
  ai_answers: { ru: "ИИ-ответы", uz: "AI javoblar", en: "AI Answers" },
  catalog: { ru: "Каталог", uz: "Katalog", en: "Catalog" },
  orders: { ru: "Заказы", uz: "Buyurtmalar", en: "Orders" },
  booking: { ru: "Бронь", uz: "Bron", en: "Booking" },
  broadcast: { ru: "Рассылки", uz: "Xabar tarqatish", en: "Broadcasts" },
  handoff: { ru: "Оператор", uz: "Operator", en: "Handoff" },
};

const businessLabels: Record<string, Record<string, string>> = {
  clothing: { ru: "Одежда", uz: "Kiyim-kechak", en: "Clothing" },
  food: { ru: "Еда и напитки", uz: "Ovqat va ichimlik", en: "Food & Drink" },
  beauty: { ru: "Красота", uz: "Go'zallik", en: "Beauty" },
  electronics: { ru: "Электроника", uz: "Elektronika", en: "Electronics" },
  education: { ru: "Образование", uz: "Ta'lim", en: "Education" },
  home_services: { ru: "Услуги для дома", uz: "Uy xizmatlari", en: "Home Services" },
  auto: { ru: "Авто", uz: "Avto", en: "Auto" },
  pharmacy: { ru: "Аптека", uz: "Dorixona", en: "Pharmacy" },
  other: { ru: "Другое", uz: "Boshqa", en: "Other" },
};

function fireConfetti() {
  // CSS-based confetti fallback
  const container = document.createElement("div");
  container.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden";
  document.body.appendChild(container);

  const colors = ["#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#EF4444"];

  for (let i = 0; i < 80; i++) {
    const piece = document.createElement("div");
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const delay = Math.random() * 0.5;
    const duration = 1.5 + Math.random() * 2;
    const size = 6 + Math.random() * 8;
    const rotation = Math.random() * 360;

    piece.style.cssText = `
      position:absolute;
      top:-20px;
      left:${left}%;
      width:${size}px;
      height:${size * 0.6}px;
      background:${color};
      border-radius:2px;
      transform:rotate(${rotation}deg);
      animation:confetti-fall ${duration}s ease-in ${delay}s forwards;
    `;
    container.appendChild(piece);
  }

  // Inject keyframes if not exists
  if (!document.getElementById("confetti-style")) {
    const style = document.createElement("style");
    style.id = "confetti-style";
    style.textContent = `
      @keyframes confetti-fall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  setTimeout(() => container.remove(), 4000);
}

export default function Step10Review() {
  const { state, goToStep } = useWizard();
  const lang = state.language;
  const texts = t[lang] || t.ru;
  const [launched, setLaunched] = useState(false);

  const handleLaunch = useCallback(() => {
    setLaunched(true);
    fireConfetti();
  }, []);

  const langDisplay = state.botLanguages
    .map((l) => (l === "ru" ? "Русский" : l === "uz" ? "O'zbekcha" : l))
    .join(" + ");

  const personalityLabel = (texts as Record<string, string>)[state.personality] || state.personality;

  const businessLabel =
    state.businessType === "other"
      ? state.customBusinessType || (texts as Record<string, string>).business
      : (businessLabels[state.businessType]?.[lang] || state.businessType);

  const rows = [
    {
      label: texts.business,
      value: `${state.businessInfo.name || "---"} (${businessLabel})`,
      step: 3,
    },
    {
      label: texts.languages,
      value: langDisplay || "---",
      step: 2,
    },
    {
      label: texts.platforms,
      value: state.telegramToken ? texts.telegram : "---",
      step: 8,
    },
    {
      label: texts.capabilities,
      value: state.capabilities.map((c) => capLabels[c]?.[lang] || c).join(", ") || "---",
      step: 4,
    },
    {
      label: texts.products,
      value: `${state.products.length} ${texts.productsCount}`,
      step: 6,
    },
    {
      label: texts.knowledge,
      value: `${state.faqItems.length} ${texts.faqCount}`,
      step: 7,
    },
    {
      label: texts.personality,
      value: `${personalityLabel} — ${state.botName || "---"}`,
      step: 9,
    },
  ];

  if (launched) {
    return (
      <div className="text-center py-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="text-7xl mb-6"
        >
          🚀
        </motion.div>
        <motion.h1
          className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {texts.launched}
        </motion.h1>
        <motion.p
          className="text-slate-500 text-lg mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {texts.launchedSub}
        </motion.p>
        <motion.a
          href={`https://t.me/bot_${state.telegramToken.split(":")[0]}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-3 bg-blue-500 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-600 transition-colors"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
          </svg>
          {texts.test}
        </motion.a>
        <motion.div
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <span className="inline-flex items-center gap-1.5 text-sm text-green-600 bg-green-50 border border-green-200 px-4 py-2 rounded-full">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {texts.freeBadge}
          </span>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      <motion.h1
        className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {texts.title}
      </motion.h1>
      <motion.p
        className="text-slate-500 mb-8 text-lg text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {texts.subtitle}
      </motion.p>

      <div className="max-w-lg mx-auto space-y-3 mb-8">
        {rows.map((row, i) => (
          <motion.div
            key={row.label}
            className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center justify-between gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.06 }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{row.label}</p>
              <p className="text-sm text-slate-800 font-medium truncate">{row.value}</p>
            </div>
            <button
              onClick={() => goToStep(row.step)}
              className="text-xs text-blue-500 hover:underline flex-shrink-0"
            >
              {texts.edit}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Free badge */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <span className="inline-flex items-center gap-1.5 text-sm text-green-600 bg-green-50 border border-green-200 px-4 py-2 rounded-full">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
          {texts.freeBadge}
        </span>
      </motion.div>

      {/* Test button */}
      {state.telegramToken && (
        <motion.div
          className="text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <a
            href={`https://t.me/bot_${state.telegramToken.split(":")[0]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 border-2 border-blue-500 text-blue-500 font-semibold rounded-xl hover:bg-blue-50 transition-colors text-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
            </svg>
            {texts.test}
          </a>
        </motion.div>
      )}

      {/* Launch button */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <motion.button
          onClick={handleLaunch}
          className="px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-bold rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-purple-500/30 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          🚀 {texts.launch}
        </motion.button>
      </motion.div>
    </div>
  );
}
