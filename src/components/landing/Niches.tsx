"use client";

import { motion } from "framer-motion";

const niches = [
  {
    emoji: "\uD83D\uDC57",
    title: "Магазин одежды",
    description: "Подбор размеров, каталог, отслеживание заказов",
  },
  {
    emoji: "\uD83C\uDF55",
    title: "Еда и доставка",
    description: "Меню, приём заказов, статус доставки",
  },
  {
    emoji: "\uD83D\uDC87",
    title: "Красота и здоровье",
    description: "Запись на приём, прайс-лист, напоминания",
  },
  {
    emoji: "\uD83D\uDCF1",
    title: "Электроника",
    description: "Характеристики товаров, сравнение, наличие",
  },
  {
    emoji: "\uD83C\uDF93",
    title: "Образование",
    description: "Расписание курсов, запись, ответы на FAQ",
  },
  {
    emoji: "\uD83D\uDD27",
    title: "Услуги для дома",
    description: "Вызов мастера, расчёт стоимости, запись",
  },
  {
    emoji: "\uD83D\uDE97",
    title: "Авто",
    description: "Запчасти, запись на СТО, консультации",
  },
  {
    emoji: "\uD83D\uDC8A",
    title: "Аптека",
    description: "Поиск лекарств, аналоги, бронирование",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export default function Niches() {
  return (
    <section className="relative py-24 px-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-purple-50 text-purple-600 text-sm font-semibold rounded-full mb-4">
            Для любого бизнеса
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Для кого подходит BotUz?
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            AI-бот адаптируется под любую нишу. Вот самые популярные
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {niches.map((niche, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              className="group relative bg-white rounded-2xl border border-gray-100 p-6 cursor-pointer transition-shadow duration-300 hover:shadow-lg hover:border-blue-100"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative">
                <span className="text-4xl block mb-4">{niche.emoji}</span>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {niche.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {niche.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
