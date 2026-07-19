"use client";

import { useState } from "react";
import { OrderStatus } from "@/lib/generated/prisma";
import { updateOrderStatusAction } from "@/app/actions/admin-orders";
import { Loader2, CheckCircle2, Search, X } from "lucide-react";
import Image from "next/image";

type OrderWithItems = any; // Simplifying type for client

export default function OrdersClient({ initialOrders }: { initialOrders: OrderWithItems[] }) {
  const [orders, setOrders] = useState<OrderWithItems[]>(initialOrders);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "PENDING": return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">Chờ xử lý</span>;
      case "PROCESSING": return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">Đang xử lý</span>;
      case "SHIPPED": return <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">Đang giao</span>;
      case "COMPLETED": return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Hoàn thành</span>;
      case "CANCELLED": return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">Đã hủy</span>;
      default: return null;
    }
  };

  const statusOptions: { value: OrderStatus, label: string }[] = [
    { value: "PENDING", label: "Chờ xử lý" },
    { value: "PROCESSING", label: "Đang xử lý" },
    { value: "SHIPPED", label: "Đang giao" },
    { value: "COMPLETED", label: "Hoàn thành" },
    { value: "CANCELLED", label: "Hủy đơn" },
  ];

  const handleOpenModal = (order: OrderWithItems, status: OrderStatus) => {
    if (order.status === status) return;
    setSelectedOrder(order);
    setNewStatus(status);
    setIsModalOpen(true);
  };

  const handleConfirmUpdate = async () => {
    if (!selectedOrder || !newStatus) return;
    
    setIsUpdating(true);
    const res = await updateOrderStatusAction(selectedOrder.id, newStatus);
    setIsUpdating(false);

    if (res.success) {
      // Update local state
      setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, status: newStatus } : o));
      setIsModalOpen(false);
    } else {
      alert(res.error || "Có lỗi xảy ra khi cập nhật!");
    }
  };

  const filteredOrders = statusFilter === "ALL" ? orders : orders.filter(o => o.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 p-6 rounded-[2rem] border-2 border-primary-brown/5 backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-heading text-primary-brown">Quản lý Đơn hàng</h1>
          <p className="text-primary-brown/70 mt-1">Quản lý và cập nhật trạng thái đơn hàng của khách.</p>
        </div>
        
        {/* Lọc trạng thái */}
        <div className="flex bg-white rounded-full border border-primary-brown/10 p-1 shadow-sm overflow-x-auto max-w-full">
          <button 
            onClick={() => setStatusFilter("ALL")}
            className={`px-4 py-2 text-sm font-bold rounded-full whitespace-nowrap transition-colors ${statusFilter === "ALL" ? "bg-primary-brown text-white" : "text-primary-brown/60 hover:text-primary-brown"}`}
          >
            Tất cả
          </button>
          {statusOptions.map(opt => (
            <button 
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-4 py-2 text-sm font-bold rounded-full whitespace-nowrap transition-colors ${statusFilter === opt.value ? "bg-primary-brown text-white" : "text-primary-brown/60 hover:text-primary-brown"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-white/40 border-2 border-primary-brown/5 rounded-[3rem]">
          <p className="text-primary-brown/60">Không tìm thấy đơn hàng nào.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div key={order.id} className="bg-white p-6 rounded-[2rem] border border-primary-brown/10 shadow-sm flex flex-col lg:flex-row gap-6 hover:shadow-md transition-shadow">
              
              {/* Cột thông tin khách */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-lg text-primary-brown">{order.orderNumber}</h3>
                  {getStatusBadge(order.status)}
                </div>
                
                <div className="text-sm text-primary-brown/80 space-y-1">
                  <p><strong className="text-primary-brown">Khách hàng:</strong> {order.customerName}</p>
                  <p><strong className="text-primary-brown">SĐT:</strong> {order.customerPhone}</p>
                  <p><strong className="text-primary-brown">Địa chỉ:</strong> {order.shippingAddress}, {order.shippingWard}, {order.shippingDistrict}, {order.shippingCity}</p>
                  {order.shippingNotes && (
                    <p className="p-2 bg-highlight-yellow/30 rounded-md border border-highlight-yellow mt-2 text-xs">
                      <strong className="text-primary-brown">Ghi chú:</strong> {order.shippingNotes}
                    </p>
                  )}
                </div>
              </div>

              {/* Cột sản phẩm */}
              <div className="flex-1 bg-zinc-50 rounded-2xl p-4 border border-primary-brown/5">
                <h4 className="font-bold text-sm text-primary-brown mb-3 border-b border-primary-brown/10 pb-2">Sản phẩm ({order.items.length})</h4>
                <div className="space-y-3 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex gap-3 items-center">
                      <div className="w-12 h-12 relative bg-white rounded-md border border-primary-brown/10 shrink-0">
                        <Image src={item.image || "/logo/chucha-avatar.jpg"} alt={item.productName} fill className="object-cover rounded-md" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-primary-brown truncate">{item.productName}</p>
                        <p className="text-xs text-primary-brown/60">{item.color} {item.color && item.size && '/'} {item.size} x {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-accent-red">{(item.price * item.quantity).toLocaleString("vi-VN")}đ</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cột Thanh toán & Hành động */}
              <div className="w-full lg:w-64 flex flex-col justify-between gap-4">
                <div className="bg-secondary-pink/10 rounded-2xl p-4 border border-secondary-pink/20">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-primary-brown/70">Tổng tiền:</span>
                    <span className="font-bold text-accent-red text-lg">{order.totalAmount.toLocaleString("vi-VN")}đ</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-primary-brown/70">Thanh toán:</span>
                    <span className="font-bold">{order.paymentMethod === "TRANSFER_PARTIAL" ? "Cọc 50k" : order.paymentMethod === "TRANSFER_FULL" ? "CK Toàn bộ" : "COD"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-primary-brown/60 uppercase tracking-wider text-center">Cập nhật trạng thái</p>
                  <select 
                    value={order.status}
                    onChange={(e) => handleOpenModal(order, e.target.value as OrderStatus)}
                    className="w-full p-2.5 bg-white border-2 border-primary-brown/10 rounded-xl text-sm font-bold text-primary-brown outline-none focus:border-accent-red cursor-pointer"
                  >
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {isModalOpen && selectedOrder && newStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-brown/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 text-primary-brown transition-colors"
            >
              <X size={16} />
            </button>
            
            <div className="w-16 h-16 bg-highlight-yellow/30 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            
            <h3 className="text-xl font-heading text-center text-primary-brown mb-2">Xác nhận cập nhật</h3>
            <p className="text-center text-primary-brown/70 text-sm mb-6 leading-relaxed">
              Bạn có chắc chắn muốn chuyển đơn hàng <strong className="text-primary-brown">{selectedOrder.orderNumber}</strong> sang trạng thái 
              <strong className="text-accent-red ml-1">{statusOptions.find(o => o.value === newStatus)?.label}</strong> không?
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-primary-brown font-bold rounded-xl text-sm transition-colors"
                disabled={isUpdating}
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleConfirmUpdate}
                disabled={isUpdating}
                className="flex-1 py-3 bg-accent-red hover:bg-accent-red/90 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
              >
                {isUpdating ? <Loader2 className="animate-spin" size={16} /> : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
