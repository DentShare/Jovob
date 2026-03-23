"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const niches = [
  {
    emoji: "\uD83D\uDC57",
    title: "Магазин одежды",
    description: "Подбор размеров, каталог, отслеживание заказов",
    hoverGradient: "from-pink-500 to-rose-500",
    hoverBorder: "hover:border-pink-300",
    popular: true,
  },
  {
    emoji: "\uD83C\uDF55",
    title: "Еда и доставка",
    description: "Меню, приём заказов, статус доставки",
    hoverGradient: "from-orange-500 to-red-500",
    hoverBorder: "hover:border-orange-300",
    popular: true,
  },
  {
    emoji: "\uD83D\uDC87",
    title: "Красота и здоровье",
    description: "Запись на приём, прайс-лист, напоминания",
    hoverGradient: "from-purple-500 to-pink-500",
    hoverBorder: "hover:border-purple-300",
    popular: true,
  },
  {
    emoji: "\uD83D\uDCF1",
    title: "Электроника",
    description: "Характеристики товаров, сравнение, наличие",
    hoverGradient: "from-blue-500 to-cyan-500",
    hoverBorder: "hover:border-blue-300",
    popular: false,
  },
  {
    emoji: "\uD83C\uDF93",
    title: "Образование",
    description: "Расписание курсов, запись, ответы на FAQ",
    hoverGradient: "from-emerald-500 to-teal-500",
    hoverBorder: "hover:border-emerald-300",
    popular: false,
  },
  {
    emoji: "\uD83D\uDD27",
    title: "Услуги для дома",
    description: "Вызов мастера, расчёт стоимости, запись",
    hoverGradient: "from-amber-500 to-orange-500",
    hoverBorder: "hover:border-amber-300",
    popular: false,
  },
  {
    emoji: "\uD83D\uDE97",
    title: "Авто",
    description: "Запчасти, запись на СТО, консультации",
    hoverGradient: "from-slate-500 to-gray-600",
    hoverBorder: "hover:border-slate-300",
    popular: false,
  },
  {
    emoji: "\uD83D\uDC8A",
    title: "Аптека",
    description: "Поиск лекарств, аналоги, бронирование",
    hoverGradient: "from-green-500 to-emerald-500",
    hoverBorder: "hover:border-green-300",
    popular: false,
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
            Для кого подходит Jovob?
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
              className={`group relative bg-white rounded-2xl border border-gray-100 p-6 cursor-pointer transition-all duration-300 hover:shadow-xl ${niche.hoverBorder}`}
            >
              {/* Gradient border effect on hover */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${niche.hoverGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-[1px] scale-[1.02]`} />
              <div className="absolute inset-[1px] rounded-2xl bg-white group-hover:bg-white transition-colors -z-[5]" />

              {/* Hover glow */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${niche.hoverGradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`} />

              {/* Popular badge */}
              {niche.popular && (
                <div className="absolute -top-2 -right-2 z-10">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-[10px] font-bold rounded-full shadow-md">
                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    AI-шаблон
                  </span>
                </div>
              )}

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

          {/* "Your business?" card */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -6, scale: 1.02 }}
          >
            <Link
              href="/create"
              className="group relative flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-dashed border-blue-200 hover:border-blue-400 p-6 cursor-pointer transition-all duration-300 hover:shadow-lg h-full text-center min-h-[180px]"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Ваш бизнес?
              </h3>
              <p className="text-sm text-gray-500">
                Создайте бота под свою нишу
              </p>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
