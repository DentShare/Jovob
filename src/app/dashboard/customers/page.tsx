"use client";

import { useState } from "react";
import { useBotContext } from "@/components/dashboard/BotContext";
import { trpc } from "@/lib/trpc";

export default function CustomersPage() {
  const { currentBotId, isDemo } = useBotContext();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const customersQuery = trpc.customer.list.useQuery(
    { botId: currentBotId!, search: search || undefined },
    { enabled: !isDemo && !!currentBotId }
  );

  const detailQuery = trpc.customer.getById.useQuery(
    { id: selectedId!, botId: currentBotId! },
    { enabled: !!selectedId && !!currentBotId }
  );

  const addTagMutation = trpc.customer.addTag.useMutation({
    onSuccess: () => {
      customersQuery.refetch();
      detailQuery.refetch();
    },
  });

  const customers = customersQuery.data?.customers ?? [];
  const detail = detailQuery.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Клиенты</h1>
        <span className="text-sm text-gray-400">{customers.length} клиентов</span>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Поиск по имени или телефону..."
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer list */}
        <div className="lg:col-span-2 space-y-2">
          {customers.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <p className="text-gray-400">Клиентов пока нет</p>
              <p className="text-sm text-gray-300 mt-1">Они появятся когда люди начнут писать боту</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Имя</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Телефон</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Заказов</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Теги</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Последний контакт</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedId(c.id)}
                      className={`border-b border-gray-50 cursor-pointer hover:bg-blue-50/50 transition-colors ${selectedId === c.id ? "bg-blue-50" : ""}`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">{c.name || "Без имени"}</td>
                      <td className="px-4 py-3 text-gray-500">{c.phone || "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{c.totalOrders}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {c.tags.map((t) => (
                            <span key={t} className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs">{t}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(c.lastContact).toLocaleDateString("ru-RU")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Customer detail */}
        <div>
          {selectedId && detail ? (
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4 sticky top-4">
              <h3 className="font-semibold text-gray-900">{detail.customer.name || "Без имени"}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Телефон</span>
                  <span className="text-gray-900">{detail.customer.phone || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Платформа</span>
                  <span className="text-gray-900">{detail.customer.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Язык</span>
                  <span className="text-gray-900">{detail.customer.language || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Заказов</span>
                  <span className="text-gray-900">{detail.customer.totalOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Потрачено</span>
                  <span className="text-gray-900">{Number(detail.customer.totalSpent).toLocaleString("ru-RU")} UZS</span>
                </div>
              </div>

              {/* Tags */}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Теги</p>
                <div className="flex gap-1 flex-wrap">
                  {detail.customer.tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs">{t}</span>
                  ))}
                  {["VIP", "Новый", "Оптовый"].filter((t) => !detail.customer.tags.includes(t)).map((t) => (
                    <button
                      key={t}
                      onClick={() => addTagMutation.mutate({ id: selectedId, botId: currentBotId!, tag: t })}
                      className="px-2 py-0.5 rounded-full border border-dashed border-gray-300 text-gray-400 text-xs hover:border-blue-400 hover:text-blue-600 transition-colors"
                    >
                      + {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders */}
              {detail.orders.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Заказы</p>
                  <div className="space-y-1">
                    {detail.orders.slice(0, 5).map((o) => (
                      <div key={o.id} className="flex justify-between text-xs">
                        <span className="text-gray-500">{new Date(o.createdAt).toLocaleDateString("ru-RU")}</span>
                        <span className="font-medium">{Number(o.total).toLocaleString("ru-RU")} UZS</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Заметки</p>
                <p className="text-xs text-gray-400">{detail.customer.notes || "Нет заметок"}</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <p className="text-sm text-gray-400">Выберите клиента для подробностей</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
