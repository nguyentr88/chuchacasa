"use client";

import { useState, useEffect, startTransition, useTransition } from "react";
import { Plus, Tag, Loader2, Search, Calendar, FolderHeart } from "lucide-react";
import { createCategoryAction, getCategoriesAction } from "@/app/actions/admin";

interface CategoryWithCount {
  id: string;
  code: string;
  name: string;
  createdAt: Date;
  _count: {
    products: number;
  };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // State form
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startCreateTransition] = useTransition();

  // Load danh sách phân loại
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getCategoriesAction();
      if (res.categories) {
        setCategories(res.categories as any);
      }
    } catch (err) {
      console.error("Không thể tải danh sách danh mục", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!code || !name) {
      setError("Vui lòng điền đầy đủ cả Mã loại và Tên loại!");
      return;
    }

    startCreateTransition(async () => {
      try {
        const res = await createCategoryAction(code, name);
        if (res.error) {
          setError(res.error);
        } else {
          setSuccess(res.success);
          setCode("");
          setName("");
          // Tải lại danh sách danh mục
          fetchCategories();
        }
      } catch (err) {
        setError("Đã xảy ra lỗi không xác định.");
      }
    });
  };

  // Lọc danh mục theo ô tìm kiếm
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div>
        <h1 className="text-4xl font-heading text-primary-brown mb-2">Quản lý Phân loại</h1>
        <p className="text-primary-brown/60">
          Thêm và xem danh sách các mã loại sản phẩm (Ví dụ: CC07 - Hộp bút, LOTLY - Lót ly,...)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Form Panel */}
        <div className="bg-white/60 border-2 border-secondary-pink rounded-[3rem] p-6 md:p-8 backdrop-blur-md shadow-md space-y-6">
          <h2 className="text-2xl font-heading text-primary-brown flex items-center gap-2">
            <FolderHeart size={22} className="text-accent-red" />
            <span>Thêm loại sản phẩm mới</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-2xl text-sm text-center font-medium border border-red-100">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl text-sm text-center font-medium border border-emerald-100">
                {success}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold mb-2 ml-4 text-primary-brown">
                Mã loại (SKU code) <span className="text-accent-red">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-brown/40" size={18} />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={isPending}
                  placeholder="Ví dụ: CC07, LOTLY, TUIVAI"
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-primary-brown/10 rounded-full focus:border-accent-red outline-none transition-all uppercase"
                />
              </div>
              <p className="text-xs text-primary-brown/50 mt-1.5 ml-4">
                Dùng làm tiền tố SKU sản phẩm (không dấu, viết liền).
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 ml-4 text-primary-brown">
                Tên loại <span className="text-accent-red">*</span>
              </label>
              <div className="relative">
                <FolderHeart className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-brown/40" size={18} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isPending}
                  placeholder="Ví dụ: Hộp bút, Lót ly, Túi xách"
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-primary-brown/10 rounded-full focus:border-accent-red outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-4 bg-accent-red text-white font-bold rounded-full text-lg shadow-[0_5px_0_rgb(130,46,38)] hover:shadow-[0_2px_0_rgb(130,46,38)] hover:translate-y-[3px] active:shadow-none active:translate-y-[5px] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {isPending ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <Plus size={20} />
                  Thêm phân loại
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right List Panel */}
        <div className="lg:col-span-2 bg-white/40 border-2 border-primary-brown/5 rounded-[3rem] p-6 md:p-8 backdrop-blur-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-primary-brown/5 pb-4">
            <h2 className="text-2xl font-heading text-primary-brown">
              Danh sách phân loại hiện tại
            </h2>
            
            {/* Search input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-brown/40" size={16} />
              <input
                type="text"
                placeholder="Tìm mã hoặc tên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-primary-brown/10 rounded-full focus:border-accent-red outline-none text-sm transition-all"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-primary-brown/60 space-y-3">
              <Loader2 size={36} className="animate-spin text-accent-red" />
              <span className="text-sm font-medium">Đang tải danh sách...</span>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-16 text-primary-brown/50">
              <FolderHeart size={48} className="mx-auto opacity-30 mb-3 text-accent-red" />
              <p className="text-base font-medium">Không tìm thấy phân loại nào.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-primary-brown/10 text-xs font-bold text-primary-brown/60 uppercase tracking-wider">
                    <th className="py-4 px-4">Mã phân loại</th>
                    <th className="py-4 px-4">Tên phân loại</th>
                    <th className="py-4 px-4 text-center">Số sản phẩm</th>
                    <th className="py-4 px-4">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-brown/5 text-sm font-medium">
                  {filteredCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-white/20 transition-colors">
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 bg-accent-red/10 border border-accent-red/20 text-accent-red rounded-full font-bold text-xs uppercase tracking-wide">
                          {cat.code}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-base text-primary-brown">
                        {cat.name}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="px-2.5 py-1 bg-highlight-yellow text-primary-brown border border-primary-brown/5 rounded-lg text-xs font-bold shadow-sm">
                          {cat._count.products} món
                        </span>
                      </td>
                      <td className="py-4 px-4 text-primary-brown/60 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="opacity-60" />
                          {new Date(cat.createdAt).toLocaleDateString("vi-VN")}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
