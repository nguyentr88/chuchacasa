"use client";

import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { Product } from "@/types/product";
import { useCart } from "./providers/CartContext";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [selectedColor, setSelectedColor] = useState<string>(product.colors?.[0] || "");
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || "");

  const productPrice = product.price;
  const discountPrice = product.discountPrice;
  const hasDiscount = product.hasDiscount;
  const displayImage = product.images[0] || "/logo/chucha-avatar.jpg";

  const finalPrice = hasDiscount && discountPrice ? discountPrice : productPrice;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      id: `${product.id}-${selectedColor}-${selectedSize}`,
      productId: product.id,
      name: product.name,
      price: finalPrice,
      image: displayImage,
      color: selectedColor || undefined,
      size: selectedSize || undefined,
      quantity: 1
    });
  };

  const handleCardClick = () => {
    router.push(`/products/${product.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group flex flex-col bg-white border-2 border-primary-brown/5 rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 relative cursor-pointer"
    >
      {/* SALE tag */}
      {hasDiscount && (
        <div className="absolute top-4 left-4 z-20 bg-accent-red text-white text-[9px] font-extrabold px-3 py-1.5 rounded-full shadow-md tracking-wider uppercase animate-pulse">
          SALE ✨
        </div>
      )}

      {/* Khu vực ảnh */}
      <div className="aspect-[4/5] relative bg-secondary-pink/15 overflow-hidden">
        <Image
          src={displayImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-700 ease-out"
        />

        {/* ===== HOVER OVERLAY ===== */}
        <div
          className="absolute inset-0 z-10 flex flex-col justify-between pointer-events-none group-hover:pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* --- Chips màu sắc / kích thước bay xuống từ trên --- */}
          <div className="p-3 flex flex-wrap gap-1.5 opacity-0 -translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400 ease-out delay-75">
            {product.colors.length > 0 && product.colors.map(c => (
              <button
                key={c}
                onClick={(e) => { e.stopPropagation(); setSelectedColor(c); }}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md backdrop-blur-md transition-all duration-200 border
                  ${selectedColor === c
                    ? "bg-accent-red text-white border-accent-red shadow-accent-red/30"
                    : "bg-white/90 text-primary-brown border-white/60 hover:bg-white hover:border-accent-red/40 hover:scale-105"
                  }`}
              >
                {c}
              </button>
            ))}
            {product.sizes.length > 0 && product.sizes.map(s => (
              <button
                key={s}
                onClick={(e) => { e.stopPropagation(); setSelectedSize(s); }}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md backdrop-blur-md transition-all duration-200 border
                  ${selectedSize === s
                    ? "bg-accent-red text-white border-accent-red shadow-accent-red/30"
                    : "bg-white/90 text-primary-brown border-white/60 hover:bg-white hover:border-accent-red/40 hover:scale-105"
                  }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* --- Tooltip tên sản phẩm (giữa ảnh, phía dưới) --- */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-400 delay-100">
            <span className="bg-primary-brown/75 text-white text-xs font-bold px-4 py-1.5 rounded-full backdrop-blur-sm whitespace-nowrap shadow-lg">
              {product.name}
            </span>
          </div>

          <div className="p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out delay-100">
            <button
              onClick={handleAddToCart}
              className="w-full py-3.5 bg-white/90 backdrop-blur-md text-primary-brown font-extrabold text-sm rounded-2xl shadow-lg
                hover:bg-accent-red hover:text-white hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] hover:border-accent-red
                transition-all duration-200 flex items-center justify-center gap-2.5 border-2 border-primary-brown/20"
            >
              <span className="tracking-wide">Thêm vô giỏ hàng</span>
              <ShoppingBag size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Thông tin sản phẩm */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-heading text-base mb-1 text-primary-brown group-hover:text-accent-red transition-colors duration-300 line-clamp-2 leading-snug">
          {product.name}
        </h3>

        <div className="mt-auto pt-1">
          {hasDiscount ? (
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-extrabold text-accent-red text-base">
                {discountPrice?.toLocaleString("vi-VN")}VNĐ
              </span>
              <span className="text-xs line-through opacity-40 font-semibold">
                {productPrice.toLocaleString("vi-VN")}đ
              </span>
            </div>
          ) : (
            <p className="font-extrabold text-primary-brown text-base">
              {productPrice.toLocaleString("vi-VN")}VNĐ
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
