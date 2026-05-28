"use server";

import { prisma } from "@/lib/prisma";
import { PaymentMethod, OrderStatus } from "@/lib/generated/prisma";

interface CheckoutData {
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity?: string;
  shippingDistrict?: string;
  shippingWard?: string;
  shippingNotes?: string;
  paymentMethod: PaymentMethod;
  paymentProof?: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    color?: string;
    size?: string;
  }[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
}

export async function createOrderAction(data: CheckoutData) {
  try {
    // Basic validation
    if (!data.customerName || !data.customerPhone || !data.shippingAddress) {
      return { success: false, error: "Vui lòng nhập đầy đủ thông tin giao hàng (Tên, SĐT, Địa chỉ)." };
    }
    
    if (data.items.length === 0) {
      return { success: false, error: "Giỏ hàng của bạn đang trống." };
    }

    if (
      (data.paymentMethod === PaymentMethod.TRANSFER_PARTIAL || data.paymentMethod === PaymentMethod.TRANSFER_FULL) 
      && !data.paymentProof
    ) {
      return { success: false, error: "Vui lòng tải lên ảnh chụp màn hình hóa đơn chuyển khoản." };
    }

    // Tạo mã đơn hàng random (Ví dụ: #CC-12345678)
    const orderNumber = `#CC-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        shippingAddress: data.shippingAddress,
        shippingCity: data.shippingCity,
        shippingDistrict: data.shippingDistrict,
        shippingWard: data.shippingWard,
        shippingNotes: data.shippingNotes,
        paymentMethod: data.paymentMethod,
        paymentProof: data.paymentProof,
        subtotal: data.subtotal,
        shippingFee: data.shippingFee,
        totalAmount: data.totalAmount,
        status: OrderStatus.PENDING,
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            productName: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            color: item.color,
            size: item.size
          }))
        }
      }
    });

    return { success: true, orderId: order.id, orderNumber: order.orderNumber };
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", error);
    return { success: false, error: "Đã có lỗi xảy ra, vui lòng thử lại sau." };
  }
}
