"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
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
      className="group flex flex-col bg-white/40 border-2 border-primary-brown/5 rounded-[2.5rem] overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 relative cursor-pointer"
    >
      {/* SALE tag */}
      {hasDiscount && (
        <div className="absolute top-4 left-4 z-10 bg-accent-red text-white text-[9px] font-extrabold px-3 py-1.5 rounded-full shadow-md tracking-wider uppercase animate-pulse">
          SALE ✨
        </div>
      )}

      {/* Ảnh sản phẩm */}
      <div className="aspect-[4/5] relative bg-secondary-pink/20 overflow-hidden flex items-center justify-center">
        <Image
          src={displayImage}
          alt={product.name}
          fill
          className="object-contain p-8 group-hover:scale-105 transition-transform duration-500"
        />

        {/* Quick Add Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end p-6" onClick={(e) => e.stopPropagation()}>
          <div className="w-full bg-white rounded-2xl p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-xl" onClick={(e) => e.stopPropagation()}>
            {/* Thuộc tính */}
            {(product.colors.length > 0 || product.sizes.length > 0) && (
              <div className="space-y-3 mb-4">
                {product.colors.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-primary-brown/50 uppercase block mb-1">Màu sắc</span>
                    <div className="flex flex-wrap gap-1">
                      {product.colors.map(c => (
                        <button
                          key={c}
                          onClick={() => setSelectedColor(c)}
                          className={`text-xs px-2 py-1 rounded-md border transition-colors ${selectedColor === c ? "bg-accent-red text-white border-accent-red" : "bg-white text-primary-brown border-primary-brown/20 hover:border-accent-red/50"
                            }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {product.sizes.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-primary-brown/50 uppercase block mb-1">Kích thước</span>
                    <div className="flex flex-wrap gap-1">
                      {product.sizes.map(s => (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(s)}
                          className={`text-xs px-2 py-1 rounded-md border transition-colors ${selectedSize === s ? "bg-accent-red text-white border-accent-red" : "bg-white text-primary-brown border-primary-brown/20 hover:border-accent-red/50"
                            }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleAddToCart}
              className="w-full py-2 bg-accent-red text-white font-bold text-sm rounded-xl hover:bg-accent-red/90 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart size={16} />
              Thêm nhanh
            </button>
          </div>
        </div>
      </div>

      {/* Thông tin sản phẩm */}
      <div className="p-6 border-t-2 border-primary-brown/5 flex flex-col flex-1">
        <h3 className="font-heading text-lg mb-1.5 text-primary-brown group-hover:text-accent-red transition-colors line-clamp-2">
          {product.name}
        </h3>

        <div className="mt-auto">
          {hasDiscount ? (
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-bold text-accent-red text-base">
                {discountPrice?.toLocaleString("vi-VN")} VNĐ
              </span>
              <span className="text-xs line-through opacity-50 font-medium">
                {productPrice.toLocaleString("vi-VN")} VNĐ
              </span>
            </div>
          ) : (
            <p className="font-bold text-accent-red text-base">
              {productPrice.toLocaleString("vi-VN")} VNĐ
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
