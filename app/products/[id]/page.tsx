import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductDetailView } from "@/components/ProductDetailView";

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

        {/* Cấu trúc chi tiết sản phẩm (gallery + biến thể) */}
        <ProductDetailView product={product as any} />
      </div>
    </div>
  );
}
