"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useWizard } from "../WizardContext";

const t = {
  ru: {
    title: "Подключите платформы",
    subtitle: "Минимум: Telegram. Остальные можно подключить позже.",
    tgLabel: "Telegram",
    tgPlaceholder: "Вставьте токен бота от @BotFather",
    tgHint: "Откройте @BotFather в Telegram → /newbot → скопируйте токен",
    tgSuccess: "Бот найден",
    tgError: "Неверный формат токена",
    igLabel: "Instagram",
    waLabel: "WhatsApp",
    connectLater: "Подключить позже",
    continue: "Продолжить",
    required: "Обязательно",
  },
  uz: {
    title: "Platformalarni ulang",
    subtitle: "Minimum: Telegram. Qolganlarini keyinroq ulash mumkin.",
    tgLabel: "Telegram",
    tgPlaceholder: "@BotFather dan bot tokenini kiriting",
    tgHint: "Telegramda @BotFather ni oching → /newbot → tokenni nusxalang",
    tgSuccess: "Bot topildi",
    tgError: "Noto'g'ri token formati",
    igLabel: "Instagram",
    waLabel: "WhatsApp",
    connectLater: "Keyinroq ulash",
    continue: "Davom etish",
    required: "Majburiy",
  },
  en: {
    title: "Connect platforms",
    subtitle: "Minimum: Telegram. Others can be connected later.",
    tgLabel: "Telegram",
    tgPlaceholder: "Paste your bot token from @BotFather",
    tgHint: "Open @BotFather in Telegram → /newbot → copy the token",
    tgSuccess: "Bot found",
    tgError: "Invalid token format",
    igLabel: "Instagram",
    waLabel: "WhatsApp",
    connectLater: "Connect later",
    continue: "Continue",
    required: "Required",
  },
};

const TG_TOKEN_REGEX = /^\d{8,10}:[A-Za-z0-9_-]{35}$/;

export default function Step8Platforms() {
  const { state, setStepData, goNext } = useWizard();
  const lang = state.language;
  const texts = t[lang] || t.ru;
  const [token, setToken] = useState(state.telegramToken);
  const [tokenStatus, setTokenStatus] = useState<"idle" | "valid" | "invalid">(
    state.telegramToken && TG_TOKEN_REGEX.test(state.telegramToken) ? "valid" : "idle"
  );
  const [botName, setBotName] = useState("");

  const handleTokenChange = (value: string) => {
    setToken(value);
    if (!value.trim()) {
      setTokenStatus("idle");
      return;
    }
    if (TG_TOKEN_REGEX.test(value.trim())) {
      setTokenStatus("valid");
      // Simulate bot name extraction from token
      const idPart = value.split(":")[0];
      setBotName(`bot_${idPart}`);
      setStepData({ telegramToken: value.trim() });
    } else {
      setTokenStatus("invalid");
    }
  };

  const canContinue = tokenStatus === "valid";

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
        className="text-slate-500 mb-10 text-lg text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {texts.subtitle}
      </motion.p>

      <div className="max-w-lg mx-auto space-y-4">
        {/* Telegram */}
        <motion.div
          className={`bg-white rounded-2xl border-2 p-5 transition-all ${
            tokenStatus === "valid"
              ? "border-green-400 shadow-md shadow-green-500/10"
              : "border-slate-200"
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800">{texts.tgLabel}</span>
                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                  {texts.required}
                </span>
              </div>
            </div>
            {tokenStatus === "valid" && (
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <input
            type="text"
            value={token}
            onChange={(e) => handleTokenChange(e.target.value)}
            placeholder={texts.tgPlaceholder}
            className={`w-full px-4 py-2.5 border-2 rounded-xl text-slate-800 focus:outline-none transition-colors font-mono text-sm ${
              tokenStatus === "valid"
                ? "border-green-300 bg-green-50"
                : tokenStatus === "invalid"
                ? "border-red-300 bg-red-50"
                : "border-slate-200 focus:border-blue-500"
            }`}
          />
          {tokenStatus === "idle" && (
            <p className="text-xs text-slate-400 mt-2">{texts.tgHint}</p>
          )}
          {tokenStatus === "valid" && (
            <p className="text-xs text-green-600 mt-2 font-medium">
              {texts.tgSuccess}: @{botName}
            </p>
          )}
          {tokenStatus === "invalid" && (
            <p className="text-xs text-red-500 mt-2">{texts.tgError}</p>
          )}
        </motion.div>

        {/* Instagram */}
        <motion.div
          className="bg-white rounded-2xl border-2 border-slate-200 p-5 opacity-70"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="font-semibold text-slate-800">{texts.igLabel}</span>
            </div>
            <span className="text-sm text-slate-400 border border-slate-200 px-3 py-1 rounded-lg">
              {texts.connectLater}
            </span>
          </div>
        </motion.div>

        {/* WhatsApp */}
        <motion.div
          className="bg-white rounded-2xl border-2 border-slate-200 p-5 opacity-70"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="font-semibold text-slate-800">{texts.waLabel}</span>
            </div>
            <span className="text-sm text-slate-400 border border-slate-200 px-3 py-1 rounded-lg">
              {texts.connectLater}
            </span>
          </div>
        </motion.div>

        {/* Continue */}
        <div className="text-center pt-6">
          <motion.button
            onClick={goNext}
            disabled={!canContinue}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            whileHover={{ scale: canContinue ? 1.05 : 1 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            {texts.continue}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
