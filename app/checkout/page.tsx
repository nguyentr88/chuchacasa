"use client";

import { useCart } from "@/components/providers/CartContext";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Loader2, CheckCircle2, UserCircle2 } from "lucide-react";
import { createOrderAction } from "@/app/actions/checkout";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    notes: ""
  });

  const [paymentMethod, setPaymentMethod] = useState<"COD" | "TRANSFER_PARTIAL" | "TRANSFER_FULL">("TRANSFER_PARTIAL");

  const shippingFee = items.length > 0 ? 30000 : 0; // Tạm tính 30k ship
  const totalAmount = cartTotal + shippingFee;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError("Giỏ hàng của bạn đang trống.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const res = await createOrderAction({
      customerName: formData.name,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      shippingAddress: formData.address,
      shippingCity: formData.city,
      shippingDistrict: formData.district,
      shippingWard: formData.ward,
      shippingNotes: formData.notes,
      paymentMethod: paymentMethod as any,
      items: items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        color: item.color,
        size: item.size
      })),
      subtotal: cartTotal,
      shippingFee,
      totalAmount
    });

    if (res.success) {
      setSuccess(true);
      clearCart();
    } else {
      setError(res.error || "Có lỗi xảy ra, vui lòng thử lại.");
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-6 text-primary-brown">
        <div className="bg-white p-10 rounded-3xl max-w-lg w-full text-center shadow-xl border border-primary-brown/10">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-heading mb-4 text-primary-brown">Đặt hàng thành công!</h2>
          <p className="text-primary-brown/70 mb-8 leading-relaxed">
            Cảm ơn bạn đã yêu thương những món đồ thủ công của Chu Cha. Đơn hàng của bạn đang được xử lý, chúng mình sẽ sớm liên hệ lại!
          </p>
          <Link href="/products" className="inline-block px-8 py-4 bg-accent-red text-white font-bold rounded-full hover:bg-accent-red/90 transition-colors">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] font-body text-primary-brown pb-20">
      <div className="max-w-6xl mx-auto px-6 pt-10">
        
        {/* Header Logo */}
        <div className="flex justify-center mb-10">
          <Link href="/">
            <Image src="/logo/logo-main.png" alt="ChuCha Casa" width={180} height={80} className="object-contain" />
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* CỘT TRÁI: FORM */}
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-10">
              
              {/* Thông tin mua hàng */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-heading text-primary-brown font-bold">Thông tin mua hàng</h2>
                </div>
                
                <div className="space-y-3">
                  <input required name="email" value={formData.email} onChange={handleChange} type="email" placeholder="Email" className="w-full p-3.5 bg-white border border-primary-brown/20 rounded-md focus:border-accent-red outline-none text-sm transition-colors" />
                  <input required name="name" value={formData.name} onChange={handleChange} type="text" placeholder="Họ và tên" className="w-full p-3.5 bg-white border border-primary-brown/20 rounded-md focus:border-accent-red outline-none text-sm transition-colors" />
                  <input required name="phone" value={formData.phone} onChange={handleChange} type="tel" placeholder="Số điện thoại" className="w-full p-3.5 bg-white border border-primary-brown/20 rounded-md focus:border-accent-red outline-none text-sm transition-colors" />
                  <input required name="address" value={formData.address} onChange={handleChange} type="text" placeholder="Địa chỉ giao hàng" className="w-full p-3.5 bg-white border border-primary-brown/20 rounded-md focus:border-accent-red outline-none text-sm transition-colors" />
                  
                  <div className="grid grid-cols-3 gap-3">
                    <input name="city" value={formData.city} onChange={handleChange} type="text" placeholder="Tỉnh thành" className="w-full p-3.5 bg-white border border-primary-brown/20 rounded-md focus:border-accent-red outline-none text-sm transition-colors" />
                    <input name="district" value={formData.district} onChange={handleChange} type="text" placeholder="Quận huyện" className="w-full p-3.5 bg-white border border-primary-brown/20 rounded-md focus:border-accent-red outline-none text-sm transition-colors" />
                    <input name="ward" value={formData.ward} onChange={handleChange} type="text" placeholder="Phường xã" className="w-full p-3.5 bg-white border border-primary-brown/20 rounded-md focus:border-accent-red outline-none text-sm transition-colors" />
                  </div>
                  
                  <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Ghi chú thêm (INSTAGRAM CỦA BẠN LÀ...)" rows={3} className="w-full p-3.5 bg-white border border-primary-brown/20 rounded-md focus:border-accent-red outline-none text-sm transition-colors resize-none mt-4"></textarea>
                </div>
              </section>

              {/* Vận chuyển */}
              <section>
                <h2 className="text-xl font-heading text-primary-brown font-bold mb-4">Vận chuyển</h2>
                <div className="w-full p-4 bg-sky-50 border border-sky-100 rounded-md text-sm text-sky-800">
                  Phí giao hàng toàn quốc: 30.000 VNĐ
                </div>
              </section>

              {/* Thanh toán */}
              <section>
                <h2 className="text-xl font-heading text-primary-brown font-bold mb-4">Thanh toán</h2>
                
                <div className="border border-primary-brown/20 rounded-md overflow-hidden bg-white">
                  
                  {/* Option 1: Cọc 50k */}
                  <label className="flex items-center gap-3 p-4 border-b border-primary-brown/10 cursor-pointer hover:bg-zinc-50 transition-colors">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "TRANSFER_PARTIAL" ? "border-accent-red" : "border-primary-brown/30"}`}>
                      <div className={`w-2.5 h-2.5 rounded-full bg-accent-red transition-all ${paymentMethod === "TRANSFER_PARTIAL" ? "scale-100" : "scale-0"}`} />
                    </div>
                    <input type="radio" className="hidden" checked={paymentMethod === "TRANSFER_PARTIAL"} onChange={() => setPaymentMethod("TRANSFER_PARTIAL")} />
                    <span className="text-sm font-medium flex-1">Cọc 50k, nhắn mã đơn/sđt qua IG</span>
                  </label>

                  {/* Option 2: Full Transfer */}
                  <label className="flex items-center gap-3 p-4 cursor-pointer hover:bg-zinc-50 transition-colors border-b border-primary-brown/10">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "TRANSFER_FULL" ? "border-accent-red" : "border-primary-brown/30"}`}>
                      <div className={`w-2.5 h-2.5 rounded-full bg-accent-red transition-all ${paymentMethod === "TRANSFER_FULL" ? "scale-100" : "scale-0"}`} />
                    </div>
                    <input type="radio" className="hidden" checked={paymentMethod === "TRANSFER_FULL"} onChange={() => setPaymentMethod("TRANSFER_FULL")} />
                    <span className="text-sm font-medium flex-1">Chuyển khoản toàn bộ</span>
                  </label>
                  
                  {/* Option 3: COD (Tạm ẩn vì chưa hỗ trợ) */}
                  {/*
                  <label className="flex items-center gap-3 p-4 cursor-pointer hover:bg-zinc-50 transition-colors">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "COD" ? "border-accent-red" : "border-primary-brown/30"}`}>
                      <div className={`w-2.5 h-2.5 rounded-full bg-accent-red transition-all ${paymentMethod === "COD" ? "scale-100" : "scale-0"}`} />
                    </div>
                    <input type="radio" className="hidden" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} />
                    <span className="text-sm font-medium flex-1">Thanh toán khi nhận hàng (COD)</span>
                  </label>
                  */}
                </div>

                {/* Khu vực hướng dẫn chuyển khoản nếu chọn Cọc hoặc Full */}
                {(paymentMethod === "TRANSFER_PARTIAL" || paymentMethod === "TRANSFER_FULL") && (
                  <div className="mt-4 p-6 bg-zinc-50 border border-primary-brown/10 rounded-md animate-in fade-in slide-in-from-top-2">
                    <p className="text-sm mb-4 text-center">
                      Quý khách vui lòng quét mã QR dưới đây và chuyển khoản số tiền: <br/>
                      <span className="font-bold text-accent-red text-xl mt-2 block">
                        {paymentMethod === "TRANSFER_PARTIAL" ? "50.000 VNĐ" : `${totalAmount.toLocaleString("vi-VN")} VNĐ`}
                      </span>
                    </p>
                    
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-72 h-72 md:w-80 md:h-80 relative rounded-xl overflow-hidden border border-primary-brown/10 bg-white">
                        <Image src="/logo/qr-payment.jpeg" alt="QR Payment" fill className="object-contain" />
                      </div>
                      <p className="text-xs text-primary-brown/60 text-center bg-white px-4 py-2 rounded-lg border border-primary-brown/5 shadow-sm">
                        Nội dung chuyển khoản: <br/> 
                        <strong className="text-accent-red text-sm mt-1 block">[Tên của bạn] - [SĐT]</strong>
                      </p>
                    </div>
                  </div>
                )}
              </section>
              
              {/* Nút đặt hàng trên Mobile (thường nằm ở cột trái hoặc cuối cùng) */}
              <div className="lg:hidden mt-10 space-y-4">
                {error && <div className="p-3 bg-red-50 text-red-500 rounded-md text-sm font-bold text-center animate-shake">{error}</div>}
                <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-accent-red text-white font-bold rounded-md text-lg hover:bg-accent-red/90 transition-colors flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "ĐẶT HÀNG"}
                </button>
                <Link href="/products" className="flex items-center justify-center gap-1 text-sm text-accent-red hover:underline mt-4">
                  <ChevronLeft size={16} /> Quay về giỏ hàng
                </Link>
              </div>
            </form>
          </div>

          {/* CỘT PHẢI: GIỎ HÀNG */}
          <div className="w-full lg:w-[450px]">
            <div className="sticky top-8 bg-white/40 p-6 rounded-xl border border-primary-brown/10">
              <h2 className="text-xl font-heading text-primary-brown font-bold mb-6">
                Đơn hàng ({items.length} sản phẩm)
              </h2>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 pt-2 custom-scrollbar mb-6">
                {items.length === 0 ? (
                  <p className="text-sm text-primary-brown/50 italic">Chưa có sản phẩm nào.</p>
                ) : (
                  items.map(item => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <div className="w-16 h-16 relative bg-secondary-pink/20 rounded-lg border border-primary-brown/10 shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover rounded-lg" />
                        <span className="absolute -top-2 -right-2 bg-primary-brown/80 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-primary-brown truncate">{item.name}</h4>
                        <p className="text-xs text-primary-brown/60">
                          {item.color} {item.color && item.size && '/'} {item.size}
                        </p>
                      </div>
                      <span className="text-sm font-medium whitespace-nowrap">
                        {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-b border-primary-brown/10 py-4 mb-4 flex gap-3">
                <input type="text" placeholder="Nhập mã giảm giá" className="flex-1 px-4 py-2 bg-white border border-primary-brown/20 rounded-md text-sm outline-none focus:border-accent-red transition-colors" />
                <button className="px-6 py-2 bg-secondary-pink/50 hover:bg-secondary-pink/80 text-primary-brown font-bold text-sm rounded-md transition-colors">
                  Áp dụng
                </button>
              </div>

              <div className="space-y-2 mb-4 text-sm font-medium">
                <div className="flex justify-between">
                  <span className="text-primary-brown/70">Tạm tính</span>
                  <span>{cartTotal.toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-brown/70">Phí vận chuyển</span>
                  <span>{shippingFee.toLocaleString("vi-VN")}đ</span>
                </div>
              </div>

              <div className="border-t border-primary-brown/10 pt-4 mb-8 flex justify-between items-center">
                <span className="text-lg text-primary-brown/70 font-medium">Tổng cộng</span>
                <span className="text-2xl font-bold text-accent-red">{totalAmount.toLocaleString("vi-VN")}đ</span>
              </div>

              <div className="hidden lg:block">
                {error && <div className="p-3 mb-4 bg-red-50 text-red-500 rounded-md text-sm font-bold text-center animate-shake">{error}</div>}
                
                <div className="flex items-center justify-between">
                  <Link href="/products" className="flex items-center gap-1 text-sm text-accent-red hover:underline">
                    <ChevronLeft size={16} /> Quay về giỏ hàng
                  </Link>
                  <button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting || items.length === 0} 
                    className="px-10 py-3 bg-secondary-pink/80 hover:bg-secondary-pink text-primary-brown font-bold rounded-md text-base transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting && <Loader2 className="animate-spin" size={16} />}
                    ĐẶT HÀNG
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
        
        <p className="text-center text-xs opacity-60 mt-20 pb-10">
          Cảm ơn bánh iu đã đặt hàng tại website của CKSC nhe ~ Cho CKSC cắn iu mụt mím nha!
        </p>
      </div>
    </div>
  );
}
