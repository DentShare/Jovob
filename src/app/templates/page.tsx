import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Шаблоны ботов",
  description: "Готовые шаблоны AI-ботов для 10 ниш бизнеса: магазин, ресторан, салон, клиника и другие.",
};

const templates = [
  {
    id: "clothing_store",
    title: "Магазин одежды",
    titleUz: "Kiyim do'koni",
    description: "AI-бот для онлайн-магазина: каталог, заказы, доставка, размеры",
    emoji: "👗",
    features: ["Каталог товаров", "Оформление заказов", "Размерная сетка", "Отслеживание доставки"],
  },
  {
    id: "restaurant",
    title: "Ресторан / Кафе",
    titleUz: "Restoran",
    description: "Меню, заказ еды, бронирование столов, доставка",
    emoji: "🍽️",
    features: ["Электронное меню", "Заказ доставки", "Бронь столов", "Акции и скидки"],
  },
  {
    id: "beauty_salon",
    title: "Салон красоты",
    titleUz: "Go'zallik saloni",
    description: "Запись на услуги, прайс-лист, портфолио мастеров",
    emoji: "💅",
    features: ["Онлайн-запись", "Каталог услуг", "Напоминания", "Отзывы"],
  },
  {
    id: "education",
    title: "Образование",
    titleUz: "Ta'lim",
    description: "Курсы, расписание, стоимость, пробные уроки",
    emoji: "📚",
    features: ["Расписание занятий", "Запись на курс", "Стоимость", "Пробный урок"],
  },
  {
    id: "pharmacy",
    title: "Аптека",
    titleUz: "Dorixona",
    description: "Наличие лекарств, цены, аналоги, доставка",
    emoji: "💊",
    features: ["Поиск лекарств", "Проверка наличия", "Аналоги", "Доставка"],
  },
  {
    id: "electronics",
    title: "Электроника",
    titleUz: "Elektronika",
    description: "Техника, гаджеты, сравнение, гарантия",
    emoji: "📱",
    features: ["Каталог техники", "Сравнение моделей", "Гарантия", "Кредит"],
  },
  {
    id: "grocery",
    title: "Продуктовый магазин",
    titleUz: "Oziq-ovqat do'koni",
    description: "Продукты питания, доставка, акции",
    emoji: "🛒",
    features: ["Каталог продуктов", "Быстрая доставка", "Акции недели", "Списки покупок"],
  },
  {
    id: "auto_parts",
    title: "Автозапчасти / СТО",
    titleUz: "Avtozapchastlar",
    description: "Запчасти, ремонт, запись на диагностику",
    emoji: "🚗",
    features: ["Поиск запчастей", "Запись на ремонт", "Диагностика", "Гарантия"],
  },
  {
    id: "real_estate",
    title: "Недвижимость",
    titleUz: "Ko'chmas mulk",
    description: "Объявления, просмотры, консультации",
    emoji: "🏠",
    features: ["Каталог объектов", "Запись на просмотр", "Ипотека", "Консультация"],
  },
  {
    id: "other",
    title: "Любой бизнес",
    titleUz: "Boshqa biznes",
    description: "Универсальный шаблон для любой ниши",
    emoji: "🏢",
    features: ["FAQ автоматизация", "Приём заявок", "Каталог услуг", "Уведомления"],
  },
];

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Шаблоны ботов для бизнеса
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Выберите нишу — мы предзаполним FAQ, каталог и настройки AI-бота.
            Запуск за 7 минут.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-all group"
            >
              <div className="text-4xl mb-4">{t.emoji}</div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{t.title}</h2>
              <p className="text-sm text-gray-400 mb-3">{t.titleUz}</p>
              <p className="text-sm text-gray-600 mb-4">{t.description}</p>
              <ul className="space-y-1.5 mb-6">
                {t.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={`/create?template=${t.id}`}
                className="block w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all opacity-90 group-hover:opacity-100"
              >
                Создать такого бота
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            Или создайте бота с нуля
          </Link>
        </div>
      </div>
    </div>
  );
}
