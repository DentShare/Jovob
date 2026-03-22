"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useWizard } from "../WizardContext";

const t = {
  ru: {
    title: "Личность вашего бота",
    subtitle: "Выберите стиль общения и настройте приветствие",
    formal: "Деловой",
    formalDesc: "Вежливый и профессиональный тон",
    friendly: "Дружеский",
    friendlyDesc: "Тёплый и приветливый стиль",
    fun: "Весёлый",
    funDesc: "С юмором и эмодзи",
    botName: "Имя бота",
    botNamePh: "Например: Ассистент Лидер",
    welcome: "Приветственное сообщение",
    generate: "Сгенерировать другое",
    continue: "Продолжить",
    preview: "Предпросмотр чата",
    userMsg: "Привет!",
  },
  uz: {
    title: "Botingiz shaxsiyati",
    subtitle: "Muloqot uslubini tanlang va salomlashuvni sozlang",
    formal: "Rasmiy",
    formalDesc: "Odobli va professional ohang",
    friendly: "Do'stona",
    friendlyDesc: "Iliq va samimiy uslub",
    fun: "Quvnoq",
    funDesc: "Hazil va emoji bilan",
    botName: "Bot nomi",
    botNamePh: "Masalan: Lider Assistent",
    welcome: "Salomlashuv xabari",
    generate: "Boshqasini yaratish",
    continue: "Davom etish",
    preview: "Chat ko'rinishi",
    userMsg: "Salom!",
  },
  en: {
    title: "Bot personality",
    subtitle: "Choose communication style and set up the welcome message",
    formal: "Formal",
    formalDesc: "Polite and professional tone",
    friendly: "Friendly",
    friendlyDesc: "Warm and welcoming style",
    fun: "Fun",
    funDesc: "With humor and emojis",
    botName: "Bot name",
    botNamePh: "e.g. Leader Assistant",
    welcome: "Welcome message",
    generate: "Generate another",
    continue: "Continue",
    preview: "Chat preview",
    userMsg: "Hello!",
  },
};

type Personality = "formal" | "friendly" | "fun";

const personalities: Array<{ id: Personality; emoji: string }> = [
  { id: "formal", emoji: "👔" },
  { id: "friendly", emoji: "😊" },
  { id: "fun", emoji: "🤗" },
];

