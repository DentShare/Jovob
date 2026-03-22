"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWizard } from "../WizardContext";

const t = {
  ru: {
    title: "База знаний бота",
    subtitle: "Добавьте частые вопросы и ответы. Бот будет использовать их для общения.",
    addManual: "Написать вручную",
    addDoc: "Загрузить документ",
    addUrl: "Вставить ссылку",
    question: "Вопрос",
    answer: "Ответ",
    add: "Добавить",
    auto: "Авто",
    edit: "Редактировать",
    remove: "Удалить",
    save: "Сохранить",
    cancel: "Отмена",
    skip: "Пропустить",
    continue: "Продолжить",
    items: "вопрос(ов) в базе",
    qPh: "Какой у вас график работы?",
    aPh: "Мы работаем с 9:00 до 18:00, Пн-Пт",
    comingSoon: "Скоро будет доступно",
  },
  uz: {
    title: "Bot bilimlar bazasi",
    subtitle: "Ko'p beriladigan savollar va javoblarni qo'shing.",
    addManual: "Qo'lda yozish",
    addDoc: "Hujjat yuklash",
    addUrl: "Havola qo'yish",
    question: "Savol",
    answer: "Javob",
    add: "Qo'shish",
    auto: "Avto",
    edit: "Tahrirlash",
    remove: "O'chirish",
    save: "Saqlash",
    cancel: "Bekor",
    skip: "O'tkazib yuborish",
    continue: "Davom etish",
    items: "savol bazada",
    qPh: "Ish vaqtingiz qanday?",
    aPh: "Biz 9:00 dan 18:00 gacha ishlaymiz, Du-Ju",
    comingSoon: "Tez orada",
  },
  en: {
    title: "Bot knowledge base",
    subtitle: "Add FAQs and answers. The bot will use them to chat with customers.",
    addManual: "Write manually",
    addDoc: "Upload document",
    addUrl: "Paste URL",
    question: "Question",
    answer: "Answer",
    add: "Add",
    auto: "Auto",
    edit: "Edit",
    remove: "Remove",
    save: "Save",
    cancel: "Cancel",
    skip: "Skip",
    continue: "Continue",
    items: "item(s) in knowledge base",
    qPh: "What are your working hours?",
    aPh: "We work from 9am to 6pm, Mon-Fri",
    comingSoon: "Coming soon",
  },
};

type FaqPresets = Record<string, Array<{ q: Record<string, string>; a: Record<string, string> }>>;

const faqPresets: FaqPresets = {
  clothing: [
    { q: { ru: "Есть ли доставка?", uz: "Yetkazib berish bormi?", en: "Do you deliver?" }, a: { ru: "Да, доставка по городу бесплатная при заказе от 200 000 сум.", uz: "Ha, 200 000 so'mdan ortiq buyurtmalarda shahar bo'ylab yetkazib berish bepul.", en: "Yes, free city delivery for orders over 200,000 UZS." } },
    { q: { ru: "Можно ли вернуть товар?", uz: "Tovarni qaytarish mumkinmi?", en: "Can I return items?" }, a: { ru: "Да, возврат в течение 14 дней при сохранении бирки.", uz: "Ha, birka saqlanganida 14 kun ichida qaytarish mumkin.", en: "Yes, within 14 days with tags attached." } },
    { q: { ru: "Какие размеры есть?", uz: "Qanday o'lchamlar bor?", en: "What sizes do you have?" }, a: { ru: "Размеры от XS до XXL. Уточняйте наличие конкретного размера.", uz: "XS dan XXL gacha o'lchamlar bor. Aniq o'lcham mavjudligini so'rang.", en: "Sizes from XS to XXL. Ask about specific size availability." } },
  ],
  food: [
    { q: { ru: "Сколько стоит доставка?", uz: "Yetkazib berish qancha?", en: "How much is delivery?" }, a: { ru: "Доставка бесплатная при заказе от 50 000 сум.", uz: "50 000 so'mdan ortiq buyurtmalarda yetkazib berish bepul.", en: "Free delivery for orders over 50,000 UZS." } },
    { q: { ru: "Есть ли халяльная еда?", uz: "Halol taom bormi?", en: "Is the food halal?" }, a: { ru: "Да, все наши блюда халяльные.", uz: "Ha, barcha taomlarimiz halol.", en: "Yes, all our food is halal." } },
    { q: { ru: "За сколько доставляете?", uz: "Qancha vaqtda yetkazasiz?", en: "How long is delivery?" }, a: { ru: "Среднее время доставки 30-45 минут.", uz: "O'rtacha yetkazib berish vaqti 30-45 daqiqa.", en: "Average delivery time is 30-45 minutes." } },
  ],
  beauty: [
    { q: { ru: "Как записаться?", uz: "Qanday yozilish mumkin?", en: "How to book?" }, a: { ru: "Напишите боту удобное время, и мы подберём мастера.", uz: "Botga qulay vaqtni yozing, biz usta tanlaymiz.", en: "Tell the bot your preferred time and we'll find a specialist." } },
    { q: { ru: "Сколько стоит стрижка?", uz: "Soch olish qancha?", en: "How much is a haircut?" }, a: { ru: "Цены зависят от мастера и типа стрижки. Уточните у бота.", uz: "Narxlar usta va turiga qarab farq qiladi. Botdan so'rang.", en: "Prices vary by specialist and type. Ask the bot for details." } },
  ],
  default: [
    { q: { ru: "Как с вами связаться?", uz: "Siz bilan qanday bog'lanish mumkin?", en: "How to contact you?" }, a: { ru: "Напишите в этот чат или позвоните по номеру в профиле.", uz: "Shu chatga yozing yoki profildagi raqamga qo'ng'iroq qiling.", en: "Write in this chat or call the number in our profile." } },
    { q: { ru: "Какие способы оплаты?", uz: "Qanday to'lov usullari bor?", en: "What payment methods?" }, a: { ru: "Наличные, Click, Payme, Uzum.", uz: "Naqd, Click, Payme, Uzum.", en: "Cash, Click, Payme, Uzum." } },
  ],
};

