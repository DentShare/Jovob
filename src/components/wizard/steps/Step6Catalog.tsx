"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWizard } from "../WizardContext";

const t = {
  ru: {
    title: "Добавьте товары или услуги",
    subtitle: "Бот покажет их клиентам. Можете пропустить и добавить позже.",
    manual: "Добавить вручную",
    excel: "Импорт из Excel",
    link: "Импорт по ссылке",
    photo: "Распознать по фото (AI)",
    name: "Название",
    price: "Цена (UZS)",
    category: "Категория",
    description: "Описание",
    image: "Фото (URL)",
    add: "Добавить",
    addMore: "+ Ещё товар",
    skip: "Пропустить",
    continue: "Продолжить",
    products: "товар(ов) добавлено",
    comingSoon: "Скоро будет доступно",
    namePh: "Пицца Маргарита",
    pricePh: "45000",
    catPh: "Пицца",
    descPh: "Классическая итальянская пицца с моцареллой",
    imagePh: "https://...",
    remove: "Удалить",
  },
  uz: {
    title: "Tovar yoki xizmatlar qo'shing",
    subtitle: "Bot ularni mijozlarga ko'rsatadi. Keyinroq ham qo'shishingiz mumkin.",
    manual: "Qo'lda qo'shish",
    excel: "Exceldan import",
    link: "Havola orqali import",
    photo: "Foto orqali aniqlash (AI)",
    name: "Nomi",
    price: "Narxi (UZS)",
    category: "Kategoriya",
    description: "Tavsif",
    image: "Rasm (URL)",
    add: "Qo'shish",
    addMore: "+ Yana tovar",
    skip: "O'tkazib yuborish",
    continue: "Davom etish",
    products: "tovar qo'shildi",
    comingSoon: "Tez orada",
    namePh: "Margarita pitsa",
    pricePh: "45000",
    catPh: "Pitsa",
    descPh: "Motzarella bilan klassik italyan pitsasi",
    imagePh: "https://...",
    remove: "O'chirish",
  },
  en: {
    title: "Add products or services",
    subtitle: "The bot will show them to customers. You can skip and add later.",
    manual: "Add manually",
    excel: "Import from Excel",
    link: "Import from link",
    photo: "Recognize from photo (AI)",
    name: "Name",
    price: "Price (UZS)",
    category: "Category",
    description: "Description",
    image: "Photo (URL)",
    add: "Add",
    addMore: "+ Add more",
    skip: "Skip",
    continue: "Continue",
    products: "product(s) added",
    comingSoon: "Coming soon",
    namePh: "Margherita Pizza",
    pricePh: "45000",
    catPh: "Pizza",
    descPh: "Classic Italian pizza with mozzarella",
    imagePh: "https://...",
    remove: "Remove",
  },
};

const importMethods = [
  { id: "manual", emoji: "✍️" },
  { id: "excel", emoji: "📊" },
  { id: "link", emoji: "🔗" },
  { id: "photo", emoji: "📸" },
];

interface ProductForm {
  name: string;
  price: string;
  category: string;
  description: string;
  imageUrl: string;
}

const emptyForm: ProductForm = { name: "", price: "", category: "", description: "", imageUrl: "" };

