"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@/lib/generated/prisma";
import { auth } from "@/auth";

// Middleware để check quyền Admin trong action
async function checkAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function getAdminOrdersAction() {
  try {
    await checkAdmin();
    
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        items: true,
      },
    });

    return { success: true, data: orders };
  } catch (error: any) {
    console.error("Error fetching admin orders:", error);
    return { success: false, error: error.message || "Không thể tải danh sách đơn hàng" };
  }
}

export async function updateOrderStatusAction(orderId: string, newStatus: OrderStatus) {
  try {
    await checkAdmin();

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    revalidatePath("/admin/orders");
    
    return { success: true, data: order };
  } catch (error: any) {
    console.error("Error updating order status:", error);
    return { success: false, error: error.message || "Không thể cập nhật trạng thái đơn hàng" };
  }
}
