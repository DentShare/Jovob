"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type DemoBotId = "bellaModa" | "opiPlov";

export interface DemoMetrics {
  messagesToday: number;
  messagesChange: string;
  ordersTotal: number;
  ordersChange: string;
  newClients: number;
  clientsChange: string;
  aiAnswerRate: number;
  aiChange: string;
}

export interface DemoDialog {
  id: string;
  customerName: string;
  lastMessage: string;
  time: string;
  platform: "telegram" | "instagram" | "whatsapp";
  status: "ai_answered" | "operator_needed";
  unread: boolean;
  messages: { role: "customer" | "bot" | "operator"; text: string; time: string }[];
}

export interface DemoOrder {
  id: string;
  customer: string;
  phone: string;
  items: string;
  total: number;
  status: "NEW" | "CONFIRMED" | "PREPARING" | "DELIVERED" | "CANCELLED";
  date: string;
}

export interface DemoProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
  imageUrl: string | null;
}

export interface DemoUnanswered {
  id: string;
  question: string;
  askedCount: number;
  lastAsked: string;
}

export interface DemoBotData {
  id: DemoBotId;
  name: string;
  description: string;
  emoji: string;
  metrics: DemoMetrics;
  dialogs: DemoDialog[];
  orders: DemoOrder[];
  products: DemoProduct[];
  unanswered: DemoUnanswered[];
}

interface DemoContextType {
  currentBotId: DemoBotId;
  currentBot: DemoBotData;
  switchBot: () => void;
  isDemo: boolean;
}

const DemoContext = createContext<DemoContextType | null>(null);