export default function Step6Catalog() {
  const { state, setStepData, goNext } = useWizard();
  const lang = state.language;
  const texts = t[lang] || t.ru;
  const [mode, setMode] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const addProduct = () => {
    if (!form.name.trim() || !form.price.trim()) return;
    const product = {
      name: form.name.trim(),
      price: parseFloat(form.price) || 0,
      category: form.category.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim() || undefined,
    };
    setStepData({ products: [...state.products, product] });
    setForm(emptyForm);
    setShowForm(false);
  };

  const removeProduct = (index: number) => {
    setStepData({ products: state.products.filter((_, i) => i !== index) });
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

      {/* Method selection */}
      {!mode && (
        <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto mb-6">
          {importMethods.map((m, i) => (
            <motion.button
              key={m.id}
              onClick={() => {
                if (m.id === "manual") {
                  setMode("manual");
                  setShowForm(true);
                } else {
                  setMode(m.id);
                }
              }}
              className="bg-white rounded-2xl border-2 border-slate-200 p-5 flex flex-col items-center gap-2 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="text-3xl">{m.emoji}</span>
              <span className="text-sm font-medium text-slate-700">
                {(texts as Record<string, string>)[m.id]}
              </span>
            </motion.button>
          ))}
        </div>
      )}

      {/* Coming soon for non-manual */}
      {mode && mode !== "manual" && (
        <motion.div
          className="max-w-lg mx-auto text-center mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
            <span className="text-4xl mb-3 block">🚧</span>
            <p className="text-amber-700 font-medium">{texts.comingSoon}</p>
          </div>
          <button
            onClick={() => setMode(null)}
            className="mt-4 text-sm text-blue-500 hover:underline"
          >
            {lang === "ru" ? "Выбрать другой способ" : lang === "uz" ? "Boshqa usulni tanlash" : "Choose another method"}
          </button>
        </motion.div>
      )}

      {/* Manual mode */}
      {mode === "manual" && (
        <div className="max-w-lg mx-auto">
          {/* Product list */}
          <AnimatePresence>
            {state.products.map((p, i) => (
              <motion.div
                key={i}
                className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3 mb-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-slate-800">{p.name}</span>
                  <span className="text-slate-400 mx-2">|</span>
                  <span className="text-blue-500 font-semibold">{p.price.toLocaleString()} UZS</span>
                  {p.category && (
                    <span className="ml-2 text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                      {p.category}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => removeProduct(i)}
                  className="text-red-400 hover:text-red-600 text-sm ml-3 flex-shrink-0"
                >
                  {texts.remove}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {state.products.length > 0 && (
            <p className="text-sm text-slate-400 mb-4 text-center">
              {state.products.length} {texts.products}
            </p>
          )}

          {/* Add form */}
          {showForm ? (
            <motion.div
              className="bg-white border-2 border-blue-200 rounded-2xl p-5 space-y-3 mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <input
                type="text"
                placeholder={texts.namePh}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-slate-800 focus:border-blue-500 focus:outline-none transition-colors"
              />
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder={texts.pricePh}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="flex-1 px-4 py-2.5 border-2 border-slate-200 rounded-xl text-slate-800 focus:border-blue-500 focus:outline-none transition-colors"
                />
                <input
                  type="text"
                  placeholder={texts.catPh}
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="flex-1 px-4 py-2.5 border-2 border-slate-200 rounded-xl text-slate-800 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
              <textarea
                placeholder={texts.descPh}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-slate-800 focus:border-blue-500 focus:outline-none transition-colors resize-none"
              />
              <input
                type="text"
                placeholder={texts.imagePh}
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-slate-800 focus:border-blue-500 focus:outline-none transition-colors"
              />
              <div className="flex gap-3 pt-1">
                <button
                  onClick={addProduct}
                  disabled={!form.name.trim() || !form.price.trim()}
                  className="flex-1 px-4 py-2.5 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {texts.add}
                </button>
                <button
                  onClick={() => { setShowForm(false); setForm(emptyForm); }}
                  className="px-4 py-2.5 text-slate-500 hover:text-slate-700 transition-colors"
                >
                  {lang === "ru" ? "Отмена" : lang === "uz" ? "Bekor" : "Cancel"}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              onClick={() => setShowForm(true)}
              className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-500 transition-colors mb-4"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {texts.addMore}
            </motion.button>
          )}

          <button
            onClick={() => setMode(null)}
            className="text-sm text-slate-400 hover:text-slate-600 block mx-auto mb-4"
          >
            {lang === "ru" ? "Другой способ добавления" : lang === "uz" ? "Boshqa usul" : "Other import method"}
          </button>
        </div>
      )}

      {/* Bottom buttons */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={goNext}
          className="text-slate-400 hover:text-slate-600 transition-colors text-sm"
        >
          {texts.skip}
        </button>
        {state.products.length > 0 && (
          <motion.button
            onClick={goNext}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {texts.continue}
          </motion.button>
        )}
      </div>
    </div>
  );
}
