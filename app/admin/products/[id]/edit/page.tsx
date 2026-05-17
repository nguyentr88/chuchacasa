import { getProductByIdAction } from "@/app/actions/admin";
import EditProductForm from "@/app/admin/products/[id]/edit/EditProductForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export const revalidate = 0;

export default async function EditProductPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const { product, error } = await getProductByIdAction(id);

  if (error || !product) {
    return (
      <div className="space-y-6 text-center py-20">
        <div className="max-w-md mx-auto p-8 bg-white/60 border-2 border-red-200 rounded-[3rem] shadow-md space-y-4">
          <p className="text-lg font-bold text-red-500">❌ Không tìm thấy sản phẩm!</p>
          <p className="text-sm opacity-70">
            Sản phẩm có thể đã bị xóa hoặc đường dẫn liên kết không chính xác.
          </p>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-red text-white font-bold rounded-full text-sm shadow-md"
          >
            <ArrowLeft size={16} />
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return <EditProductForm product={product as any} />;
}
