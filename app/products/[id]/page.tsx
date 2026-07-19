import Image from "next/image";
import { ChevronLeft, ShoppingBag, CreditCard, Sparkles, Tag, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AddToCartForm } from "@/components/AddToCartForm";

// Tắt hoàn toàn cache tĩnh để trang chi tiết luôn cập nhật dữ liệu mới nhất
export const revalidate = 0;

import { Metadata } from "next";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    return {
      title: "Không tìm thấy sản phẩm | chucha.casa",
    };
  }

  const priceFormatted = (product.hasDiscount && product.discountPrice ? product.discountPrice : product.price).toLocaleString("vi-VN");

  return {
    title: product.name,
    description: product.description || `Mua ${product.name} chính hãng tại chucha.casa với giá chỉ ${priceFormatted}đ`,
    openGraph: {
      title: `${product.name} | chucha.casa`,
      description: product.description || `Mua ${product.name} chính hãng tại chucha.casa với giá chỉ ${priceFormatted}đ`,
      images: product.images.length > 0 ? [{ url: product.images[0] }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description || `Mua ${product.name} chính hãng tại chucha.casa với giá chỉ ${priceFormatted}đ`,
      images: product.images.length > 0 ? [product.images[0]] : [],
    },
  };
}

export default async function ProductDetail({ params }: PageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  // Lấy chi tiết sản phẩm và các thực thể liên quan từ PostgreSQL
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      variants: true,
    },
  });

  // Nếu không tìm thấy sản phẩm, tự động trả về trang 404 chuẩn của Next.js
  if (!product) {
    notFound();
  }

  const hasDiscount = product.hasDiscount;
  const originalPrice = product.price;
  const discountPrice = product.discountPrice;
  const primaryImage = product.images[0] || "/logo/chucha-avatar.jpg";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.sku || product.id,
    offers: {
      "@type": "Offer",
      url: `https://chucha-casa.vercel.app/products/${product.id}`,
      priceCurrency: "VND",
      price: hasDiscount && discountPrice ? discountPrice : originalPrice,
      itemCondition: "https://schema.org/NewCondition",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Chu Cha Casa",
      },
    },
  };

  return (
    <div className="min-h-screen bg-background text-primary-brown pb-20 relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Nền gradient xinh xắn */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-secondary-pink/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-highlight-yellow/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Nút quay lại */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 font-bold text-sm text-primary-brown/65 hover:text-accent-red transition-all hover:-translate-x-0.5 duration-300 mb-8"
        >
          <ChevronLeft size={16} className="text-accent-red" />
          Quay lại danh sách sản phẩm
        </Link>

        {/* Cấu trúc chi tiết sản phẩm */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          {/* Cột trái: Hình ảnh sản phẩm (có hỗ trợ hiển thị danh sách ảnh nhỏ nếu có nhiều ảnh) */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="aspect-square relative bg-white/60 backdrop-blur-md rounded-[3rem] border-4 border-secondary-pink/20 overflow-hidden shadow-sm flex items-center justify-center">
              {hasDiscount && (
                <div className="absolute top-6 left-6 z-10 bg-accent-red text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full shadow-md tracking-wider uppercase animate-pulse">
                  SALE ✨
                </div>
              )}
              <Image
                src={primaryImage}
                alt={product.name}
                fill
                className="object-contain p-12 hover:scale-105 transition-transform duration-500"
                priority
              />
            </div>

            {/* Danh sách ảnh thu nhỏ nếu sản phẩm có từ 2 ảnh trở lên */}
            {product.images.length > 1 && (
              <div className="flex gap-3 justify-center">
                {product.images.map((img, index) => (
                  <div
                    key={index}
                    className={`w-16 h-16 relative bg-white rounded-2xl border-2 overflow-hidden cursor-pointer shadow-sm hover:scale-105 transition-transform ${index === 0 ? "border-accent-red" : "border-primary-brown/10"
                      }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} - ${index + 1}`}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cột phải: Thông tin sản phẩm */}
          <div className="flex-1 flex flex-col">
            <div className="mb-8">
              {/* Phân loại và Tên */}
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3.5 py-1.5 bg-secondary-pink/30 text-accent-red text-[10px] font-extrabold tracking-widest rounded-full uppercase border border-secondary-pink/20">
                  {product?.category?.name}
                </span>
                {product.sku && (
                  <span className="text-xs font-bold text-primary-brown/40 font-mono">
                    SKU: {product.sku}
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-heading mb-4 text-primary-brown">
                {product.name}
              </h1>

              {/* Hiển thị giá và Khuyến mãi */}
              <div className="mb-6 flex items-center gap-3 flex-wrap">
                {hasDiscount ? (
                  <>
                    <p className="text-3xl font-bold text-accent-red">
                      {discountPrice?.toLocaleString("vi-VN")} VNĐ
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
                    {originalPrice.toLocaleString("vi-VN")} VNĐ
                  </p>
                )}
              </div>

              <div className="space-y-6 text-base">
                {/* 3. Mô tả chi tiết */}
                {product.description && (
                  <div>
                    <h4 className="font-heading text-lg mb-2 opacity-80">Mô tả sản phẩm</h4>
                    <div className="leading-relaxed opacity-95 text-primary-brown/85 whitespace-pre-line text-sm bg-white/30 backdrop-blur-sm p-6 border border-primary-brown/5 rounded-[2rem]">
                      {product.description}
                    </div>
                  </div>
                )}
              </div>

              {/* Nút hành động và biến thể từ Client Component */}
              <AddToCartForm product={product as any} />
            </div>

            {/* Ghi chú thương hiệu */}
            <div className="mt-8 p-6 bg-highlight-yellow/30 rounded-[2rem] border-2 border-highlight-yellow/50 shadow-sm">
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
      </div>
    </div>
  );
}