// ================= BELLA MODA DATA =================
const bellaModaData: DemoBotData = {
  id: "bellaModa",
  name: "Bella Moda",
  description: "Интернет-магазин женской одежды из Турции",
  emoji: "👗",
  metrics: {
    messagesToday: 127,
    messagesChange: "+12% от вчера",
    ordersTotal: 23,
    ordersChange: "+3 новых",
    newClients: 8,
    clientsChange: "+2 от вчера",
    aiAnswerRate: 89,
    aiChange: "Выше на 5%",
  },
  dialogs: [
    {
      id: "bm1",
      customerName: "Дилноза Рахимова",
      lastMessage: "Спасибо, платье получила! Очень красивое!",
      time: "5 мин назад",
      platform: "telegram",
      status: "ai_answered",
      unread: false,
      messages: [
        { role: "customer", text: "Здравствуйте! Платье «Гюзель» есть в размере M?", time: "10:15" },
        { role: "bot", text: "Здравствуйте, Дилноза! Да, платье «Гюзель» доступно в размерах S, M, L. Цена — 189 000 сум. Оформить заказ?", time: "10:15" },
        { role: "customer", text: "Да, M размер, доставка в Юнусабад", time: "10:16" },
        { role: "bot", text: "Заказ #1087 оформлен! Платье «Гюзель» (M) — 189 000 сум. Доставка бесплатная. Ожидайте курьера сегодня до 18:00.", time: "10:16" },
        { role: "customer", text: "Спасибо, платье получила! Очень красивое!", time: "14:30" },
      ],
    },
    {
      id: "bm2",
      customerName: "Нодира Усманова",
      lastMessage: "А кардиган можно в рассрочку взять?",
      time: "12 мин назад",
      platform: "instagram",
      status: "operator_needed",
      unread: true,
      messages: [
        { role: "customer", text: "Кардиган «Кузги» сколько стоит?", time: "11:00" },
        { role: "bot", text: "Кардиган «Кузги» — 289 000 сум. Тёплый, из турецкого кашемира. Цвета: бежевый, серый, тёмно-зелёный.", time: "11:00" },
        { role: "customer", text: "А кардиган можно в рассрочку взять?", time: "11:02" },
      ],
    },
    {
      id: "bm3",
      customerName: "Шахло Каримова",
      lastMessage: "Доставка в Самарканд есть?",
      time: "25 мин назад",
      platform: "telegram",
      status: "ai_answered",
      unread: false,
      messages: [
        { role: "customer", text: "Доставка в Самарканд есть?", time: "13:10" },
        { role: "bot", text: "Да! Доставка по Узбекистану через Yandex Go. По Ташкенту — бесплатно от 150 000 сум. В регионы — 25 000 сум, доставка 2-3 дня.", time: "13:10" },
      ],
    },
    {
      id: "bm4",
      customerName: "Алишер Маматов",
      lastMessage: "Хочу жене подарок на день рождения, что посоветуете?",
      time: "40 мин назад",
      platform: "whatsapp",
      status: "ai_answered",
      unread: false,
      messages: [
        { role: "customer", text: "Хочу жене подарок на день рождения, что посоветуете?", time: "12:00" },
        { role: "bot", text: "Отличная идея! Рекомендую наши бестселлеры: вечернее платье «Лале» (349 000) или комплект палантин + сумочка (289 000). Могу упаковать в подарочную коробку!", time: "12:00" },
        { role: "customer", text: "Платье «Лале» давайте, размер S. Упакуйте красиво!", time: "12:02" },
        { role: "bot", text: "Заказ #1088 создан! Платье «Лале» (S) + подарочная упаковка — 349 000 сум. Доставка завтра до 12:00. Поздравляем вашу жену!", time: "12:02" },
      ],
    },
    {
      id: "bm5",
      customerName: "Камола Ибрагимова",
      lastMessage: "Можно обменять размер? Мне большой оказался",
      time: "1 час назад",
      platform: "telegram",
      status: "operator_needed",
      unread: true,
      messages: [
        { role: "customer", text: "Можно обменять размер? Мне большой оказался", time: "11:30" },
        { role: "bot", text: "Конечно! Обмен в течение 7 дней. Сейчас подключу менеджера для оформления обмена.", time: "11:30" },
      ],
    },
    {
      id: "bm6",
      customerName: "Зарина Ташпулатова",
      lastMessage: "Когда новая коллекция весна-лето будет?",
      time: "2 часа назад",
      platform: "telegram",
      status: "ai_answered",
      unread: false,
      messages: [
        { role: "customer", text: "Когда новая коллекция весна-лето будет?", time: "10:00" },
        { role: "bot", text: "Новая коллекция весна-лето 2026 уже в пути! Поступление ожидается 1 апреля. Подпишитесь на канал @bellamoda_uz, чтобы не пропустить!", time: "10:00" },
      ],
    },
  ],
  orders: [
    { id: "o1", customer: "Дилноза Рахимова", phone: "+998931112233", items: "Платье «Гюзель» (M)", total: 189000, status: "DELIVERED", date: "2026-03-23" },
    { id: "o2", customer: "Алишер Маматов", phone: "+998907778899", items: "Платье вечернее «Лале» (S) + подарочная упаковка", total: 349000, status: "CONFIRMED", date: "2026-03-23" },
    { id: "o3", customer: "Нодира Усманова", phone: "+998945556677", items: "Кардиган «Кузги» + Палантин шёлковый", total: 368000, status: "NEW", date: "2026-03-23" },
    { id: "o4", customer: "Шерзод Ахмедов", phone: "+998991234567", items: "Жакет «Бахор» (L)", total: 259000, status: "PREPARING", date: "2026-03-22" },
    { id: "o5", customer: "Камола Ибрагимова", phone: "+998933334455", items: "Комбинезон летний (S)", total: 229000, status: "CANCELLED", date: "2026-03-22" },
    { id: "o6", customer: "Зарина Ташпулатова", phone: "+998901234567", items: "Джинсы Mom Fit (28) + 2x Футболка базовая", total: 337000, status: "DELIVERED", date: "2026-03-21" },
  ],
  products: [
    { id: "p1", name: "Платье летнее «Гюзель»", price: 189000, category: "Платья", inStock: true, imageUrl: null },
    { id: "p2", name: "Платье вечернее «Лале»", price: 349000, category: "Платья", inStock: true, imageUrl: null },
    { id: "p3", name: "Блузка «Севинч»", price: 129000, category: "Блузки", inStock: true, imageUrl: null },
    { id: "p4", name: "Юбка миди «Дилноза»", price: 159000, category: "Юбки", inStock: false, imageUrl: null },
    { id: "p5", name: "Кардиган «Кузги»", price: 289000, category: "Верхняя одежда", inStock: true, imageUrl: null },
    { id: "p6", name: "Жакет «Бахор»", price: 259000, category: "Верхняя одежда", inStock: true, imageUrl: null },
    { id: "p7", name: "Джинсы Mom Fit", price: 199000, category: "Брюки", inStock: true, imageUrl: null },
    { id: "p8", name: "Футболка базовая", price: 69000, category: "Топы", inStock: true, imageUrl: null },
    { id: "p9", name: "Палантин шёлковый", price: 79000, category: "Аксессуары", inStock: true, imageUrl: null },
    { id: "p10", name: "Сумка кросс-боди", price: 149000, category: "Аксессуары", inStock: true, imageUrl: null },
  ],
  unanswered: [
    { id: "u1", question: "Можно сшить на заказ по моим меркам?", askedCount: 5, lastAsked: "Сегодня" },
    { id: "u2", question: "Есть ли рассрочка через Uzum Nasiya?", askedCount: 4, lastAsked: "Сегодня" },
    { id: "u3", question: "Когда поступление новой коллекции?", askedCount: 3, lastAsked: "Вчера" },
    { id: "u4", question: "Есть ли оптовые цены для магазинов?", askedCount: 2, lastAsked: "Вчера" },
  ],
};

