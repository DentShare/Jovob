"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: number;
  from: "user" | "bot";
  text: string;
}

const conversations: Record<string, Message[]> = {
  RU: [
    { id: 1, from: "user", text: "Здравствуйте! Есть ли в наличии iPhone 15?" },
    {
      id: 2,
      from: "bot",
      text: "Здравствуйте! Да, iPhone 15 есть в наличии:\n\n128 GB - 12 900 000 сум\n256 GB - 15 200 000 сум\n512 GB - 18 500 000 сум\n\nВсе цвета в наличии. Хотите оформить заказ?",
    },
    { id: 3, from: "user", text: "Да, 256 GB, чёрный. Доставка есть?" },
    {
      id: 4,
      from: "bot",
      text: "Отлично! iPhone 15, 256 GB, чёрный.\n\nДоставка по Ташкенту бесплатная, 1-2 часа. Для оформления отправьте, пожалуйста, номер телефона и адрес.",
    },
    { id: 5, from: "user", text: "+998 90 123 45 67, Чиланзар, 10 квартал" },
    {
      id: 6,
      from: "bot",
      text: "Заказ #1247 оформлен!\n\niPhone 15 256GB Черный\n15 200 000 сум\nДоставка: бесплатно\n\nКурьер прибудет в течение 2 часов. Спасибо за покупку!",
    },
  ],
  UZ: [
    { id: 1, from: "user", text: "Assalomu alaykum! iPhone 15 bormi?" },
    {
      id: 2,
      from: "bot",
      text: "Vaalaykum assalom! Ha, iPhone 15 mavjud:\n\n128 GB - 12 900 000 so'm\n256 GB - 15 200 000 so'm\n512 GB - 18 500 000 so'm\n\nBarcha ranglar bor. Buyurtma berasizmi?",
    },
    { id: 3, from: "user", text: "Ha, 256 GB, qora. Yetkazib berish bormi?" },
    {
      id: 4,
      from: "bot",
      text: "Ajoyib! iPhone 15, 256 GB, qora.\n\nToshkent bo'ylab yetkazish bepul, 1-2 soat. Buyurtma uchun telefon raqamingiz va manzilingizni yuboring.",
    },
  ],
  EN: [
    { id: 1, from: "user", text: "Hi! Do you have iPhone 15 in stock?" },
    {
      id: 2,
      from: "bot",
      text: "Hello! Yes, iPhone 15 is in stock:\n\n128 GB - 12,900,000 UZS\n256 GB - 15,200,000 UZS\n512 GB - 18,500,000 UZS\n\nAll colors available. Would you like to place an order?",
    },
    { id: 3, from: "user", text: "Yes, 256 GB, black. Do you deliver?" },
    {
      id: 4,
      from: "bot",
      text: "Great! iPhone 15, 256 GB, black.\n\nFree delivery in Tashkent, 1-2 hours. Please send your phone number and address to complete the order.",
    },
  ],
};

