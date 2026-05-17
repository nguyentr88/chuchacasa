import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ShoppingBag, Grid, Layers, AlertCircle, Plus, ArrowRight } from "lucide-react";
import Image from "next/image";

export const revalidate = 0; // Luôn làm mới dữ liệu khi tải trang

export default async function AdminDashboard() {
  // Lấy thống kê trực tiếp từ DB
  const [totalProducts, totalCategories, totalVariants, lowStockCount, recentProducts] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.productVariant.count(),
    prisma.productVariant.count({
      where: {
        stock: { lte: 5 },
      },
    }),
    prisma.product.findMany({
      take: 4,
      include: {
        category: true,
        variants: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return (
    <div className="space-y-10">
      {/* Welcome Banner */}
      <section className="relative bg-white/40 border-2 border-secondary-pink rounded-[3rem] p-8 md:p-10 overflow-hidden backdrop-blur-md shadow-md flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="absolute inset-0 bg-secondary-pink rounded-full -rotate-6 scale-90 opacity-20 blur-3xl -z-10"></div>
        <div className="absolute inset-0 bg-highlight-yellow rounded-full rotate-3 opacity-20 blur-2xl -z-10"></div>

        <div className="space-y-4 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-heading text-primary-brown leading-tight">
            Chào mừng Admin trở lại! 🧸
          </h1>
          <p className="text-lg md:text-xl text-primary-brown/80 leading-relaxed max-w-xl">
            Nơi quản lý ngôi nhà nhỏ <span className="font-bold text-accent-red">chucha.casa</span>. 
            Cùng thêm sản phẩm mới và lan tỏa niềm hạnh phúc nhỏ xinh đến mọi nhà nhé!
          </p>
          <div className="pt-2 flex flex-wrap gap-4 justify-center md:justify-start">
            <Link
              href="/admin/products/new"
              className="px-6 py-3.5 bg-accent-red text-white font-bold rounded-full text-base shadow-[0_5px_0_rgb(130,46,38)] hover:shadow-[0_2px_0_rgb(130,46,38)] hover:translate-y-[3px] active:shadow-none active:translate-y-[5px] transition-all flex items-center gap-2 group cursor-pointer"
            >
              <Plus size={18} />
              Thêm sản phẩm mới
            </Link>
            <Link
              href="/admin/categories"
              className="px-6 py-3.5 bg-highlight-yellow text-primary-brown font-bold rounded-full text-base border-2 border-primary-brown/10 hover:bg-highlight-yellow/80 transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Plus size={18} />
              Thêm phân loại mới
            </Link>
          </div>
        </div>

        <div className="relative w-44 h-44 flex-shrink-0 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-lg">
          <Image
            src="/globe.svg"
            alt="Mascot Welcome"
            width={120}
            height={120}
            className="opacity-90 object-contain"
          />
        </div>
      </section>

      {/* Metrics Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="group p-6 bg-white/60 border-2 border-primary-brown/5 rounded-[2.5rem] hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-secondary-pink/40 text-accent-red rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingBag size={24} />
            </div>
            <span className="text-xs font-bold text-primary-brown/40 uppercase tracking-widest">
              Sản phẩm
            </span>
          </div>
          <h3 className="text-4xl font-heading mb-1 text-primary-brown">{totalProducts}</h3>
          <p className="text-sm font-medium opacity-60">Sản phẩm cốt lõi đã đăng</p>
        </div>

        {/* Metric 2 */}
        <div className="group p-6 bg-white/60 border-2 border-primary-brown/5 rounded-[2.5rem] hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-highlight-yellow/40 text-amber-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Grid size={24} />
            </div>
            <span className="text-xs font-bold text-primary-brown/40 uppercase tracking-widest">
              Phân loại
            </span>
          </div>
          <h3 className="text-4xl font-heading mb-1 text-primary-brown">{totalCategories}</h3>
          <p className="text-sm font-medium opacity-60">Mã phân loại được thiết lập</p>
        </div>

        {/* Metric 3 */}
        <div className="group p-6 bg-white/60 border-2 border-primary-brown/5 rounded-[2.5rem] hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-secondary-pink/40 text-purple-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers size={24} />
            </div>
            <span className="text-xs font-bold text-primary-brown/40 uppercase tracking-widest">
              Biến thể
            </span>
          </div>
          <h3 className="text-4xl font-heading mb-1 text-primary-brown">{totalVariants}</h3>
          <p className="text-sm font-medium opacity-60">Tổng số màu & kích thước</p>
        </div>

        {/* Metric 4 */}
        <div className="group p-6 bg-white/60 border-2 border-primary-brown/5 rounded-[2.5rem] hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${lowStockCount > 0 ? "bg-red-500/10 text-red-600" : "bg-emerald-500/10 text-emerald-600"}`}>
              <AlertCircle size={24} />
            </div>
            <span className="text-xs font-bold text-primary-brown/40 uppercase tracking-widest">
              Cảnh báo kho
            </span>
          </div>
          <h3 className={`text-4xl font-heading mb-1 ${lowStockCount > 0 ? "text-red-500" : "text-primary-brown"}`}>
            {lowStockCount}
          </h3>
          <p className="text-sm font-medium opacity-60">Biến thể sắp hết hàng (&le;5)</p>
        </div>
      </section>

      {/* Main Content Dashboard Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Products (Left 2 columns) */}
        <div className="lg:col-span-2 bg-white/40 border-2 border-primary-brown/5 rounded-[3rem] p-6 md:p-8 backdrop-blur-sm space-y-6">
          <div className="flex justify-between items-center border-b border-primary-brown/5 pb-4">
            <h2 className="text-2xl font-heading text-primary-brown flex items-center gap-2">
              <span>Sản phẩm mới thêm gần đây</span>
            </h2>
            <Link
              href="/admin/products"
              className="text-sm font-bold text-accent-red hover:underline flex items-center gap-1 group"
            >
              Xem tất cả
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {recentProducts.length === 0 ? (
            <div className="text-center py-12 text-primary-brown/50">
              <p className="text-base mb-2">Chưa có sản phẩm nào được tạo.</p>
              <Link href="/admin/products/new" className="text-accent-red font-bold hover:underline">
                Đăng sản phẩm đầu tiên ngay!
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-primary-brown/5">
              {recentProducts.map((product) => {
                const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
                return (
                  <div key={product.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-14 h-14 bg-secondary-pink/20 rounded-2xl flex-shrink-0 overflow-hidden relative border border-primary-brown/10">
                        <Image
                          src={product.images[0] || "/globe.svg"}
                          alt={product.name}
                          fill
                          className="object-contain p-2"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-base truncate mb-0.5">{product.name}</h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-primary-brown/60">
                          <span className="px-2 py-0.5 bg-white/70 border border-primary-brown/5 rounded-full font-bold">
                            {product.category.name}
                          </span>
                          {product.sku && <span>SKU: {product.sku}</span>}
                          <span>•</span>
                          <span>{product.variants.length} biến thể ({totalStock} chiếc)</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-accent-red">
                        {product.price.toLocaleString("vi-VN")}đ
                      </p>
                      {product.hasDiscount && product.discountPrice && (
                        <p className="text-xs line-through text-primary-brown/40">
                          {product.discountPrice.toLocaleString("vi-VN")}đ
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Help & Presets (Right 1 column) */}
        <div className="bg-white/40 border-2 border-primary-brown/5 rounded-[3rem] p-6 md:p-8 backdrop-blur-sm flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-2xl font-heading text-primary-brown border-b border-primary-brown/5 pb-4 mb-4">
              Lưu ý cho Admin 📝
            </h2>
            <div className="space-y-4 text-sm leading-relaxed opacity-90">
              <div className="flex gap-3">
                <span className="text-lg">🎨</span>
                <p>
                  <strong>Hình ảnh sản phẩm:</strong> Để sản phẩm trông đẹp nhất, vui lòng sử dụng hình ảnh có nền trong suốt hoặc nền sáng, ảnh vuông tỉ lệ 1:1.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="text-lg">🏷️</span>
                <p>
                  <strong>Mã SKU chung:</strong> Ví dụ như <code>CC07</code> là SKU chung đại diện cho dòng sản phẩm, khi sinh biến thể SKU sẽ tự động nối đuôi dạng <code>CC07-LOT-S</code>.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="text-lg">⚙️</span>
                <p>
                  <strong>Giá biến thể:</strong> Nếu một biến thể cụ thể (ví dụ size lớn L) có giá đắt hơn, bạn chỉ cần nhập giá trị riêng cho biến thể đó. Các biến thể khác sẽ lấy theo giá sản phẩm gốc.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-highlight-yellow/40 rounded-[2rem] border border-highlight-yellow flex items-center gap-3">
            <span className="text-2xl animate-bounce">💡</span>
            <p className="text-xs font-bold leading-normal">
              Mẹo: Bạn có thể nhanh chóng sửa giá của bất kỳ sản phẩm nào từ danh sách sản phẩm mà không cần mở form chỉnh sửa đầy đủ!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
