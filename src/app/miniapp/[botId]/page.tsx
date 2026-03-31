"use client";

import { useState, useEffect, use } from "react";

interface Product {
  id: string;
  name: string;
  nameUz: string | null;
  description: string | null;
  price: number;
  currency: string;
  category: string | null;
  imageUrl: string | null;
  inStock: boolean;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function MiniAppPage({ params }: { params: Promise<{ botId: string }> }) {
  const { botId } = use(params);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [view, setView] = useState<"catalog" | "cart" | "checkout">("catalog");
  const [category, setCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderForm, setOrderForm] = useState({ name: "", phone: "", address: "" });

  // Load products
  useEffect(() => {
    fetch(`/api/miniapp/${botId}/products`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [botId]);

  // Telegram WebApp theme
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))] as string[];

  const filtered = category
    ? products.filter((p) => p.category === category && p.inStock)
    : products.filter((p) => p.inStock);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, qty: number) => {
    if (qty <= 0) return removeFromCart(productId);
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: qty } : item
      )
    );
  };

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleOrder = async () => {
    if (!orderForm.name || !orderForm.phone) return;

    const tg = (window as any).Telegram?.WebApp;
    const orderData = {
      botId,
      items: cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      })),
      total,
      customerName: orderForm.name,
      customerPhone: orderForm.phone,
      deliveryAddress: orderForm.address,
    };

    if (tg) {
      tg.sendData(JSON.stringify(orderData));
    } else {
      // Fallback: send via API
      await fetch(`/api/miniapp/${botId}/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      alert("Заказ отправлен!");
    }
  };

  const tgBg = "var(--tg-theme-bg-color, #fff)";
  const tgText = "var(--tg-theme-text-color, #1a1a1a)";
  const tgHint = "var(--tg-theme-hint-color, #999)";
  const tgButton = "var(--tg-theme-button-color, #3B82F6)";
  const tgButtonText = "var(--tg-theme-button-text-color, #fff)";

  if (loading) {
    return (
      <div style={{ background: tgBg, color: tgText, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Загрузка...
      </div>
    );
  }

  return (
    <div style={{ background: tgBg, color: tgText, minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ position: "sticky", top: 0, background: tgBg, borderBottom: "1px solid #eee", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
          {view === "catalog" ? "Каталог" : view === "cart" ? "Корзина" : "Оформление"}
        </h1>
        {view === "catalog" && cartCount > 0 && (
          <button
            onClick={() => setView("cart")}
            style={{ background: tgButton, color: tgButtonText, border: "none", borderRadius: 20, padding: "8px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            Корзина ({cartCount})
          </button>
        )}
        {view !== "catalog" && (
          <button
            onClick={() => setView("catalog")}
            style={{ background: "transparent", color: tgButton, border: "none", fontSize: 14, cursor: "pointer" }}
          >
            Назад
          </button>
        )}
      </div>

      {view === "catalog" && (
        <div style={{ padding: "8px 16px 100px" }}>
          {/* Categories */}
          {categories.length > 1 && (
            <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "8px 0", marginBottom: 8 }}>
              <button
                onClick={() => setCategory(null)}
                style={{
                  padding: "6px 14px", borderRadius: 16, border: "1px solid #ddd", fontSize: 13, whiteSpace: "nowrap", cursor: "pointer",
                  background: !category ? tgButton : "transparent", color: !category ? tgButtonText : tgText,
                }}
              >
                Все
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  style={{
                    padding: "6px 14px", borderRadius: 16, border: "1px solid #ddd", fontSize: 13, whiteSpace: "nowrap", cursor: "pointer",
                    background: category === c ? tgButton : "transparent", color: category === c ? tgButtonText : tgText,
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {/* Products grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {filtered.map((p) => {
              const inCart = cart.find((item) => item.product.id === p.id);
              return (
                <div key={p.id} style={{ borderRadius: 12, border: "1px solid #eee", overflow: "hidden" }}>
                  {p.imageUrl && (
                    <div style={{ height: 120, background: "#f5f5f5", backgroundImage: `url(${p.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                  )}
                  <div style={{ padding: 10 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 4px" }}>{p.name}</p>
                    <p style={{ fontSize: 15, fontWeight: 700, color: tgButton, margin: "0 0 8px" }}>
                      {p.price.toLocaleString("ru-RU")} {p.currency}
                    </p>
                    {inCart ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button onClick={() => updateQuantity(p.id, inCart.quantity - 1)} style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid #ddd", background: "transparent", fontSize: 16, cursor: "pointer", color: tgText }}>-</button>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{inCart.quantity}</span>
                        <button onClick={() => updateQuantity(p.id, inCart.quantity + 1)} style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: tgButton, color: tgButtonText, fontSize: 16, cursor: "pointer" }}>+</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(p)}
                        style={{ width: "100%", padding: "6px", borderRadius: 8, border: "1px solid #ddd", background: "transparent", fontSize: 13, cursor: "pointer", color: tgText }}
                      >
                        + В корзину
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === "cart" && (
        <div style={{ padding: "16px 16px 100px" }}>
          {cart.length === 0 ? (
            <p style={{ textAlign: "center", color: tgHint, marginTop: 40 }}>Корзина пуста</p>
          ) : (
            <>
              {cart.map((item) => (
                <div key={item.product.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #eee" }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{item.product.name}</p>
                    <p style={{ fontSize: 13, color: tgHint, margin: "2px 0 0" }}>
                      {item.product.price.toLocaleString("ru-RU")} x {item.quantity}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>
                      {(item.product.price * item.quantity).toLocaleString("ru-RU")}
                    </span>
                    <button onClick={() => removeFromCart(item.product.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 18 }}>x</button>
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", fontWeight: 700, fontSize: 16 }}>
                <span>Итого:</span>
                <span>{total.toLocaleString("ru-RU")} UZS</span>
              </div>
              <button
                onClick={() => setView("checkout")}
                style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: tgButton, color: tgButtonText, fontSize: 16, fontWeight: 600, cursor: "pointer" }}
              >
                Оформить заказ
              </button>
            </>
          )}
        </div>
      )}

      {view === "checkout" && (
        <div style={{ padding: "16px 16px 100px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              placeholder="Ваше имя"
              value={orderForm.name}
              onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })}
              style={{ padding: 12, borderRadius: 10, border: "1px solid #ddd", fontSize: 14, background: tgBg, color: tgText }}
            />
            <input
              placeholder="+998 __ ___ __ __"
              value={orderForm.phone}
              onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
              style={{ padding: 12, borderRadius: 10, border: "1px solid #ddd", fontSize: 14, background: tgBg, color: tgText }}
            />
            <input
              placeholder="Адрес доставки"
              value={orderForm.address}
              onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })}
              style={{ padding: 12, borderRadius: 10, border: "1px solid #ddd", fontSize: 14, background: tgBg, color: tgText }}
            />
          </div>
          <div style={{ marginTop: 16, padding: "12px 0", borderTop: "1px solid #eee" }}>
            <p style={{ fontSize: 14, color: tgHint }}>
              {cart.length} товаров на сумму <strong>{total.toLocaleString("ru-RU")} UZS</strong>
            </p>
          </div>
          <button
            onClick={handleOrder}
            disabled={!orderForm.name || !orderForm.phone}
            style={{
              width: "100%", padding: 14, borderRadius: 12, border: "none", fontSize: 16, fontWeight: 600, cursor: "pointer", marginTop: 8,
              background: orderForm.name && orderForm.phone ? tgButton : "#ccc",
              color: tgButtonText,
            }}
          >
            Заказать ({total.toLocaleString("ru-RU")} UZS)
          </button>
        </div>
      )}
    </div>
  );
}
