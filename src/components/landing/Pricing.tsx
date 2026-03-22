"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "0",
    period: "навсегда",
    description: "Для тестирования и малого бизнеса",
    features: [
      "100 контактов",
      "1 бот",
      "Telegram",
      "AI-ответы (GPT-4o mini)",
      "Базовая аналитика",
    ],
    cta: "Начать бесплатно",
    href: "/create",
    popular: false,
    gradient: "from-gray-50 to-gray-100",
    borderColor: "border-gray-200",
    ctaStyle:
      "bg-gray-900 text-white hover:bg-gray-800",
  },
  {
    name: "Starter",
    price: "29 000",
    period: "сум/мес",
    description: "Для растущего бизнеса",
    features: [
      "1 000 контактов",
      "3 бота",
      "Telegram + Instagram",
      "AI-ответы (GPT-4o)",
      "Продвинутая аналитика",
      "Приоритетная поддержка",
      "Кастомный брендинг",
    ],
    cta: "Выбрать Starter",
    href: "/create",
    popular: true,
    gradient: "from-blue-500 to-purple-600",
    borderColor: "border-blue-300",
    ctaStyle:
      "bg-white text-blue-600 hover:bg-blue-50 shadow-lg shadow-white/20",
  },
  {
    name: "Business",
    price: "89 000",
    period: "сум/мес",
    description: "Для крупного бизнеса и сетей",
    features: [
      "Безлимит контактов",
      "Безлимит ботов",
      "Все мессенджеры",
      "AI-ответы (GPT-4o + Claude)",
      "API доступ",
      "Выделенный менеджер",
      "Белый лейбл",
      "SLA 99.9%",
    ],
    cta: "Выбрать Business",
    href: "/create",
    popular: false,
    gradient: "from-gray-50 to-gray-100",
    borderColor: "border-gray-200",
    ctaStyle:
      "bg-gray-900 text-white hover:bg-gray-800",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export default function Pricing() {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-purple-50/30 to-white" />

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-purple-50 text-purple-600 text-sm font-semibold rounded-full mb-4">
            Тарифы
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Простые и понятные цены
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Начните бесплатно, масштабируйтесь по мере роста
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start"
        >
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              className={`relative rounded-3xl overflow-hidden ${
                plan.popular ? "md:-mt-4 md:mb-[-16px]" : ""
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center text-sm font-semibold py-2 z-10">
                  Самый популярный
                </div>
              )}

              <div
                className={`relative h-full p-8 ${
                  plan.popular
                    ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white pt-14 shadow-2xl shadow-blue-500/20"
                    : "bg-white border border-gray-100 shadow-lg shadow-gray-100/50"
                } rounded-3xl`}
              >
                {/* Plan name */}
                <div className="mb-6">
                  <h3
                    className={`text-lg font-bold mb-1 ${
                      plan.popular ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={`text-sm ${
                      plan.popular ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <span
                    className={`text-5xl font-black ${
                      plan.popular ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`text-sm ml-2 ${
                      plan.popular ? "text-blue-200" : "text-gray-400"
                    }`}
                  >
                    {plan.period}
                  </span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fi) => (
                    <li key={fi} className="flex items-center gap-3 text-sm">
                      <svg
                        className={`w-5 h-5 flex-shrink-0 ${
                          plan.popular ? "text-blue-200" : "text-blue-500"
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span
                        className={
                          plan.popular ? "text-blue-50" : "text-gray-600"
                        }
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={plan.href}
                  className={`block w-full text-center px-6 py-4 rounded-2xl font-semibold text-sm transition-all duration-300 hover:-translate-y-0.5 ${plan.ctaStyle}`}
                >
                  {plan.cta}
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
