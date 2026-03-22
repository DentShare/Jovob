"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const languages = ["RU", "UZ", "EN"] as const;
type Lang = (typeof languages)[number];

const content: Record<
  Lang,
  {
    title: string;
    subtitle: string;
    cta: string;
    counter: string;
  }
> = {
  RU: {
    title: "Создайте AI-помощника для вашего бизнеса за 7 минут — без программирования",
    subtitle:
      "Бот ответит клиентам 24/7 в Telegram, Instagram и WhatsApp на русском и узбекском",
    cta: "Создать бота бесплатно",
    counter: "Уже создано 1,247 ботов",
  },
  UZ: {
    title: "Biznesingiz uchun AI-yordamchini 7 daqiqada yarating — dasturlashsiz",
    subtitle:
      "Bot mijozlarga 24/7 Telegram, Instagram va WhatsApp'da o'zbek va rus tillarida javob beradi",
    cta: "Botni bepul yaratish",
    counter: "Allaqachon 1,247 ta bot yaratildi",
  },
  EN: {
    title: "Create an AI assistant for your business in 7 minutes — no coding required",
    subtitle:
      "Your bot will answer customers 24/7 on Telegram, Instagram and WhatsApp in Russian and Uzbek",
    cta: "Create a bot for free",
    counter: "Already 1,247 bots created",
  },
};

export default function Hero() {
  const [lang, setLang] = useState<Lang>("RU");
  const t = content[lang];

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-blue-400/10 to-purple-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-purple-400/10 to-blue-400/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

      {/* Navigation */}
      <nav className="relative z-10 w-full px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a5 5 0 0 1 5 5v1a3 3 0 0 1 3 3v1a3 3 0 0 1-3 3h-1l-2 6H10l-2-6H7a3 3 0 0 1-3-3v-1a3 3 0 0 1 3-3V7a5 5 0 0 1 5-5Z" />
              <circle cx="9.5" cy="8.5" r="1" fill="white" />
              <circle cx="14.5" cy="8.5" r="1" fill="white" />
            </svg>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            BotUz
          </span>
        </motion.div>

        {/* Language Switcher */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex gap-1 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-sm border border-gray-100"
        >
          {languages.map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 cursor-pointer ${
                lang === l
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              {l}
            </button>
          ))}
        </motion.div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              {t.counter}
            </div>
          </motion.div>

          <motion.h1
            key={`title-${lang}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-gray-900 mb-6"
          >
            {t.title.split(" — ").map((part, i) =>
              i === 0 ? (
                <span key={i}>{part}</span>
              ) : (
                <span key={i}>
                  {" — "}
                  <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                    {part}
                  </span>
                </span>
              )
            )}
          </motion.h1>

          <motion.p
            key={`subtitle-${lang}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {t.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/create/language"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              {t.cta}
              <svg
                className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </motion.div>

          {/* Messenger badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="flex items-center justify-center gap-3 mt-10"
          >
            {["Telegram", "Instagram", "WhatsApp"].map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-full text-sm text-gray-500 shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-green-400" />
                {name}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-6 h-10 rounded-full border-2 border-gray-300 flex items-start justify-center pt-2"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
        </motion.div>
      </motion.div>
    </section>
  );
}