export default function ChatDemo() {
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [lang] = useState<"RU" | "UZ" | "EN">("RU");
  const chatRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const indexRef = useRef(0);

  const allMessages = conversations[lang];

  const showNext = useCallback(() => {
    const i = indexRef.current;
    if (i >= allMessages.length) {
      // Reset after pause
      timeoutRef.current = setTimeout(() => {
        indexRef.current = 0;
        setVisibleMessages([]);
        timeoutRef.current = setTimeout(() => showNext(), 1000);
      }, 4000);
      return;
    }

    const msg = allMessages[i];
    if (msg.from === "bot") {
      setIsTyping(true);
      timeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        setVisibleMessages((prev) => [...prev, msg]);
        indexRef.current = i + 1;
        timeoutRef.current = setTimeout(() => showNext(), 1200);
      }, 1500);
    } else {
      setVisibleMessages((prev) => [...prev, msg]);
      indexRef.current = i + 1;
      timeoutRef.current = setTimeout(() => showNext(), 800);
    }
  }, [allMessages]);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => showNext(), 1000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [showNext]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [visibleMessages, isTyping]);

  return (
    <section className="relative py-24 px-6 bg-gradient-to-b from-white via-gray-50/50 to-white overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #8B5CF6 1px, transparent 0)`,
        backgroundSize: '40px 40px',
      }} />

      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-600 text-sm font-semibold rounded-full mb-4">
            Живой пример
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Посмотрите, как работает бот
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Реальный пример диалога AI-бота магазина электроники
          </p>
        </motion.div>

        {/* Phone + floating stats layout */}
        <div className="flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            {/* Glow behind phone */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/15 to-purple-500/15 rounded-[4rem] blur-[80px] scale-125" />

            {/* Floating stats */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="hidden md:block absolute -left-52 top-16 z-20"
            >
              <div className="bg-white rounded-2xl shadow-xl shadow-blue-500/5 border border-gray-100 px-5 py-4 text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">89%</div>
                <div className="text-xs text-gray-500 mt-1">вопросов отвечено</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 1 }}
              className="hidden md:block absolute -right-48 top-28 z-20"
            >
              <div className="bg-white rounded-2xl shadow-xl shadow-purple-500/5 border border-gray-100 px-5 py-4 text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">24/7</div>
                <div className="text-xs text-gray-500 mt-1">без выходных</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="hidden md:block absolute -left-44 bottom-32 z-20"
            >
              <div className="bg-white rounded-2xl shadow-xl shadow-emerald-500/5 border border-gray-100 px-5 py-4 text-center">
                <div className="text-3xl font-bold text-emerald-500">&lt; 2 сек</div>
                <div className="text-xs text-gray-500 mt-1">время ответа</div>
              </div>
            </motion.div>

            {/* Phone frame */}
            <div className="relative w-[340px] sm:w-[380px] transform rotate-[-1deg] hover:rotate-0 transition-transform duration-700">
              {/* Phone body */}
              <div className="bg-gray-900 rounded-[2.8rem] border-[4px] border-gray-800 shadow-2xl shadow-gray-900/30 overflow-hidden">
                {/* Status bar */}
                <div className="flex items-center justify-between px-8 pt-3 pb-1 bg-gray-900">
                  <span className="text-white text-xs font-semibold">9:41</span>
                  <div className="w-24 h-6 bg-gray-800 rounded-full" /> {/* Dynamic Island */}
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-3 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
                    </svg>
                    <div className="w-5 h-2.5 border border-white/50 rounded-sm relative">
                      <div className="absolute inset-[1px] right-[2px] bg-green-400 rounded-[1px]" />
                    </div>
                  </div>
                </div>

                {/* Chat header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-3.5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-semibold text-sm">
                      TechStore Bot
                    </div>
                    <div className="text-white/70 text-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                      Online
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-white/30" />
                    <div className="w-2 h-2 rounded-full bg-white/30" />
                    <div className="w-2 h-2 rounded-full bg-white/30" />
                  </div>
                </div>

                {/* Messages */}
                <div
                  ref={chatRef}
                  className="bg-gray-50 px-4 py-6 h-[420px] overflow-y-auto space-y-3"
                >
                  <AnimatePresence mode="popLayout">
                    {visibleMessages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                            msg.from === "user"
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl rounded-br-md shadow-sm"
                              : "bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-sm border border-gray-100"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Typing indicator */}
                  <AnimatePresence>
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="flex justify-start"
                      >
                        <div className="bg-white px-5 py-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-100 flex gap-1.5 items-center">
                          <motion.span
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                          />
                          <motion.span
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{
                              repeat: Infinity,
                              duration: 1,
                              delay: 0.2,
                            }}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                          />
                          <motion.span
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{
                              repeat: Infinity,
                              duration: 1,
                              delay: 0.4,
                            }}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Input area */}
                <div className="bg-white px-4 py-3 border-t border-gray-100 flex items-center gap-3">
                  <div className="flex-1 bg-gray-50 rounded-full px-4 py-2.5 text-sm text-gray-400">
                    Написать сообщение...
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  </div>
                </div>

                {/* Home indicator */}
                <div className="bg-white pb-2 pt-1 flex justify-center">
                  <div className="w-32 h-1 bg-gray-200 rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
