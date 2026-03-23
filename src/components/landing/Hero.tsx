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
    demo: string;
    demoNav: string;
    counter: string;
    badges: string[];
  }
> = {
  RU: {
    title: "Создайте AI-помощника для вашего бизнеса за 7 минут — без программирования",
    subtitle:
      "Бот ответит клиентам 24/7 в Telegram, Instagram и WhatsApp на русском и узбекском",
    cta: "Создать бота бесплатно",
    demo: "Посмотреть демо",
    demoNav: "Демо",
    counter: "Уже создано 1,247 ботов",
    badges: ["Бесплатно", "Без программирования", "Настройка за 7 минут"],
  },
  UZ: {
    title: "Biznesingiz uchun AI-yordamchini 7 daqiqada yarating — dasturlashsiz",
    subtitle:
      "Bot mijozlarga 24/7 Telegram, Instagram va WhatsApp'da o'zbek va rus tillarida javob beradi",
    cta: "Botni bepul yaratish",
    demo: "Demoni ko'rish",
    demoNav: "Demo",
    counter: "Allaqachon 1,247 ta bot yaratildi",
    badges: ["Bepul", "Dasturlashsiz", "7 daqiqada sozlash"],
  },
  EN: {
    title: "Create an AI assistant for your business in 7 minutes — no coding required",
    subtitle:
      "Your bot will answer customers 24/7 on Telegram, Instagram and WhatsApp in Russian and Uzbek",
    cta: "Create a bot for free",
    demo: "View demo",
    demoNav: "Demo",
    counter: "Already 1,247 bots created",
    badges: ["Free", "No coding", "Setup in 7 minutes"],
  },
};

// Phone mockup messages for visual
const phoneMessages = [
  { from: "user" as const, text: "iPhone 15 bormi?" },
  { from: "bot" as const, text: "Ha! 128GB - 12.9M\n256GB - 15.2M\nBuyurtma?" },
  { from: "user" as const, text: "256GB, qora" },
  { from: "bot" as const, text: "Buyurtma #1247\nYetkazish: 2 soat" },
];

