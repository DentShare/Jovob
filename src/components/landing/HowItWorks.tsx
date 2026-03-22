"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Ответьте на вопросы о вашем бизнесе",
    description:
      "Расскажите, чем занимаетесь, загрузите прайс-лист — и AI создаст бота, который знает ваш бизнес",
    expandedDetail:
      "Наш AI проанализирует ваш бизнес и автоматически настроит ответы, тон общения и логику бота",
    time: "7 минут",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
        />
      </svg>
    ),
    gradient: "from-blue-500 to-blue-600",
    bg: "bg-blue-50",
    accent: "text-blue-600",
    glowColor: "shadow-blue-500/20",
    borderHover: "group-hover:border-blue-200",
    floatingIcon: (
      <motion.div
        animate={{ y: [-8, 8, -8], rotate: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        className="absolute -top-3 -right-3 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-500 text-sm opacity-60"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </motion.div>
    ),
  },
  {
    number: "02",
    title: "Подключите мессенджеры",
    description:
      "Подключите Telegram, Instagram или WhatsApp одним кликом. Без технических знаний",
    expandedDetail:
      "Просто нажмите кнопку — мы автоматически создадим бота и привяжем к вашему аккаунту",
    time: "2 минуты",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-4.071a4.5 4.5 0 00-1.242-7.244l4.5-4.5a4.5 4.5 0 016.364 6.364l-1.757 1.757"
        />
      </svg>
    ),
    gradient: "from-purple-500 to-purple-600",
    bg: "bg-purple-50",
    accent: "text-purple-600",
    glowColor: "shadow-purple-500/20",
    borderHover: "group-hover:border-purple-200",
    floatingIcon: (
      <motion.div
        animate={{ y: [6, -6, 6], rotate: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
        className="absolute -bottom-3 -left-3 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-500 text-sm opacity-60"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      </motion.div>
    ),
  },
  {
    number: "03",
    title: "Бот начинает работать",
    description:
      "Ваш AI-помощник отвечает клиентам, принимает заказы и работает без выходных",
    expandedDetail:
      "Бот обучается на каждом диалоге и становится умнее. Вы видите всю аналитику в дашборде",
    time: "24/7",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
        />
      </svg>
    ),
    gradient: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-50",
    accent: "text-emerald-600",
    glowColor: "shadow-emerald-500/20",
    borderHover: "group-hover:border-emerald-200",
    floatingIcon: (
      <motion.div
        animate={{ y: [-5, 10, -5], x: [3, -3, 3] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        className="absolute -top-3 -left-3 w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-500 text-sm opacity-60"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </motion.div>
    ),
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
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

export default function HowItWorks() {
  return (
    <section className="relative py-24 px-6 bg-white overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #6366f1 1px, transparent 0)`,
        backgroundSize: '48px 48px',
      }} />

      <div className="max-w-6xl mx-auto relative">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 text-sm font-semibold rounded-full mb-4">
            Как это работает
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Три простых шага к вашему AI-боту
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Никакого программирования. Справится любой предприниматель
          </p>
        </motion.div>

        {/* Animated connecting line (desktop only) */}
        <div className="hidden md:block absolute top-[55%] left-[20%] right-[20%] z-0">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
            className="h-[2px] bg-gradient-to-r from-blue-200 via-purple-200 to-emerald-200 origin-left"
          />
          {/* Dots on the line */}
          {[0, 50, 100].map((pos, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.8 + i * 0.3 }}
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-blue-300 shadow-sm"
              style={{ left: `${pos}%`, transform: `translateX(-50%) translateY(-50%)` }}
            />
          ))}
        </div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10"
        >
          {steps.map((step, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              className="group relative"
            >
              {/* Floating icon */}
              {step.floatingIcon}

              <div className={`relative bg-white rounded-3xl border border-gray-100 ${step.borderHover} p-8 shadow-sm hover:shadow-xl hover:${step.glowColor} transition-all duration-500 hover:-translate-y-2 h-full overflow-hidden`}>
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-purple-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />

                {/* Step number */}
                <div className="relative flex items-center justify-between mb-6">
                  <div
                    className={`w-14 h-14 rounded-2xl ${step.bg} flex items-center justify-center ${step.accent} transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:${step.glowColor}`}
                  >
                    {step.icon}
                  </div>
                  <span className="text-5xl font-black text-gray-100 group-hover:text-gray-200 transition-colors">
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <div className="relative">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed mb-2">
                    {step.description}
                  </p>
                  {/* Expanded detail on hover */}
                  <div className="max-h-0 group-hover:max-h-20 overflow-hidden transition-all duration-500 ease-out">
                    <p className="text-sm text-blue-600/80 leading-relaxed pt-2 border-t border-gray-100 mt-2">
                      {step.expandedDetail}
                    </p>
                  </div>
                </div>

                {/* Time badge with pulse */}
                <div className="relative mt-6">
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${step.gradient} text-white text-sm font-semibold shadow-md relative overflow-hidden`}
                  >
                    {/* Pulse ring */}
                    <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-white" style={{ animationDuration: '3s' }} />
                    <svg
                      className="w-4 h-4 relative"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="relative">{step.time}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
