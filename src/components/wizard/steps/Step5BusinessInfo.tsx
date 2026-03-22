"use client";

import React from "react";
import { motion } from "framer-motion";
import { useWizard } from "../WizardContext";

const t = {
  ru: {
    title: "Расскажите о вашем бизнесе",
    subtitle: "ИИ будет использовать эту информацию для ответов клиентам",
    name: "Название бизнеса",
    namePlaceholder: "Например: Магазин \"Лидер\"",
    description: "Описание",
    descPlaceholder: "Чем вы занимаетесь? Что особенного в вашем бизнесе?",
    hours: "Рабочие часы",
    from: "С",
    to: "До",
    days: "Рабочие дни",
    address: "Адрес",
    addressPlaceholder: "ул. Навои, 25, Ташкент",
    phone: "Контакт менеджера",
    phonePlaceholder: "+998 XX XXX XX XX",
    tip: "Бот будет использовать эту информацию для точных ответов клиентам",
    continue: "Продолжить",
  },
  uz: {
    title: "Biznesingiz haqida gapirib bering",
    subtitle: "AI bu ma'lumotlardan mijozlarga javob berish uchun foydalanadi",
    name: "Biznes nomi",
    namePlaceholder: "Masalan: \"Lider\" do'koni",
    description: "Tavsif",
    descPlaceholder: "Nima bilan shug'ullanasiz? Biznesingizning o'ziga xosligi?",
    hours: "Ish vaqti",
    from: "Dan",
    to: "Gacha",
    days: "Ish kunlari",
    address: "Manzil",
    addressPlaceholder: "Navoiy ko'chasi, 25, Toshkent",
    phone: "Menejer kontakti",
    phonePlaceholder: "+998 XX XXX XX XX",
    tip: "Bot bu ma'lumotlardan mijozlarga aniq javob berish uchun foydalanadi",
    continue: "Davom etish",
  },
  en: {
    title: "Tell us about your business",
    subtitle: "AI will use this information to answer customers",
    name: "Business name",
    namePlaceholder: "e.g. Leader Store",
    description: "Description",
    descPlaceholder: "What do you do? What makes your business special?",
    hours: "Working hours",
    from: "From",
    to: "To",
    days: "Working days",
    address: "Address",
    addressPlaceholder: "25 Navoi St, Tashkent",
    phone: "Manager contact",
    phonePlaceholder: "+998 XX XXX XX XX",
    tip: "The bot will use this info to give accurate answers to customers",
    continue: "Continue",
  },
};

const dayKeys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const dayLabels: Record<string, Record<string, string>> = {
  ru: { mon: "Пн", tue: "Вт", wed: "Ср", thu: "Чт", fri: "Пт", sat: "Сб", sun: "Вс" },
  uz: { mon: "Du", tue: "Se", wed: "Cho", thu: "Pa", fri: "Ju", sat: "Sha", sun: "Ya" },
  en: { mon: "Mo", tue: "Tu", wed: "We", thu: "Th", fri: "Fr", sat: "Sa", sun: "Su" },
};

export default function Step5BusinessInfo() {
  const { state, setStepData, goNext } = useWizard();
  const lang = state.language;
  const texts = t[lang] || t.ru;
  const info = state.businessInfo;
  const days = dayLabels[lang] || dayLabels.ru;

  const update = (field: string, value: string | string[]) => {
    setStepData({
      businessInfo: { ...info, [field]: value },
    });
  };

  const toggleDay = (day: string) => {
    const current = info.workingDays;
    const next = current.includes(day) ? current.filter((d) => d !== day) : [...current, day];
    update("workingDays", next);
  };

  const canContinue = info.name.trim().length > 0;

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

      <motion.div
        className="max-w-lg mx-auto space-y-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">{texts.name} *</label>
          <input
            type="text"
            value={info.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder={texts.namePlaceholder}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-800 focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">{texts.description}</label>
          <textarea
            value={info.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder={texts.descPlaceholder}
            rows={3}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-800 focus:border-blue-500 focus:outline-none transition-colors resize-none"
          />
        </div>

        {/* Working hours */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">{texts.hours}</label>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">{texts.from}</span>
              <input
                type="time"
                value={info.workingHoursFrom}
                onChange={(e) => update("workingHoursFrom", e.target.value)}
                className="px-3 py-2 border-2 border-slate-200 rounded-lg text-slate-800 focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">{texts.to}</span>
              <input
                type="time"
                value={info.workingHoursTo}
                onChange={(e) => update("workingHoursTo", e.target.value)}
                className="px-3 py-2 border-2 border-slate-200 rounded-lg text-slate-800 focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Working days */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">{texts.days}</label>
          <div className="flex gap-2">
            {dayKeys.map((day) => (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                  info.workingDays.includes(day)
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {days[day]}
              </button>
            ))}
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">{texts.address}</label>
          <input
            type="text"
            value={info.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder={texts.addressPlaceholder}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-800 focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">{texts.phone}</label>
          <input
            type="tel"
            value={info.managerContact}
            onChange={(e) => update("managerContact", e.target.value)}
            placeholder={texts.phonePlaceholder}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-800 focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Tip */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl">
          <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-blue-700">{texts.tip}</span>
        </div>

        {/* Continue */}
        <div className="text-center pt-4">
          <motion.button
            onClick={goNext}
            disabled={!canContinue}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            whileHover={{ scale: canContinue ? 1.05 : 1 }}
            whileTap={{ scale: 0.97 }}
          >
            {texts.continue}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