function generateWelcome(
  personality: Personality,
  lang: "ru" | "uz" | "en",
  businessName: string,
  businessType: string,
): string {
  const name = businessName || "Наш магазин";
  const templates: Record<Personality, Record<string, string[]>> = {
    formal: {
      ru: [
        `Добро пожаловать в ${name}. Я виртуальный ассистент, готовый помочь вам с выбором и ответить на вопросы. Чем могу быть полезен?`,
        `Здравствуйте! Вас приветствует ${name}. Я помогу вам с информацией о наших товарах и услугах. Задайте ваш вопрос.`,
        `Приветствуем вас в ${name}. Я ваш цифровой помощник. Готов ответить на любые вопросы о нашей продукции и услугах.`,
      ],
      uz: [
        `${name}ga xush kelibsiz. Men virtual yordamchiman, tovarlar va xizmatlar haqida savollaringizga javob berishga tayyorman.`,
        `Assalomu alaykum! ${name} sizni kutib oladi. Tovarlar va xizmatlarimiz haqida ma'lumot berishga tayyorman.`,
      ],
      en: [
        `Welcome to ${name}. I'm your virtual assistant, ready to help you with our products and answer your questions.`,
        `Hello! Welcome to ${name}. I'm here to assist you with information about our offerings. How can I help?`,
      ],
    },
    friendly: {
      ru: [
        `Привет! Рады видеть вас в ${name} 😊 Я помогу вам разобраться в нашем ассортименте и ответить на вопросы. Спрашивайте!`,
        `Привет! Добро пожаловать в ${name}! Я ваш помощник — расскажу обо всём, что вас интересует. Чем помочь?`,
        `Здравствуйте! Спасибо что заглянули в ${name}! Я на связи и готов помочь. Что вас интересует?`,
      ],
      uz: [
        `Salom! ${name}da sizni ko'rganimizdan xursandmiz 😊 Savollaringizga javob berishga tayyorman!`,
        `Salom! ${name}ga xush kelibsiz! Men yordamchingizman — qiziqarli narsalar haqida gapirib beraman.`,
      ],
      en: [
        `Hey there! Welcome to ${name} 😊 I'm here to help you find what you need. Just ask away!`,
        `Hi! Thanks for visiting ${name}! I'm your assistant — happy to help with anything you need.`,
      ],
    },
    fun: {
      ru: [
        `Йоу! 🎉 Добро пожаловать в ${name}! Я крутой бот-ассистент, знаю всё о наших товарах и даже немного больше 😎 Спрашивай!`,
        `Привееет! 🤩 Круто, что ты зашёл в ${name}! Я тут главный по ответам на вопросы. Давай, жги! 🔥`,
        `Оп-оп! 🙌 ${name} приветствует тебя! Я бот, но очень дружелюбный. Задавай вопросы — разберёмся вместе! 💪`,
      ],
      uz: [
        `Hey! 🎉 ${name}ga xush kelibsiz! Men zo'r bot-yordamchiman, tovarlar haqida hammasini bilaman 😎 So'ra!`,
        `Salooom! 🤩 ${name}ga kirganing ajoyib! Savollaringga javob berishga tayyorman. Boshladik! 🔥`,
      ],
      en: [
        `Hey hey! 🎉 Welcome to ${name}! I'm the coolest bot assistant around — I know everything about our stuff 😎 Ask away!`,
        `Yooo! 🤩 So glad you stopped by ${name}! I'm here to answer all your questions. Let's go! 🔥`,
      ],
    },
  };
  const pool = templates[personality][lang] || templates[personality].ru;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function Step9Personality() {
  const { state, setStepData, goNext } = useWizard();
  const lang = state.language;
  const texts = t[lang] || t.ru;
  const initialized = useRef(false);

  const [localBotName, setLocalBotName] = useState(state.botName);
  const [localWelcome, setLocalWelcome] = useState(state.welcomeMessage);

  // Generate initial welcome if empty
  useEffect(() => {
    if (!initialized.current && !state.welcomeMessage) {
      const msg = generateWelcome(state.personality, lang, state.businessInfo.name, state.businessType);
      setLocalWelcome(msg);
      setStepData({ welcomeMessage: msg });
      initialized.current = true;
    }
  }, [state.personality, lang, state.businessInfo.name, state.businessType, state.welcomeMessage, setStepData]);

  const selectPersonality = (p: Personality) => {
    setStepData({ personality: p });
    const msg = generateWelcome(p, lang, state.businessInfo.name, state.businessType);
    setLocalWelcome(msg);
    setStepData({ personality: p, welcomeMessage: msg });
  };

  const regenerate = () => {
    const msg = generateWelcome(state.personality, lang, state.businessInfo.name, state.businessType);
    setLocalWelcome(msg);
    setStepData({ welcomeMessage: msg });
  };

  const handleBotNameChange = (val: string) => {
    setLocalBotName(val);
    setStepData({ botName: val });
  };

  const handleWelcomeChange = (val: string) => {
    setLocalWelcome(val);
    setStepData({ welcomeMessage: val });
  };

  const canContinue = localBotName.trim().length > 0 && localWelcome.trim().length > 0;

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

      <div className="max-w-lg mx-auto space-y-6">
        {/* Personality cards */}
        <div className="grid grid-cols-3 gap-3">
          {personalities.map((p, i) => {
            const active = state.personality === p.id;
            return (
              <motion.button
                key={p.id}
                onClick={() => selectPersonality(p.id)}
                className={`bg-white rounded-2xl border-2 p-4 flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  active
                    ? "border-blue-500 shadow-lg shadow-blue-500/10"
                    : "border-slate-200 hover:border-blue-400 hover:shadow-md"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="text-3xl">{p.emoji}</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {(texts as Record<string, string>)[p.id]}
                </span>
                <span className="text-xs text-slate-400">
                  {(texts as Record<string, string>)[`${p.id}Desc`]}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Bot name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <label className="block text-sm font-medium text-slate-700 mb-1.5">{texts.botName}</label>
          <input
            type="text"
            value={localBotName}
            onChange={(e) => handleBotNameChange(e.target.value)}
            placeholder={texts.botNamePh}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-800 focus:border-blue-500 focus:outline-none transition-colors"
          />
        </motion.div>

        {/* Welcome message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-slate-700">{texts.welcome}</label>
            <button
              onClick={regenerate}
              className="text-xs text-blue-500 hover:underline flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {texts.generate}
            </button>
          </div>
          <textarea
            value={localWelcome}
            onChange={(e) => handleWelcomeChange(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-800 focus:border-blue-500 focus:outline-none transition-colors resize-none"
          />
        </motion.div>

        {/* Chat preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <label className="block text-sm font-medium text-slate-700 mb-2">{texts.preview}</label>
          <div className="bg-slate-100 rounded-2xl p-4 space-y-3">
            {/* User message */}
            <div className="flex justify-end">
              <div className="bg-blue-500 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%] text-sm">
                {texts.userMsg}
              </div>
            </div>
            {/* Bot message */}
            <div className="flex justify-start">
              <div className="flex items-start gap-2 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">
                    {(localBotName || "B").charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1 font-medium">{localBotName || "Bot"}</p>
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-slate-700 shadow-sm">
                    {localWelcome || "..."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Continue */}
        <div className="text-center pt-2">
          <motion.button
            onClick={goNext}
            disabled={!canContinue}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            whileHover={{ scale: canContinue ? 1.05 : 1 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {texts.continue}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
