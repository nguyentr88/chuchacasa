"use client";

import { useCart } from "./providers/CartContext";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, cartTotal } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Overlay */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-primary-brown/10 bg-secondary-pink/10">
          <h2 className="font-heading text-2xl text-primary-brown flex items-center gap-2">
            <ShoppingBag className="text-accent-red" />
            Giỏ hàng của bạn
          </h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-white rounded-full transition-colors cursor-pointer text-primary-brown"
          >
            <X size={24} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-primary-brown/50 space-y-4">
              <ShoppingBag size={48} className="opacity-20" />
              <p className="font-bold text-center">Giỏ hàng của bạn đang trống</p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="px-6 py-2 bg-accent-red text-white font-bold rounded-full text-sm hover:bg-accent-red/90 transition-colors"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 bg-white border-2 border-primary-brown/5 rounded-2xl hover:border-secondary-pink transition-colors">
                {/* Image */}
                <div className="w-20 h-20 relative bg-secondary-pink/20 rounded-xl overflow-hidden flex-shrink-0 border border-primary-brown/5">
                  <Image 
                    src={item.image || "/logo/logo-icon.png"} 
                    alt={item.name} 
                    fill 
                    className="object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-1">
                    <Link href={`/products/${item.productId}`} onClick={() => setIsCartOpen(false)}>
                      <h3 className="font-bold text-sm text-primary-brown line-clamp-2 hover:text-accent-red transition-colors">{item.name}</h3>
                    </Link>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-primary-brown/40 hover:text-red-500 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Attributes */}
                  {(item.color || item.size) && (
                    <div className="text-xs text-primary-brown/60 mb-2 flex gap-2 font-medium">
                      {item.color && <span>Màu: {item.color}</span>}
                      {item.color && item.size && <span>|</span>}
                      {item.size && <span>Size: {item.size}</span>}
                    </div>
                  )}

                  {/* Price & Quantity */}
                  <div className="mt-auto flex items-center justify-between">
                    <span className="font-bold text-accent-red text-sm">
                      {item.price.toLocaleString("vi-VN")}đ
                    </span>
                    
                    <div className="flex items-center gap-3 bg-primary-brown/5 rounded-full px-2 py-1">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white text-primary-brown font-bold transition-colors cursor-pointer"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-xs font-bold w-4 text-center select-none">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white text-primary-brown font-bold transition-colors cursor-pointer"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 bg-white border-t border-primary-brown/10 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-primary-brown">Tổng cộng:</span>
              <span className="font-heading text-2xl text-accent-red">
                {cartTotal.toLocaleString("vi-VN")}đ
              </span>
            </div>
            
            <Link 
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="block w-full py-4 bg-accent-red text-white text-center font-bold rounded-full text-lg shadow-[0_5px_0_rgb(130,46,38)] hover:shadow-[0_2px_0_rgb(130,46,38)] hover:translate-y-[3px] active:shadow-none active:translate-y-[5px] transition-all"
            >
              Tiến hành thanh toán
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