export default function Hero() {
  const [lang, setLang] = useState<Lang>("RU");
  const t = content[lang];

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Dramatic mesh gradient background */}
      <div className="absolute inset-0 bg-[#0a0a1a]" />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-[#1a0a3e] to-purple-950" />

      {/* Mesh gradient blobs */}
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-bl from-blue-500/30 to-purple-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-purple-600/25 to-blue-500/15 rounded-full blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-[80px]" />

      {/* Dot grid pattern */}
      <div className="absolute inset-0 opacity-[0.07]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)`,
        backgroundSize: '32px 32px',
      }} />

      {/* Floating animated shapes */}
      <motion.div
        animate={{ y: [-20, 20, -20], rotate: [0, 90, 0] }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        className="absolute top-[15%] left-[8%] w-16 h-16 border border-blue-400/20 rounded-xl"
      />
      <motion.div
        animate={{ y: [15, -15, 15], rotate: [0, -60, 0] }}
        transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
        className="absolute top-[25%] right-[12%] w-10 h-10 bg-gradient-to-br from-purple-400/10 to-blue-400/10 rounded-full"
      />
      <motion.div
        animate={{ y: [-10, 20, -10], x: [-5, 10, -5] }}
        transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
        className="absolute bottom-[30%] left-[15%] w-8 h-8 border border-purple-400/15 rounded-full"
      />
      <motion.div
        animate={{ y: [10, -20, 10], rotate: [45, 135, 45] }}
        transition={{ repeat: Infinity, duration: 22, ease: "linear" }}
        className="absolute top-[60%] right-[8%] w-12 h-12 border border-blue-300/15 rounded-lg"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        className="absolute top-[40%] left-[5%] w-3 h-3 bg-blue-400 rounded-full"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.25, 0.1] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        className="absolute bottom-[20%] right-[18%] w-2 h-2 bg-purple-400 rounded-full"
      />

      {/* Navigation */}
      <nav className="relative z-10 w-full px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
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
          <span className="text-xl font-bold text-white">
            Jovob
          </span>
        </motion.div>

        {/* Demo Link + Language Switcher */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <Link
            href="/dashboard"
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-3 py-1.5"
          >
            {t.demoNav}
          </Link>
        <div className="flex gap-1 bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/10"
        >
          {languages.map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 cursor-pointer ${
                lang === l
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              {l}
            </button>
          ))}
          </div>
        </motion.div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 pb-20">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-8">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                {t.counter}
              </div>
            </motion.div>

            <motion.h1
              key={`title-${lang}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-white mb-6"
            >
              {t.title.split(" — ").map((part, i) =>
                i === 0 ? (
                  <span key={i}>{part}</span>
                ) : (
                  <span key={i}>
                    {" — "}
                    <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
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
              className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed"
            >
              {t.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4"
            >
              <Link
                href="/create"
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:shadow-[0_0_60px_rgba(59,130,246,0.5)] transition-all duration-300 hover:-translate-y-0.5"
              >
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 blur-xl opacity-40 group-hover:opacity-60 transition-opacity -z-10" />
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
              <Link
                href="/dashboard"
                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white rounded-2xl border-2 border-white/20 hover:border-white/40 hover:bg-white/5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5"
              >
                {t.demo}
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

            {/* Trust badges */}
            <motion.div
              key={`badges-${lang}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.9 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-8"
            >
              {t.badges.map((badge, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-sm text-gray-300 font-medium"
                >
                  <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {badge}
                </span>
              ))}
            </motion.div>

            {/* Messenger badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.1 }}
              className="flex items-center justify-center lg:justify-start gap-3 mt-6"
            >
              {["Telegram", "Instagram", "WhatsApp"].map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-sm text-gray-400"
                >
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  {name}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right: Phone mockup */}
          <motion.div
            initial={{ opacity: 0, x: 60, rotateY: -10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="hidden lg:flex justify-center items-center"
          >
            <div className="relative">
              {/* Glow behind phone */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-[3rem] blur-[60px] scale-110" />

              {/* Phone frame */}
              <div className="relative w-[300px] bg-gray-900 rounded-[2.5rem] border-[3px] border-gray-700 shadow-2xl shadow-blue-500/10 overflow-hidden transform rotate-[-2deg] hover:rotate-0 transition-transform duration-700">
                {/* Status bar */}
                <div className="flex items-center justify-between px-8 pt-4 pb-2">
                  <span className="text-white text-xs font-medium">9:41</span>
                  <div className="w-20 h-5 bg-gray-800 rounded-full mx-auto" /> {/* Notch/Dynamic Island */}
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-2 border border-white/50 rounded-sm relative">
                      <div className="absolute inset-[1px] right-[2px] bg-green-400 rounded-[1px]" />
                    </div>
                  </div>
                </div>

                {/* Chat header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white text-xs font-semibold">TechStore Bot</div>
                    <div className="text-white/60 text-[10px] flex items-center gap-1">
                      <span className="w-1 h-1 bg-green-400 rounded-full" />
                      online
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="bg-[#0f0f1a] px-3 py-4 space-y-2 min-h-[320px]">
                  {phoneMessages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 1 + i * 0.6 }}
                      className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] px-3 py-2 text-[11px] leading-relaxed whitespace-pre-line ${
                          msg.from === "user"
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl rounded-br-sm"
                            : "bg-gray-800 text-gray-200 rounded-xl rounded-bl-sm"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Input */}
                <div className="bg-[#0f0f1a] px-3 pb-6 pt-1 flex items-center gap-2">
                  <div className="flex-1 bg-gray-800 rounded-full px-3 py-1.5 text-[10px] text-gray-500">
                    Сообщение...
                  </div>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Floating stats around phone */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 2 }}
                className="absolute -left-36 top-16 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 text-center"
              >
                <div className="text-2xl font-bold text-white">89%</div>
                <div className="text-[10px] text-gray-400 whitespace-nowrap">вопросов решено</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 2.3 }}
                className="absolute -right-32 top-40 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 text-center"
              >
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-[10px] text-gray-400 whitespace-nowrap">без выходных</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 2.6 }}
                className="absolute -left-28 bottom-24 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 text-center"
              >
                <div className="text-2xl font-bold text-green-400">&lt; 2 сек</div>
                <div className="text-[10px] text-gray-400 whitespace-nowrap">время ответа</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center pt-2"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
        </motion.div>
      </motion.div>
    </section>
  );
}