export default function Step7Knowledge() {
  const { state, setStepData, goNext } = useWizard();
  const lang = state.language;
  const texts = t[lang] || t.ru;
  const [showForm, setShowForm] = useState(false);
  const [importMode, setImportMode] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const initialized = useRef(false);

  // Pre-fill FAQ based on business type
  useEffect(() => {
    if (!initialized.current && state.faqItems.length === 0) {
      const presets = faqPresets[state.businessType] || faqPresets.default;
      const items = presets.map((p) => ({
        question: p.q[lang] || p.q.ru,
        answer: p.a[lang] || p.a.ru,
        isAutoGen: true,
      }));
      setStepData({ faqItems: items });
      initialized.current = true;
    }
  }, [state.businessType, state.faqItems.length, lang, setStepData]);

  const addFaq = () => {
    if (!q.trim() || !a.trim()) return;
    if (editIdx !== null) {
      const updated = [...state.faqItems];
      updated[editIdx] = { question: q.trim(), answer: a.trim(), isAutoGen: false };
      setStepData({ faqItems: updated });
      setEditIdx(null);
    } else {
      setStepData({ faqItems: [...state.faqItems, { question: q.trim(), answer: a.trim(), isAutoGen: false }] });
    }
    setQ("");
    setA("");
    setShowForm(false);
  };

  const startEdit = (i: number) => {
    setQ(state.faqItems[i].question);
    setA(state.faqItems[i].answer);
    setEditIdx(i);
    setShowForm(true);
  };

  const removeFaq = (i: number) => {
    setStepData({ faqItems: state.faqItems.filter((_, idx) => idx !== i) });
  };

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

      <div className="max-w-lg mx-auto">
        {/* FAQ list */}
        <AnimatePresence>
          {state.faqItems.map((item, i) => (
            <motion.div
              key={`${i}-${item.question}`}
              className="bg-white border border-slate-200 rounded-xl p-4 mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 text-sm">
                    {item.isAutoGen && (
                      <span className="text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded mr-2">
                        {texts.auto}
                      </span>
                    )}
                    {item.question}
                  </p>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.answer}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => startEdit(i)} className="text-xs text-blue-500 hover:underline">
                    {texts.edit}
                  </button>
                  <button onClick={() => removeFaq(i)} className="text-xs text-red-400 hover:text-red-600">
                    {texts.remove}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {state.faqItems.length > 0 && (
          <p className="text-sm text-slate-400 mb-4 text-center">
            {state.faqItems.length} {texts.items}
          </p>
        )}

        {/* Add options */}
        {!showForm && !importMode && (
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {[
              { id: "manual", label: texts.addManual, emoji: "✍️" },
              { id: "doc", label: texts.addDoc, emoji: "📄" },
              { id: "url", label: texts.addUrl, emoji: "🔗" },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  if (opt.id === "manual") {
                    setShowForm(true);
                  } else {
                    setImportMode(opt.id);
                  }
                }}
                className="px-4 py-2 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:border-blue-400 hover:text-blue-500 transition-all"
              >
                {opt.emoji} {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Coming soon for import modes */}
        {importMode && (
          <motion.div
            className="text-center mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 inline-block">
              <span className="text-2xl">🚧</span>
              <p className="text-amber-700 font-medium text-sm mt-1">{texts.comingSoon}</p>
            </div>
            <button
              onClick={() => setImportMode(null)}
              className="block mx-auto mt-2 text-sm text-blue-500 hover:underline"
            >
              {texts.cancel}
            </button>
          </motion.div>
        )}

        {/* Manual form */}
        {showForm && (
          <motion.div
            className="bg-white border-2 border-blue-200 rounded-2xl p-5 space-y-3 mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <input
              type="text"
              placeholder={texts.qPh}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-slate-800 focus:border-blue-500 focus:outline-none transition-colors"
              autoFocus
            />
            <textarea
              placeholder={texts.aPh}
              value={a}
              onChange={(e) => setA(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-slate-800 focus:border-blue-500 focus:outline-none transition-colors resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={addFaq}
                disabled={!q.trim() || !a.trim()}
                className="flex-1 px-4 py-2.5 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-40"
              >
                {editIdx !== null ? texts.save : texts.add}
              </button>
              <button
                onClick={() => { setShowForm(false); setQ(""); setA(""); setEditIdx(null); }}
                className="px-4 py-2.5 text-slate-500 hover:text-slate-700"
              >
                {texts.cancel}
              </button>
            </div>
          </motion.div>
        )}

        {/* Bottom buttons */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={goNext}
            className="text-slate-400 hover:text-slate-600 transition-colors text-sm"
          >
            {texts.skip}
          </button>
          {state.faqItems.length > 0 && (
            <motion.button
              onClick={goNext}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              {texts.continue}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
