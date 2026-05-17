"use client";

import Image from "next/image";
import { ChevronDown, ChevronUp, Search, Trash2, Loader2, Sparkles, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  getProductsAction, 
  getCategoriesWithCountAction, 
  getProductFiltersAction 
} from "@/app/actions/products";
import { Product, Category } from "@/types/product";

/**
 * Thẻ khung xương (Skeleton Card) khi đang tải dữ liệu sản phẩm
 */
function ProductSkeleton() {
  return (
    <div className="flex flex-col bg-white/40 border-2 border-primary-brown/5 rounded-[2.5rem] overflow-hidden animate-pulse">
      <div className="aspect-[4/5] bg-primary-brown/5 relative overflow-hidden flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-primary-brown/5"></div>
      </div>
      <div className="p-6 border-t-2 border-primary-brown/5 space-y-3">
        <div className="h-6 bg-primary-brown/10 rounded-full w-3/4"></div>
        <div className="h-4 bg-primary-brown/5 rounded-full w-1/2"></div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  // Bộ lọc Sidebar toggle
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [isSortOpen, setIsSortOpen] = useState(true);

  // Dữ liệu bộ lọc động từ Database
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);

  // Trạng thái lọc hiện tại
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortOption, setSortOption] = useState("newest");

  // Kết quả sản phẩm và phân trang
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  // Trạng thái Loading
  const [isLoading, setIsLoading] = useState(true); // Load lần đầu
  const [isFiltering, setIsFiltering] = useState(false); // Load khi đổi filter
  const [isMoreLoading, setIsMoreLoading] = useState(false); // Load khi bấm Xem thêm

  // 1. Nhận diện có đang active bất kỳ bộ lọc nào hay không
  const isAnyFilterActive = 
    selectedCategoryId !== "all" || 
    selectedSizes.length > 0 || 
    selectedColors.length > 0 || 
    searchQuery.trim() !== "";

  // 2. Debounce tìm kiếm (chờ 500ms sau khi ngừng gõ mới query DB để tăng hiệu năng)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // 3. Tải danh mục phân loại và các mảng filter động một lần duy nhất khi load trang
  useEffect(() => {
    async function loadFilterOptions() {
      const [catRes, filterRes] = await Promise.all([
        getCategoriesWithCountAction(),
        getProductFiltersAction()
      ]);

      if (catRes.success) setCategories(catRes.categories);
      if (filterRes.success) {
        setAvailableSizes(filterRes.sizes);
        setAvailableColors(filterRes.colors);
      }
    }
    loadFilterOptions();

    // Đồng bộ từ khóa tìm kiếm từ URL query params nếu có
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const searchFromUrl = urlParams.get("search");
      if (searchFromUrl) {
        setSearchQuery(searchFromUrl);
      }
    }
  }, []);

  // 4. Reset phân trang và tải lại từ đầu mỗi khi thay đổi bộ lọc bất kỳ
  useEffect(() => {
    setPage(1);
    fetchProducts(1, false);
  }, [selectedCategoryId, selectedSizes, selectedColors, debouncedSearch, sortOption]);

  // 5. Hàm tải sản phẩm cốt lõi kết nối với Server Action
  async function fetchProducts(pageNumber: number, append: boolean) {
    if (pageNumber === 1) {
      setIsFiltering(true);
    } else {
      setIsMoreLoading(true);
    }

    const res = await getProductsAction({
      categoryId: selectedCategoryId,
      search: debouncedSearch,
      sizes: selectedSizes,
      colors: selectedColors,
      sort: sortOption,
      page: pageNumber,
      limit: 6
    });

    if (res.success) {
      if (append) {
        setProducts(prev => [...prev, ...res.products]);
      } else {
        setProducts(res.products);
      }
      setHasMore(res.hasMore);
    }

    setIsLoading(false);
    setIsFiltering(false);
    setIsMoreLoading(false);
  }

  // 6. Xử lý tải thêm trang tiếp theo (Lazy load)
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, true);
  };

  // 7. Xử lý chọn/bỏ chọn bộ lọc mảng (kích thước, màu sắc)
  const handleToggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const handleToggleColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  // 8. Đưa toàn bộ các bộ lọc về mặc định
  const handleResetFilters = () => {
    setSelectedCategoryId("all");
    setSelectedSizes([]);
    setSelectedColors([]);
    setSearchQuery("");
    setSortOption("newest");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-primary-brown">
      {/* Category Pills (Thanh danh mục nằm ngang phía trên) */}
      <div className="px-6 pt-8 pb-4 flex flex-wrap gap-3 justify-center max-w-7xl mx-auto w-full">
        <button
          onClick={() => setSelectedCategoryId("all")}
          className={`px-6 py-2.5 rounded-full border-2 text-sm font-bold transition-all hover:scale-105 duration-300 ${
            selectedCategoryId === "all"
              ? "bg-accent-red text-white border-accent-red shadow-md"
              : "bg-white/50 border-primary-brown/10 hover:bg-highlight-yellow"
          }`}
        >
          Tất cả sản phẩm
        </button>

        {categories.map((cat) => {
          const productCount = cat._count?.products || 0;
          const isActive = selectedCategoryId === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-6 py-2.5 rounded-full border-2 text-sm font-bold transition-all hover:scale-105 duration-300 flex items-center gap-1.5 ${
                isActive
                  ? "bg-accent-red text-white border-accent-red shadow-md"
                  : "bg-white/50 border-primary-brown/10 hover:bg-highlight-yellow"
              }`}
            >
              <span>{cat.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                isActive ? "bg-white/30 text-white" : "bg-primary-brown/10 text-primary-brown/60"
              }`}>
                {productCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Trình quản lý bộ lọc nhanh khi đang active */}
      {isAnyFilterActive && (
        <div className="px-6 pb-4 flex justify-center max-w-7xl mx-auto w-full animate-in fade-in duration-300">
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-2 px-5 py-2 bg-accent-red/10 border-2 border-accent-red/20 text-accent-red hover:bg-accent-red hover:text-white rounded-full font-bold text-xs shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 duration-300 cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Xóa tất cả bộ lọc đang chọn 🧹</span>
          </button>
        </div>
      )}

      {/* Thân trang: Sidebar bên trái & Grid sản phẩm bên phải */}
      <div className="flex flex-col md:flex-row max-w-7xl mx-auto w-full px-6 gap-8 pb-20 mt-4">
        {/* Sidebar */}
        <aside className="w-full md:w-72 flex-shrink-0">
          <div className="border-2 border-primary-brown/10 rounded-[2.5rem] overflow-hidden bg-white/30 backdrop-blur-sm sticky top-28 shadow-sm">
            
            {/* 1. Thanh tìm kiếm sản phẩm */}
            <div className="border-b border-primary-brown/10 p-6">
              <label className="block text-xs font-extrabold tracking-widest text-primary-brown/50 uppercase mb-3 flex items-center gap-1.5">
                <Search size={12} className="text-accent-red" />
                Tìm kiếm sản phẩm
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm túi, lót ly..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-5 pr-10 py-3 bg-white/60 border-2 border-primary-brown/10 focus:border-accent-red rounded-full text-sm outline-none transition-all placeholder-primary-brown/40"
                />
                {debouncedSearch !== searchQuery ? (
                  <Loader2 size={16} className="absolute right-4 top-3.5 text-accent-red animate-spin" />
                ) : (
                  <Search size={16} className="absolute right-4 top-3.5 text-primary-brown/50" />
                )}
              </div>
            </div>

            {/* 2. Bộ lọc kích thước và màu sắc */}
            {(availableSizes.length > 0 || availableColors.length > 0) && (
              <div className="border-b border-primary-brown/10">
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`w-full p-6 flex justify-between items-center transition-colors ${isFilterOpen ? 'bg-accent-red/5' : 'hover:bg-accent-red/5'}`}
                >
                  <span className="font-heading text-lg tracking-wide">BỘ LỌC CHI TIẾT</span>
                  {isFilterOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                
                {isFilterOpen && (
                  <div className="px-6 pb-6 pt-2 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Lọc theo kích thước */}
                    {availableSizes.length > 0 && (
                      <div>
                        <h5 className="text-xs font-extrabold tracking-widest text-primary-brown/50 uppercase mb-3">
                          KÍCH THƯỚC
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {availableSizes.map(size => {
                            const isSelected = selectedSizes.includes(size);
                            return (
                              <button
                                key={size}
                                onClick={() => handleToggleSize(size)}
                                className={`px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all duration-200 ${
                                  isSelected 
                                    ? "bg-accent-red text-white border-accent-red"
                                    : "bg-white/60 border-primary-brown/10 hover:border-accent-red/30 text-primary-brown/80"
                                }`}
                              >
                                {size}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Lọc theo màu sắc */}
                    {availableColors.length > 0 && (
                      <div>
                        <h5 className="text-xs font-extrabold tracking-widest text-primary-brown/50 uppercase mb-3">
                          MÀU SẮC
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {availableColors.map(color => {
                            const isSelected = selectedColors.includes(color);
                            return (
                              <button
                                key={color}
                                onClick={() => handleToggleColor(color)}
                                className={`px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all duration-200 ${
                                  isSelected 
                                    ? "bg-accent-red text-white border-accent-red shadow-sm"
                                    : "bg-white/60 border-primary-brown/10 hover:border-accent-red/30 text-primary-brown/80"
                                }`}
                              >
                                {color}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* 3. Bộ lọc Sắp xếp */}
            <div>
              <button 
                onClick={() => setIsSortOpen(!isSortOpen)}
                className={`w-full p-6 flex justify-between items-center transition-colors ${isSortOpen ? 'bg-accent-red/5' : 'hover:bg-accent-red/5'}`}
              >
                <span className="font-heading text-lg tracking-wide">SẮP XẾP THEO</span>
                {isSortOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              
              {isSortOpen && (
                <div className="px-6 pb-8 pt-2 space-y-4 text-sm font-bold animate-in fade-in slide-in-from-top-2 duration-300">
                  {[
                    { label: "Mới nhất", value: "newest" },
                    { label: "Tên A-Z", value: "name-asc" },
                    { label: "Tên Z-A", value: "name-desc" },
                    { label: "Giá thấp đến cao", value: "price-asc" },
                    { label: "Giá cao xuống thấp", value: "price-desc" }
                  ].map(opt => {
                    const isChecked = sortOption === opt.value;
                    return (
                      <label 
                        key={opt.value}
                        onClick={() => setSortOption(opt.value)}
                        className="flex items-center gap-3 opacity-80 hover:opacity-100 cursor-pointer transition-all group select-none"
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isChecked ? "border-accent-red" : "border-primary-brown/40 group-hover:border-accent-red/60"
                        }`}>
                          <div className={`w-2.5 h-2.5 rounded-full bg-accent-red transition-all duration-300 ${
                            isChecked ? "scale-100" : "scale-0"
                          }`} />
                        </div>
                        <span className={isChecked ? "text-accent-red" : "text-primary-brown/80"}>
                          {opt.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Cột chính hiển thị Grid sản phẩm */}
        <main className="flex-1">
          {isLoading || isFiltering ? (
            // Trạng thái đang tải (Skeletons)
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            // Trạng thái có sản phẩm
            <div className="space-y-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
                {products.map((product) => {
                  const productPrice = product.price;
                  const discountPrice = product.discountPrice;
                  const hasDiscount = product.hasDiscount;
                  const displayImage = product.images[0] || "/globe.svg";

                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="group flex flex-col bg-white/40 border-2 border-primary-brown/5 rounded-[2.5rem] overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 relative"
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
                      </div>

                      {/* Thông tin sản phẩm */}
                      <div className="p-6 border-t-2 border-primary-brown/5 flex flex-col flex-1">
                        <h3 className="font-heading text-lg mb-1.5 text-primary-brown group-hover:text-accent-red transition-colors">
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
                    </Link>
                  );
                })}
              </div>

              {/* Nút Xem thêm (Lazy load pagination) */}
              {hasMore && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleLoadMore}
                    disabled={isMoreLoading}
                    className="px-8 py-4 bg-white/60 hover:bg-accent-red border-2 border-primary-brown/10 hover:border-accent-red hover:text-white rounded-full font-bold text-sm shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isMoreLoading && <Loader2 size={16} className="animate-spin" />}
                    <span>{isMoreLoading ? "Đang tải sản phẩm..." : "Xem thêm sản phẩm 🧸"}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Trạng thái trống (Không tìm thấy sản phẩm nào)
            <div className="h-[400px] bg-white/30 backdrop-blur-sm border-2 border-primary-brown/5 rounded-[3.5rem] flex flex-col items-center justify-center text-center p-8 shadow-inner animate-in fade-in duration-300">
              <div className="text-6xl mb-4 select-none">🧸</div>
              <h4 className="font-heading text-xl text-primary-brown mb-2">
                Hic, không tìm thấy sản phẩm phù hợp...
              </h4>
              <p className="text-xs text-primary-brown/60 max-w-sm mb-6 leading-relaxed">
                Bạn thử thay đổi từ khóa tìm kiếm, chọn kích cỡ khác, hoặc nhấn nút bên dưới để khôi phục bộ lọc nhé!
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-3 bg-accent-red hover:bg-accent-red/90 text-white rounded-full font-bold text-xs shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw size={14} />
                <span>Xem lại toàn bộ sản phẩm ✨</span>
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