// ================= OPI PLOV DATA =================
const opiPlovData: DemoBotData = {
  id: "opiPlov",
  name: "Opi Plov",
  description: "Ресторан узбекской кухни, Ташкент",
  emoji: "🍽️",
  metrics: {
    messagesToday: 84,
    messagesChange: "+8% от вчера",
    ordersTotal: 47,
    ordersChange: "+11 новых",
    newClients: 15,
    clientsChange: "+5 от вчера",
    aiAnswerRate: 93,
    aiChange: "Выше на 3%",
  },
  dialogs: [
    {
      id: "op1",
      customerName: "Бахтиёр Нуров",
      lastMessage: "Плов был огонь! Рахмат!",
      time: "3 мин назад",
      platform: "telegram",
      status: "ai_answered",
      unread: false,
      messages: [
        { role: "customer", text: "Ассалому алайкум! Плов на вынос есть?", time: "12:00" },
        { role: "bot", text: "Ва алайкум ассалом! Да, плов на вынос — 45 000 сум за порцию. Минимальный заказ 2 порции для доставки. Оформить?", time: "12:00" },
        { role: "customer", text: "4 порции плова и 2 самсы", time: "12:01" },
        { role: "bot", text: "Заказ #2041: 4x Плов (180 000) + 2x Самса (24 000) = 204 000 сум. Доставка 30-40 мин. Адрес?", time: "12:01" },
        { role: "customer", text: "Мирзо Улугбек, Буюк Ипак Йули 105", time: "12:02" },
        { role: "bot", text: "Принято! Доставка к 12:40. Оплата при получении или Click/Payme.", time: "12:02" },
        { role: "customer", text: "Плов был огонь! Рахмат!", time: "13:15" },
      ],
    },
    {
      id: "op2",
      customerName: "Малика Азимова",
      lastMessage: "Можно забронировать столик на 8 человек на субботу?",
      time: "10 мин назад",
      platform: "instagram",
      status: "operator_needed",
      unread: true,
      messages: [
        { role: "customer", text: "Здравствуйте! У вас есть банкетный зал?", time: "13:00" },
        { role: "bot", text: "Здравствуйте! Да, у нас есть банкетный зал на 40 человек и VIP-комната на 12. Стоимость аренды от 500 000 сум.", time: "13:00" },
        { role: "customer", text: "Можно забронировать столик на 8 человек на субботу?", time: "13:02" },
      ],
    },
    {
      id: "op3",
      customerName: "Рустам Каримов",
      lastMessage: "Шашлык из какого мяса?",
      time: "18 мин назад",
      platform: "telegram",
      status: "ai_answered",
      unread: false,
      messages: [
        { role: "customer", text: "Шашлык из какого мяса?", time: "12:30" },
        { role: "bot", text: "У нас шашлык из баранины (35 000), говядины (32 000) и курицы (25 000). Все порции ~250г с луком и лепёшкой. Какой желаете?", time: "12:30" },
      ],
    },
    {
      id: "op4",
      customerName: "Зилола Хамидова",
      lastMessage: "А у вас есть детское меню?",
      time: "35 мин назад",
      platform: "whatsapp",
      status: "ai_answered",
      unread: false,
      messages: [
        { role: "customer", text: "А у вас есть детское меню?", time: "12:10" },
        { role: "bot", text: "Да! Детское меню: котлетки с пюре (22 000), куриный суп (18 000), мини-лагман (20 000), компот (8 000). Порции уменьшенные, подходят для детей 3-10 лет.", time: "12:10" },
        { role: "customer", text: "Отлично, спасибо!", time: "12:11" },
      ],
    },
    {
      id: "op5",
      customerName: "Жавохир Тошматов",
      lastMessage: "Мне нужен корпоратив на 25 человек, меню 80 000 на человека",
      time: "1 час назад",
      platform: "telegram",
      status: "operator_needed",
      unread: true,
      messages: [
        { role: "customer", text: "Мне нужен корпоратив на 25 человек, меню 80 000 на человека", time: "11:40" },
        { role: "bot", text: "Отличный выбор! Для корпоратива на 25 человек подключаю менеджера банкетов для подбора меню и обсуждения деталей.", time: "11:40" },
      ],
    },
    {
      id: "op6",
      customerName: "Саида Муминова",
      lastMessage: "Вы до скольки работаете?",
      time: "2 часа назад",
      platform: "telegram",
      status: "ai_answered",
      unread: false,
      messages: [
        { role: "customer", text: "Вы до скольки работаете?", time: "10:30" },
        { role: "bot", text: "Мы работаем ежедневно с 10:00 до 23:00. Кухня закрывается в 22:30. Адрес: ул. Навои 32, Ташкент. Ждём вас!", time: "10:30" },
      ],
    },
  ],
  orders: [
    { id: "ro1", customer: "Бахтиёр Нуров", phone: "+998901234567", items: "4x Плов + 2x Самса", total: 204000, status: "DELIVERED", date: "2026-03-23" },
    { id: "ro2", customer: "Фарход Ахмедов", phone: "+998935551122", items: "2x Шашлык баранина + Лагман + 2x Чай", total: 112000, status: "CONFIRMED", date: "2026-03-23" },
    { id: "ro3", customer: "Малика Азимова", phone: "+998977778899", items: "3x Манты + Салат Ачичук + Компот", total: 89000, status: "NEW", date: "2026-03-23" },
    { id: "ro4", customer: "Рустам Каримов", phone: "+998911112233", items: "Плов + Шашлык говядина + Нарын + 2x Лепёшка", total: 127000, status: "PREPARING", date: "2026-03-23" },
    { id: "ro5", customer: "Зилола Хамидова", phone: "+998943334455", items: "Детское меню x2 + Плов + Чай зелёный", total: 109000, status: "DELIVERED", date: "2026-03-22" },
    { id: "ro6", customer: "Ойбек Сулейманов", phone: "+998955556677", items: "10x Самса + 5x Чай", total: 160000, status: "CANCELLED", date: "2026-03-22" },
    { id: "ro7", customer: "Нигора Рашидова", phone: "+998966667788", items: "Лагман + Ширчой + Самса 3шт", total: 74000, status: "DELIVERED", date: "2026-03-21" },
  ],
  products: [
    { id: "rp1", name: "Плов по-ташкентски", price: 45000, category: "Основные блюда", inStock: true, imageUrl: null },
    { id: "rp2", name: "Шашлык из баранины", price: 35000, category: "Основные блюда", inStock: true, imageUrl: null },
    { id: "rp3", name: "Шашлык из говядины", price: 32000, category: "Основные блюда", inStock: true, imageUrl: null },
    { id: "rp4", name: "Самса с мясом", price: 12000, category: "Выпечка", inStock: true, imageUrl: null },
    { id: "rp5", name: "Лагман", price: 38000, category: "Основные блюда", inStock: true, imageUrl: null },
    { id: "rp6", name: "Манты (3 шт)", price: 28000, category: "Основные блюда", inStock: true, imageUrl: null },
    { id: "rp7", name: "Нарын", price: 40000, category: "Основные блюда", inStock: true, imageUrl: null },
    { id: "rp8", name: "Салат Ачичук", price: 15000, category: "Салаты", inStock: true, imageUrl: null },
    { id: "rp9", name: "Чай зелёный (чайник)", price: 10000, category: "Напитки", inStock: true, imageUrl: null },
    { id: "rp10", name: "Компот домашний", price: 8000, category: "Напитки", inStock: true, imageUrl: null },
    { id: "rp11", name: "Лепёшка", price: 5000, category: "Выпечка", inStock: true, imageUrl: null },
    { id: "rp12", name: "Ширчой", price: 12000, category: "Напитки", inStock: false, imageUrl: null },
  ],
  unanswered: [
    { id: "ru1", question: "Есть ли у вас халяль-сертификат?", askedCount: 6, lastAsked: "Сегодня" },
    { id: "ru2", question: "Можно ли заказать плов на 50 человек на мероприятие?", askedCount: 4, lastAsked: "Сегодня" },
    { id: "ru3", question: "Есть ли парковка рядом с рестораном?", askedCount: 3, lastAsked: "Вчера" },
    { id: "ru4", question: "Работает ли летняя терраса?", askedCount: 2, lastAsked: "Вчера" },
  ],
};

const botDataMap: Record<DemoBotId, DemoBotData> = {
  bellaModa: bellaModaData,
  opiPlov: opiPlovData,
};

export function DemoProvider({ children }: { children: ReactNode }) {
  const [currentBotId, setCurrentBotId] = useState<DemoBotId>("bellaModa");

  const switchBot = useCallback(() => {
    setCurrentBotId((prev) => (prev === "bellaModa" ? "opiPlov" : "bellaModa"));
  }, []);

  const currentBot = botDataMap[currentBotId];

  return (
    <DemoContext.Provider value={{ currentBotId, currentBot, switchBot, isDemo: true }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo(): DemoContextType {
  const ctx = useContext(DemoContext);
  if (!ctx) {
    // Return a fallback for non-demo pages
    return {
      currentBotId: "bellaModa",
      currentBot: bellaModaData,
      switchBot: () => {},
      isDemo: false,
    };
  }
  return ctx;
}
