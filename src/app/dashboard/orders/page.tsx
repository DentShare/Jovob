import OrdersTable from "@/components/dashboard/OrdersTable";

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Заказы</h1>
        <p className="mt-1 text-sm text-gray-500">
          Управление заказами от клиентов
        </p>
      </div>
      <OrdersTable />
    </div>
  );
}
