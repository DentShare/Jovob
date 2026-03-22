import ProductsGrid from "@/components/dashboard/ProductsGrid";

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Товары</h1>
        <p className="mt-1 text-sm text-gray-500">
          Управление каталогом товаров
        </p>
      </div>
      <ProductsGrid />
    </div>
  );
}
