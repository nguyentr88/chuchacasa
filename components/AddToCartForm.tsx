"use client";

import { ShoppingBag, CreditCard } from "lucide-react";
import { useCart } from "./providers/CartContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types/product";

interface AddToCartFormProps {
  product: Product;
}

export function AddToCartForm({ product }: AddToCartFormProps) {
  const { addItem } = useCart();
  const router = useRouter();

  // Mặc định chọn màu/size đầu tiên nếu có
  const [selectedColor, setSelectedColor] = useState<string>(product.colors?.[0] || "");
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || "");

  const finalPrice = product.hasDiscount && product.discountPrice 
    ? product.discountPrice 
    : product.price;

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${selectedColor}-${selectedSize}`,
      productId: product.id,
      name: product.name,
      price: finalPrice,
      image: product.images[0] || "/globe.svg",
      color: selectedColor || undefined,
      size: selectedSize || undefined,
      quantity: 1,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  return (
    <div className="space-y-6">
      {/* Lựa chọn màu sắc */}
      {product.colors.length > 0 && (
        <div>
          <h4 className="font-heading text-lg mb-2 opacity-80 flex items-center gap-1.5">
            Màu sắc
          </h4>
          <div className="flex flex-wrap gap-2">
            {product.colors.map(color => (
              <button 
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`px-4 py-2 border-2 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                  selectedColor === color 
                    ? "bg-accent-red text-white border-accent-red" 
                    : "bg-white/60 text-primary-brown border-primary-brown/10 hover:border-accent-red/50"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lựa chọn kích thước */}
      {product.sizes.length > 0 && (
        <div>
          <h4 className="font-heading text-lg mb-2 opacity-80 flex items-center gap-1.5">
            Kích thước
          </h4>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map(size => (
              <button 
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 border rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                  selectedSize === size 
                    ? "bg-accent-red text-white border-accent-red" 
                    : "bg-secondary-pink/20 text-accent-red border-secondary-pink/30 hover:border-accent-red/50"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Nút hành động */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <button 
          onClick={handleAddToCart}
          className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-white border-4 border-accent-red text-accent-red hover:bg-accent-red hover:text-white font-bold rounded-full text-base hover:shadow-lg transition-all active:scale-95 cursor-pointer duration-300"
        >
          <ShoppingBag size={20} />
          Thêm vào giỏ hàng
        </button>
        <button 
          onClick={handleBuyNow}
          className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-accent-red text-white font-bold rounded-full text-base hover:shadow-xl hover:scale-105 transition-all shadow-md active:scale-95 cursor-pointer duration-300"
        >
          <CreditCard size={20} />
          Mua ngay lập tức
        </button>
      </div>
    </div>
  );
}
