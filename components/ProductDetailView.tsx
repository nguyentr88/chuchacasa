"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, CreditCard, ChevronLeft, ChevronRight, Tag, ShieldCheck } from "lucide-react";
import { useCart } from "./providers/CartContext";
import { Product } from "@/types/product";

interface ProductDetailViewProps {
  product: Product;
}

const FALLBACK_IMAGE = "/logo/chucha-avatar.jpg";

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const { addItem } = useCart();
  const router = useRouter();

  const variants = useMemo(() => product.variants ?? [], [product.variants]);

  // Gộp ảnh chung của sản phẩm và ảnh riêng của từng biến thể (họa tiết) thành 1 thư viện ảnh duy nhất.
  // Nhờ vậy khách có thể xem được TẤT CẢ ảnh (kể cả ảnh riêng của từng phân loại) và lướt qua lại.
  const galleryImages = useMemo(() => {
    const list: string[] = [];
    for (const img of product.images) {
      if (img && !list.includes(img)) list.push(img);
    }
    for (const v of variants) {
      if (v.image && !list.includes(v.image)) list.push(v.image);
    }
    return list.length > 0 ? list : [FALLBACK_IMAGE];
  }, [product.images, variants]);

  // Map từ tên họa tiết (color) -> ảnh riêng của họa tiết đó (nếu có)
  const colorImageMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const v of variants) {
      if (v.color && v.image && !map.has(v.color)) {
        map.set(v.color, v.image);
      }
    }
    return map;
  }, [variants]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>(product.colors?.[0] || "");
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || "");

  // Khi chọn 1 họa tiết, tự động hiển thị ảnh tương ứng của họa tiết đó (nếu có)
  const handleSelectColor = (color: string) => {
    setSelectedColor(color);
    const img = colorImageMap.get(color);
    if (img) {
      const idx = galleryImages.indexOf(img);
      if (idx >= 0) setActiveIndex(idx);
    }
  };

  const goPrev = () =>
    setActiveIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length);
  const goNext = () =>
    setActiveIndex((i) => (i + 1) % galleryImages.length);

  const hasDiscount = product.hasDiscount;
  const originalPrice = product.price;
  const discountPrice = product.discountPrice;

  // Giá theo biến thể đang chọn (nếu biến thể có giá riêng thì ưu tiên)
  const selectedVariant = variants.find(
    (v) =>
      (v.color || "") === (selectedColor || "") &&
      (v.size || "") === (selectedSize || "")
  );
  const basePrice = hasDiscount && discountPrice ? discountPrice : originalPrice;
  const finalPrice = selectedVariant?.price ?? basePrice;

  const activeImage = galleryImages[activeIndex] || FALLBACK_IMAGE;

  const buildCartItem = () => {
    const image = colorImageMap.get(selectedColor) || activeImage || FALLBACK_IMAGE;
    return {
      id: `${product.id}-${selectedColor}-${selectedSize}`,
      productId: product.id,
      name: product.name,
      price: finalPrice,
      image,
      color: selectedColor || undefined,
      size: selectedSize || undefined,
      quantity: 1,
    };
  };

  const handleAddToCart = () => addItem(buildCartItem());
  const handleBuyNow = () => {
    addItem(buildCartItem());
    router.push("/checkout");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
      {/* Cột trái: Thư viện ảnh sản phẩm */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="aspect-square relative bg-white/60 backdrop-blur-md rounded-[3rem] border-4 border-secondary-pink/20 overflow-hidden shadow-sm flex items-center justify-center">
          {hasDiscount && (
            <div className="absolute top-6 left-6 z-20 bg-accent-red text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full shadow-md tracking-wider uppercase animate-pulse">
              SALE ✨
            </div>
          )}

          <Image
            key={activeImage}
            src={activeImage}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain p-12 transition-opacity duration-300"
            priority
          />

          {/* Nút chuyển ảnh trái / phải */}
          {galleryImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label="Ảnh trước"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-white/80 backdrop-blur border border-primary-brown/10 text-primary-brown shadow-md hover:bg-accent-red hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Ảnh sau"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-white/80 backdrop-blur border border-primary-brown/10 text-primary-brown shadow-md hover:bg-accent-red hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight size={22} />
              </button>

              {/* Chỉ số ảnh hiện tại */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-primary-brown/70 text-white text-[11px] font-bold tracking-wider">
                {activeIndex + 1} / {galleryImages.length}
              </div>
            </>
          )}
        </div>

        {/* Danh sách ảnh thu nhỏ (bấm để xem) */}
        {galleryImages.length > 1 && (
          <div className="flex gap-3 flex-wrap justify-center">
            {galleryImages.map((img, index) => (
              <button
                type="button"
                key={img}
                onClick={() => setActiveIndex(index)}
                aria-label={`Xem ảnh ${index + 1}`}
                className={`w-16 h-16 relative bg-white rounded-2xl border-2 overflow-hidden cursor-pointer shadow-sm hover:scale-105 transition-transform ${
                  index === activeIndex ? "border-accent-red" : "border-primary-brown/10"
                }`}
              >
                <Image
                  src={img}
                  alt={`${product.name} - ${index + 1}`}
                  fill
                  sizes="64px"
                  className="object-contain p-2"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Cột phải: Thông tin sản phẩm */}
      <div className="flex-1 flex flex-col">
        <div className="mb-8">
          {/* Phân loại và SKU */}
          <div className="flex items-center gap-2 mb-3">
            {product.category?.name && (
              <span className="px-3.5 py-1.5 bg-secondary-pink/30 text-accent-red text-[10px] font-extrabold tracking-widest rounded-full uppercase border border-secondary-pink/20">
                {product.category.name}
              </span>
            )}
            {product.sku && (
              <span className="text-xs font-bold text-primary-brown/40 font-mono">
                SKU: {product.sku}
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-heading mb-4 text-primary-brown">
            {product.name}
          </h1>

          {/* Giá & khuyến mãi */}
          <div className="mb-6 flex items-center gap-3 flex-wrap">
            {hasDiscount && discountPrice && !selectedVariant?.price ? (
              <>
                <p className="text-3xl font-bold text-accent-red">
                  {discountPrice.toLocaleString("vi-VN")} VNĐ
                </p>
                <p className="text-sm line-through opacity-50 font-bold mt-1">
                  {originalPrice.toLocaleString("vi-VN")} VNĐ
                </p>
                <span className="px-2 py-1 bg-highlight-yellow text-primary-brown text-[10px] font-extrabold rounded-md shadow-sm border border-highlight-yellow flex items-center gap-1">
                  <Tag size={10} className="text-accent-red" />
                  GIẢM GIÁ
                </span>
              </>
            ) : (
              <p className="text-3xl font-bold text-accent-red">
                {finalPrice.toLocaleString("vi-VN")} VNĐ
              </p>
            )}
          </div>

          {product.description && (
            <div className="space-y-6 text-base mb-2">
              <div>
                <h4 className="font-heading text-lg mb-2 opacity-80">Mô tả sản phẩm</h4>
                <div className="leading-relaxed opacity-95 text-primary-brown/85 whitespace-pre-line text-sm bg-white/30 backdrop-blur-sm p-6 border border-primary-brown/5 rounded-[2rem]">
                  {product.description}
                </div>
              </div>
            </div>
          )}

          {/* Lựa chọn họa tiết / màu sắc & kích thước */}
          <div className="space-y-6 mt-6">
            {product.colors.length > 0 && (
              <div>
                <h4 className="font-heading text-lg mb-2 opacity-80 flex items-center gap-1.5">
                  Họa tiết / Màu sắc
                </h4>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleSelectColor(color)}
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

            {product.sizes.length > 0 && (
              <div>
                <h4 className="font-heading text-lg mb-2 opacity-80 flex items-center gap-1.5">
                  Kích thước
                </h4>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
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
                type="button"
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-white border-4 border-accent-red text-accent-red hover:bg-accent-red hover:text-white font-bold rounded-full text-base hover:shadow-lg transition-all active:scale-95 cursor-pointer duration-300"
              >
                <ShoppingBag size={20} />
                Thêm vào giỏ hàng
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-accent-red text-white font-bold rounded-full text-base hover:shadow-xl hover:scale-105 transition-all shadow-md active:scale-95 cursor-pointer duration-300"
              >
                <CreditCard size={20} />
                Mua ngay lập tức
              </button>
            </div>
          </div>
        </div>

        {/* Ghi chú thương hiệu */}
        <div className="mt-4 p-6 bg-highlight-yellow/30 rounded-[2rem] border-2 border-highlight-yellow/50 shadow-sm">
          <h4 className="font-heading text-base mb-2 italic flex items-center gap-1.5 text-primary-brown">
            <ShieldCheck size={16} className="text-accent-red" />
            Ghi chú từ Chu Cha:
          </h4>
          <p className="text-xs opacity-80 italic leading-relaxed text-primary-brown/90">
            Sản phẩm tại chucha.casa được làm thủ công bằng cả trái tim, do đó mỗi chiếc sẽ có một chút khác biệt nhỏ độc nhất vô nhị. Cảm ơn bạn đã yêu thương những điều độc bản! ✨
          </p>
        </div>
      </div>
    </div>
  );
}
