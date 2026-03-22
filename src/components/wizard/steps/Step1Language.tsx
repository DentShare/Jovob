"use client";

import React from "react";
import { motion } from "framer-motion";
import { useWizard } from "../WizardContext";

const languages = [
  { code: "ru" as const, label: "Русский", flag: "🇷🇺", sub: "Russian" },
  { code: "uz" as const, label: "O'zbekcha", flag: "🇺🇿", sub: "Uzbek" },
  { code: "en" as const, label: "English", flag: "🇬🇧", sub: "English" },
];

export default function Step1Language() {
  const { setStepData, goNext } = useWizard();

  const handleSelect = (code: "ru" | "uz" | "en") => {
    setStepData({ language: code });
    setTimeout(goNext, 200);
  };

  return (
    <div className="text-center">
      <motion.h1
        className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        Выберите язык интерфейса
      </motion.h1>
      <motion.p
        className="text-slate-500 mb-10 text-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Choose your language / Tilni tanlang
      </motion.p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
        {languages.map((lang, i) => (
          <motion.button
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            className="group relative bg-white rounded-2xl border-2 border-slate-200 p-8 flex flex-col items-center gap-3 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200 cursor-pointer"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="text-5xl">{lang.flag}</span>
            <span className="text-lg font-semibold text-slate-800">{lang.label}</span>
            <span className="text-sm text-slate-400">{lang.sub}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
