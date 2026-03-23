"use client";

import { useState, useMemo } from "react";
import { useBotContext } from "./BotContext";
import { trpc } from "@/lib/trpc";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
  description: string;
}

const defaultCategories = ["Все", "Розы", "Тюльпаны", "Букеты", "Аксессуары"];

const demoProducts: Product[] = [
  {
    id: "1",
    name: "Розы красные",
    price: 15000,
    image: "",
    category: "Розы",
    inStock: true,
    description: "Свежие красные розы, стебель 60 см",
  },
  {
    id: "2",
    name: "Розы белые",
    price: 15000,
    image: "",
    category: "Розы",
    inStock: true,
    description: "Нежные белые розы, стебель 60 см",
  },
  {
    id: "3",
    name: "Розы розовые",
    price: 16000,
    image: "",
    category: "Розы",
    inStock: false,
    description: "Розовые розы премиум, стебель 70 см",
  },
  {
    id: "4",
    name: "Тюльпаны белые",
    price: 10000,
    image: "",
    category: "Тюльпаны",
    inStock: true,
    description: "Голландские белые тюльпаны",
  },
  {
    id: "5",
    name: "Тюльпаны красные",
    price: 10000,
    image: "",
    category: "Тюльпаны",
    inStock: true,
    description: "Яркие красные тюльпаны",
  },
  {
    id: "6",
    name: "Букет свадебный",
    price: 500000,
    image: "",
    category: "Букеты",
    inStock: true,
    description: "Роскошный свадебный букет из белых роз и пионов",
  },
  {
    id: "7",
    name: "Букет микс",
    price: 200000,
    image: "",
    category: "Букеты",
    inStock: true,
    description: "Яркий микс из сезонных цветов",
  },
  {
    id: "8",
    name: "Ваза стеклянная",
    price: 80000,
    image: "",
    category: "Аксессуары",
    inStock: true,
    description: "Элегантная стеклянная ваза, 30 см",
  },
  {
    id: "9",
    name: "Корзина плетеная",
    price: 45000,
    image: "",
    category: "Аксессуары",
    inStock: false,
    description: "Плетеная корзина для цветочных композиций",
  },
];

function formatPrice(sum: number): string {
  return sum.toLocaleString("ru-RU") + " сум";
}

const colorPalette = [
  "bg-rose-100 text-rose-600",
  "bg-sky-100 text-sky-600",
  "bg-amber-100 text-amber-600",
  "bg-emerald-100 text-emerald-600",
  "bg-violet-100 text-violet-600",
  "bg-pink-100 text-pink-600",
  "bg-teal-100 text-teal-600",
  "bg-orange-100 text-orange-600",
  "bg-indigo-100 text-indigo-600",
];

export default function ProductsGrid() {
  const { currentBotId, isDemo } = useBotContext();
  const [activeCategory, setActiveCategory] = useState("Все");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCategory, setNewCategory] = useState("");

  // Fetch real products
  const productsQuery = trpc.product.list.useQuery(
    { botId: currentBotId! },
    { enabled: !isDemo && !!currentBotId, retry: false }
  );

  // Mutations
  const createMutation = trpc.product.create.useMutation({
    onSuccess: () => {
      productsQuery.refetch();
      setShowAddForm(false);
      setNewName("");
      setNewPrice("");
      setNewCategory("");
    },
  });

  const updateMutation = trpc.product.update.useMutation({
    onSuccess: () => productsQuery.refetch(),
  });

  const deleteMutation = trpc.product.delete.useMutation({
    onSuccess: () => productsQuery.refetch(),
  });

  // Map real products to local format
  const realProducts: Product[] = useMemo(() => {
    if (isDemo || !productsQuery.data) return [];
    return productsQuery.data.map((p) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      image: p.imageUrl ?? "",
      category: p.category ?? "Без категории",
      inStock: p.inStock,
      description: p.description ?? "",
    }));
  }, [isDemo, productsQuery.data]);

  const products = isDemo ? demoProducts : realProducts;

  // Derive categories from actual products
  const categories = useMemo(() => {
    if (isDemo) return defaultCategories;
    const cats = new Set(products.map((p) => p.category));
    return ["Все", ...Array.from(cats)];
  }, [isDemo, products]);

  const filtered = products.filter((p) => {
    if (activeCategory !== "Все" && p.category !== activeCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    }
    return true;
  });

  const handleCreate = () => {
    if (!newName.trim() || !newPrice.trim()) return;
    if (isDemo) {
      setShowAddForm(false);
      return;
    }
    createMutation.mutate({
      botId: currentBotId!,
      name: newName,
      price: Number(newPrice),
      category: newCategory || undefined,
    });
  };

  const handleDelete = (productId: string) => {
    if (isDemo) return;
    deleteMutation.mutate({ id: productId, botId: currentBotId! });
  };

  const handleToggleStock = (productId: string, currentInStock: boolean) => {
    if (isDemo) return;
    updateMutation.mutate({
      id: productId,
      botId: currentBotId!,
      inStock: !currentInStock,
    });
  };

  return (
    <div>
      {/* Controls */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-[#3B82F6] text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 sm:flex-none">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Поиск товара..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm text-gray-700 placeholder-gray-400 focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] sm:w-56"
            />
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-medium text-white hover:bg-[#2563EB] transition-colors whitespace-nowrap"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Добавить
          </button>
        </div>
      </div>

      {/* Add product form (inline) */}
      {showAddForm && (
        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Новый товар</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input
              type="text"
              placeholder="Название"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
            />
            <input
              type="number"
              placeholder="Цена (сум)"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
            />
            <input
              type="text"
              placeholder="Категория"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="flex-1 rounded-lg bg-[#3B82F6] py-2 text-sm font-medium text-white hover:bg-[#2563EB] transition-colors disabled:opacity-50"
              >
                {createMutation.isPending ? "..." : "Сохранить"}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((product, index) => (
          <div
            key={product.id}
            className="group rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Image placeholder */}
            <div className={`relative flex h-40 items-center justify-center ${colorPalette[index % colorPalette.length].split(" ")[0]}`}>
              {product.image ? (
                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-4xl opacity-60">
                  {product.category === "Розы"
                    ? "\uD83C\uDF39"
                    : product.category === "Тюльпаны"
                    ? "\uD83C\uDF37"
                    : product.category === "Букеты"
                    ? "\uD83D\uDC90"
                    : "\uD83C\uDF81"}
                </span>
              )}
              {!product.inStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-900">
                    Нет в наличии
                  </span>
                </div>
              )}
              {/* Actions overlay */}
              <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleToggleStock(product.id, product.inStock)}
                  className="rounded-lg bg-white/90 p-1.5 text-gray-600 hover:bg-white shadow-sm"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="rounded-lg bg-white/90 p-1.5 text-red-500 hover:bg-white shadow-sm"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{product.name}</h3>
                  <p className="mt-0.5 text-xs text-gray-500">{product.category}</p>
                </div>
                <span
                  className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    product.inStock
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {product.inStock ? "В наличии" : "Нет"}
                </span>
              </div>
              <p className="mt-2 text-lg font-bold text-gray-900">
                {formatPrice(product.price)}
              </p>
              <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                {product.description}
              </p>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-gray-500">Товары не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
}
