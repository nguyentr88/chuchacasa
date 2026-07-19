import { getAdminOrdersAction } from "@/app/actions/admin-orders";
import OrdersClient from "./OrdersClient";

export const revalidate = 0; // Luôn làm mới dữ liệu khi tải trang

export default async function AdminOrdersPage() {
  const res = await getAdminOrdersAction();
  
  if (!res.success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-red-500 font-bold mb-2">Lỗi: {res.error}</p>
        <p className="text-primary-brown/60">Vui lòng thử lại sau.</p>
      </div>
    );
  }

  const orders = res.data || [];

  return <OrdersClient initialOrders={orders} />;
}
