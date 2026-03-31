import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Оплата прошла успешно",
};

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Оплата прошла успешно!
        </h1>
        <p className="text-gray-500 mb-8">
          Ваша подписка активирована. Спасибо за покупку!
        </p>
        <Link
          href="/dashboard"
          className="inline-flex px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          Перейти в панель управления
        </Link>
      </div>
    </div>
  );
}
