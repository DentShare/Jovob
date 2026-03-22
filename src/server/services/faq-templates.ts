import type { FAQTemplate } from '@/types'

// ─── Pre-filled FAQ templates by business niche ─────────────────────────────
// Each template includes Russian (primary) and Uzbek translations.

export const faqTemplates: Record<string, FAQTemplate[]> = {
  clothing_store: [
    {
      question: 'Как оформить заказ?',
      questionUz: 'Qanday buyurtma beraman?',
      answer:
        'Напишите название товара или выберите из каталога. Мы уточним размер и адрес доставки, после чего оформим заказ.',
      answerUz:
        "Mahsulot nomini yozing yoki katalogdan tanlang. Biz o'lcham va yetkazib berish manzilini aniqlab, buyurtmani rasmiylashtramiz.",
    },
    {
      question: 'Какие способы доставки?',
      questionUz: 'Qanday yetkazib berish usullari bor?',
      answer:
        'Мы доставляем по Ташкенту за 1 день, по Узбекистану за 2-3 дня. Стоимость доставки зависит от региона.',
      answerUz:
        "Toshkent bo'yicha 1 kunda, O'zbekiston bo'yicha 2-3 kunda yetkazamiz. Yetkazish narxi hududga bog'liq.",
    },
    {
      question: 'Можно ли вернуть товар?',
      questionUz: "Mahsulotni qaytarish mumkinmi?",
      answer:
        'Да, в течение 14 дней с момента получения. Товар должен быть в оригинальной упаковке, без следов носки.',
      answerUz:
        "Ha, qabul qilganingizdan keyin 14 kun ichida. Mahsulot asl qadoqda, kiyilmagan bo'lishi kerak.",
    },
    {
      question: 'Какие способы оплаты?',
      questionUz: "Qanday to'lov usullari bor?",
      answer:
        'Принимаем наличные при доставке, UzCard и Humo через Click и Payme. Также можно оплатить переводом на карту.',
      answerUz:
        "Yetkazib berishda naqd pul, Click va Payme orqali UzCard va Humo qabul qilamiz. Kartaga o'tkazma bilan ham to'lash mumkin.",
    },
    {
      question: 'Есть ли размерная сетка?',
      questionUz: "O'lchamlar jadvali bormi?",
      answer:
        'Да, размеры указаны в описании каждого товара. Если сомневаетесь — напишите ваш рост и вес, поможем подобрать.',
      answerUz:
        "Ha, o'lchamlar har bir mahsulot tavsifida ko'rsatilgan. Ikkilansangiz — bo'yingiz va vazningizni yozing, tanlab beramiz.",
    },
  ],

  restaurant: [
    {
      question: 'Какое у вас меню?',
      questionUz: 'Sizda qanday menyu bor?',
      answer:
        'Наше полное меню доступно в каталоге. Вы можете выбрать категорию и посмотреть все блюда с ценами и описаниями.',
      answerUz:
        "To'liq menyumiz katalogda mavjud. Kategoriyani tanlab, barcha taomlarni narxlari va tavsiflari bilan ko'rishingiz mumkin.",
    },
    {
      question: 'Во сколько вы работаете?',
      questionUz: 'Soat nechada ishlaysiz?',
      answer:
        'Наш график работы указан в информации о заведении. Обычно мы работаем без выходных. Уточните, если нужен конкретный день.',
      answerUz:
        "Ish jadvalimiz muassasa haqidagi ma'lumotda ko'rsatilgan. Odatda dam olish kunlarisiz ishlaymiz. Aniq kun kerak bo'lsa, so'rang.",
    },
    {
      question: 'Есть ли доставка?',
      questionUz: 'Yetkazib berish bormi?',
      answer:
        'Да, мы доставляем еду по городу. Минимальный заказ — уточните у нас. Время доставки 30-60 минут в зависимости от района.',
      answerUz:
        "Ha, shahar bo'yicha yetkazamiz. Minimal buyurtma — bizdan so'rang. Yetkazish vaqti tumanga qarab 30-60 daqiqa.",
    },
    {
      question: 'Какой минимальный заказ?',
      questionUz: 'Minimal buyurtma qancha?',
      answer:
        'Минимальная сумма заказа для доставки зависит от вашего района. Напишите ваш адрес, и мы уточним.',
      answerUz:
        "Yetkazib berish uchun minimal buyurtma summasi tumaningizga bog'liq. Manzilingizni yozing, aniqlab beramiz.",
    },
    {
      question: 'Учитываете ли аллергии?',
      questionUz: 'Allergiyalarni hisobga olasizmi?',
      answer:
        'Да, обязательно сообщите об аллергиях при заказе. Мы учтём это при приготовлении вашего блюда.',
      answerUz:
        "Ha, buyurtma berayotganda allergiyalar haqida albatta xabar bering. Taomingizni tayyorlashda buni hisobga olamiz.",
    },
  ],

  beauty_salon: [
    {
      question: 'Какие у вас цены?',
      questionUz: 'Sizda narxlar qanday?',
      answer:
        'Полный прайс-лист доступен в каталоге услуг. Цены зависят от выбранной процедуры и мастера.',
      answerUz:
        "To'liq narxlar ro'yxati xizmatlar katalogida mavjud. Narxlar tanlangan protsedura va ustaga bog'liq.",
    },
    {
      question: 'Как записаться?',
      questionUz: "Qanday yozilaman?",
      answer:
        'Выберите услугу, удобную дату и время. Мы подтвердим запись и напомним за час до визита.',
      answerUz:
        "Xizmatni, qulay sana va vaqtni tanlang. Biz yozuvni tasdiqlaymiz va tashrifdan 1 soat oldin eslatamiz.",
    },
    {
      question: 'Можно отменить запись?',
      questionUz: "Yozuvni bekor qilish mumkinmi?",
      answer:
        'Да, вы можете отменить или перенести запись минимум за 2 часа до визита. Просто напишите нам.',
      answerUz:
        "Ha, tashrifdan kamida 2 soat oldin yozuvni bekor qilish yoki ko'chirish mumkin. Bizga yozing.",
    },
    {
      question: 'Есть парковка?',
      questionUz: 'Parkovka bormi?',
      answer:
        'Информация о парковке указана в разделе «Адрес». Если нужна помощь с навигацией — напишите, отправим локацию.',
      answerUz:
        "Parkovka haqida ma'lumot «Manzil» bo'limida ko'rsatilgan. Navigatsiya kerak bo'lsa — yozing, lokatsiya yuboramiz.",
    },
    {
      question: 'Какие мастера работают?',
      questionUz: 'Qaysi ustalar ishlaydi?',
      answer:
        'У нас работают опытные мастера по стрижке, окрашиванию, маникюру и другим услугам. Уточните, какую услугу ищете — подберём мастера.',
      answerUz:
        "Bizda soch olish, bo'yash, manikur va boshqa xizmatlar bo'yicha tajribali ustalar ishlaydi. Qaysi xizmat kerakligini ayting — usta tanlab beramiz.",
    },
  ],

  education: [
    {
      question: 'Какое расписание?',
      questionUz: 'Dars jadvali qanday?',
      answer:
        'Расписание зависит от выбранного курса и группы. Напишите название курса, и мы отправим актуальное расписание.',
      answerUz:
        "Dars jadvali tanlangan kurs va guruhga bog'liq. Kurs nomini yozing, joriy jadval yuboramiz.",
    },
    {
      question: 'Сколько стоит обучение?',
      questionUz: "O'qish qancha turadi?",
      answer:
        'Стоимость обучения зависит от курса и длительности. Полный прайс доступен в каталоге или уточните у нас.',
      answerUz:
        "O'qish narxi kurs va davomiyligiga bog'liq. To'liq narxlar katalogda mavjud yoki bizdan so'rang.",
    },
    {
      question: 'Есть пробный урок?',
      questionUz: 'Sinov darsi bormi?',
      answer:
        'Да, первый пробный урок бесплатный! Запишитесь, указав удобный день и время.',
      answerUz:
        "Ha, birinchi sinov darsi bepul! Qulay kun va vaqtni ko'rsatib yoziling.",
    },
    {
      question: 'Выдаётся ли сертификат?',
      questionUz: 'Sertifikat beriladimi?',
      answer:
        'Да, по окончании курса выдаётся сертификат. Для некоторых курсов доступен международный сертификат.',
      answerUz:
        "Ha, kurs tugagandan so'ng sertifikat beriladi. Ba'zi kurslar uchun xalqaro sertifikat mavjud.",
    },
  ],

  pharmacy: [
    {
      question: 'Есть ли нужное лекарство в наличии?',
      questionUz: 'Kerakli dori bormi?',
      answer:
        'Напишите название лекарства, и мы проверим наличие. Если нет в наличии — предложим аналоги.',
      answerUz:
        "Dori nomini yozing, mavjudligini tekshiramiz. Mavjud bo'lmasa — analoglarini taklif qilamiz.",
    },
    {
      question: 'Есть ли доставка лекарств?',
      questionUz: 'Dori yetkazib berish bormi?',
      answer:
        'Да, мы доставляем лекарства по городу. Рецептурные препараты доставляются при наличии рецепта.',
      answerUz:
        "Ha, shahar bo'yicha dori yetkazamiz. Retseptli dorilar retsept mavjud bo'lganda yetkaziladi.",
    },
    {
      question: 'Работает ли аптека круглосуточно?',
      questionUz: 'Dorixona kechayu kunduz ishlaydimi?',
      answer:
        'График работы указан в информации. Уточните, нужна ли помощь в нерабочее время — подскажем ближайшую дежурную аптеку.',
      answerUz:
        "Ish jadvali ma'lumotlarda ko'rsatilgan. Ish vaqtidan tashqari yordam kerakmi — eng yaqin navbatchi dorixonani aytamiz.",
    },
  ],

  electronics: [
    {
      question: 'Есть ли гарантия?',
      questionUz: 'Kafolat bormi?',
      answer:
        'Да, на всю технику действует официальная гарантия от 6 до 24 месяцев в зависимости от товара.',
      answerUz:
        "Ha, barcha texnikaga mahsulotga qarab 6 dan 24 oygacha rasmiy kafolat amal qiladi.",
    },
    {
      question: 'Можно ли купить в рассрочку?',
      questionUz: "Bo'lib to'lash mumkinmi?",
      answer:
        'Да, доступна рассрочка через Uzum Nasiya, Alif и другие сервисы. Напишите, какой товар интересует.',
      answerUz:
        "Ha, Uzum Nasiya, Alif va boshqa xizmatlar orqali bo'lib to'lash mavjud. Qaysi mahsulot qiziqtirayotganini yozing.",
    },
    {
      question: 'Как проверить наличие товара?',
      questionUz: "Mahsulot borligini qanday tekshiraman?",
      answer:
        'Напишите название или модель товара — мы сразу проверим наличие и сообщим цену.',
      answerUz:
        'Mahsulot nomi yoki modelini yozing — mavjudligini tekshirib, narxini aytamiz.',
    },
  ],

  grocery: [
    {
      question: 'Какой минимальный заказ?',
      questionUz: 'Minimal buyurtma qancha?',
      answer:
        'Минимальный заказ для доставки продуктов — уточните у нас. Доставка в пределах города.',
      answerUz:
        "Mahsulot yetkazib berish uchun minimal buyurtma — bizdan so'rang. Shahar ichida yetkazamiz.",
    },
    {
      question: 'Свежие ли продукты?',
      questionUz: "Mahsulotlar yangimi?",
      answer:
        'Да, мы следим за свежестью всех продуктов. Срок годности всегда указан, и мы гарантируем качество.',
      answerUz:
        "Ha, barcha mahsulotlar yangiligini nazorat qilamiz. Yaroqlilik muddati ko'rsatilgan, sifatni kafolatlaymiz.",
    },
  ],

  auto_parts: [
    {
      question: 'Как найти нужную запчасть?',
      questionUz: 'Kerakli ehtiyot qismni qanday topaman?',
      answer:
        'Напишите марку, модель и год выпуска автомобиля, а также название запчасти. Мы найдём и предложим варианты.',
      answerUz:
        "Avtomobil markasi, modeli va ishlab chiqarilgan yilini, shuningdek ehtiyot qism nomini yozing. Topib, variantlar taklif qilamiz.",
    },
    {
      question: 'Есть ли доставка запчастей?',
      questionUz: 'Ehtiyot qismlar yetkazib beriladimi?',
      answer:
        'Да, доставляем по городу и по всему Узбекистану. Сроки зависят от наличия на складе.',
      answerUz:
        "Ha, shahar va butun O'zbekiston bo'yicha yetkazamiz. Muddatlar ombordagi mavjudlikka bog'liq.",
    },
  ],

  real_estate: [
    {
      question: 'Какие объекты у вас есть?',
      questionUz: 'Sizda qanday obyektlar bor?',
      answer:
        'Наши актуальные предложения доступны в каталоге. Укажите район, бюджет и тип жилья — подберём варианты.',
      answerUz:
        "Joriy takliflarimiz katalogda mavjud. Tuman, byudjet va uy-joy turini ko'rsating — variantlar tanlab beramiz.",
    },
    {
      question: 'Можно ли посмотреть объект?',
      questionUz: "Obyektni ko'rish mumkinmi?",
      answer:
        'Да, мы организуем показ в удобное для вас время. Напишите, какой объект интересует.',
      answerUz:
        "Ha, siz uchun qulay vaqtda ko'rish uyushtiramiz. Qaysi obyekt qiziqtirayotganini yozing.",
    },
  ],

  other: [
    {
      question: 'Как с вами связаться?',
      questionUz: 'Siz bilan qanday bog\'lanaman?',
      answer:
        'Вы можете написать нам прямо здесь! Если нужна помощь менеджера — скажите, и мы переключим вас.',
      answerUz:
        "Bizga shu yerda yozishingiz mumkin! Menejer yordami kerak bo'lsa — ayting, siz bilan bog'laymiz.",
    },
    {
      question: 'Какие у вас цены?',
      questionUz: 'Narxlaringiz qanday?',
      answer:
        'Полный прайс-лист доступен в каталоге. Если ищете что-то конкретное — напишите, подскажем.',
      answerUz:
        "To'liq narxlar ro'yxati katalogda mavjud. Aniq narsa qidirayotgan bo'lsangiz — yozing, yordam beramiz.",
    },
    {
      question: 'Где вы находитесь?',
      questionUz: 'Qayerda joylashgansiz?',
      answer:
        'Наш адрес указан в информации о компании. Могу отправить локацию, если нужно.',
      answerUz:
        "Manzilimiz kompaniya haqidagi ma'lumotda ko'rsatilgan. Kerak bo'lsa lokatsiya yuborishim mumkin.",
    },
  ],
}

/**
 * Get FAQ templates for a given business type.
 * Falls back to 'other' if the type is not found.
 */
export function getFAQTemplates(businessType: string): FAQTemplate[] {
  return faqTemplates[businessType] ?? faqTemplates['other'] ?? []
}

/**
 * Get all available business types that have FAQ templates.
 */
export function getAvailableBusinessTypes(): string[] {
  return Object.keys(faqTemplates)
}
