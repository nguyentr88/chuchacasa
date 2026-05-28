"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Search, ShoppingCart, X, Loader2, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import UserMenu from "./UserMenu";
import { getProductsAction } from "@/app/actions/products";
import { Product } from "@/types/product";
import { useCart } from "./providers/CartContext";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isProductPage = pathname.startsWith("/products");

  const { cartCount, setIsCartOpen } = useCart();

  // Các trạng thái của bộ Tìm kiếm Thông minh
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Trạng thái load thực sự: đang truy vấn DB hoặc đang trong thời gian chờ debounce
  const isActuallyLoading = isSearching || (searchKeyword.trim() !== "" && searchKeyword !== debouncedKeyword);

  // 1. Debounce từ khóa tìm kiếm (chờ 400ms sau khi dừng gõ để tránh spam DB)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(searchKeyword);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchKeyword]);

  // 2. Gọi Server Action lấy kết quả tìm kiếm thời gian thực
  useEffect(() => {
    async function performSearch() {
      if (!debouncedKeyword.trim()) {
        setSearchResults([]);
        setTotalCount(0);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      const res = await getProductsAction({
        search: debouncedKeyword,
        page: 1,
        limit: 5 // Lấy tối đa 5 kết quả hiển thị nhanh
      });

      if (res.success) {
        setSearchResults(res.products);
        setTotalCount(res.totalCount);
      }
      setIsSearching(false);
    }
    performSearch();
  }, [debouncedKeyword]);

  // 3. Tự động Focus vào ô nhập khi mở Modal tìm kiếm
  useEffect(() => {
    if (isSearchOpen) {
      // Đợi modal render xong rồi focus
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      // Khóa cuộn trang khi mở modal tìm kiếm
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
      setSearchKeyword("");
      setSearchResults([]);
    }
  }, [isSearchOpen]);

  // 4. Xử lý chuyển hướng đến trang danh sách kèm từ khóa
  const handleSearchSubmit = () => {
    if (searchKeyword.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchKeyword.trim())}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <>
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <Link
          href="/products"
          className={`text-3xl font-heading tracking-tight transition-all relative ${isProductPage ? "text-accent-red" : "text-primary-brown hover:text-accent-red"
            }`}
        >
          Sản phẩm
          {isProductPage && (
            <div className="absolute -bottom-1 left-0 w-full h-1 bg-accent-red rounded-full" />
          )}
        </Link>

        <nav className="flex items-center gap-10">
          <Link href="/" className="font-heading text-xl text-primary-brown hover:text-accent-red transition-colors">
            chucha.casa
          </Link>

          <Link
            href="/refund-policy"
            className={`font-heading text-xl transition-all hover:scale-105 duration-200 ${pathname === "/refund-policy"
                ? "text-accent-red font-bold relative"
                : "text-primary-brown hover:text-accent-red"
              }`}
          >
            Chính sách hoàn tiền
            {pathname === "/refund-policy" && (
              <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-accent-red rounded-full" />
            )}
          </Link>

          <div className="flex items-center gap-6 text-primary-brown">
            {/* Click mở Modal tìm kiếm */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="hover:text-accent-red transition-all cursor-pointer hover:scale-110 duration-200"
            >
              <Search size={24} strokeWidth={2.5} />
            </button>
            <UserMenu />
            <button
              onClick={() => setIsCartOpen(true)}
              className="hover:text-accent-red transition-all cursor-pointer hover:scale-110 duration-200 relative"
            >
              <ShoppingCart size={24} strokeWidth={2.5} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent-red text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-background">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* MODAL TÌM KIẾM THÔNG MINH AUTOCOMPLETE */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 bg-primary-brown/30 backdrop-blur-md z-[100] flex items-start justify-center pt-24 px-6 animate-in fade-in duration-300"
          onClick={(e) => {
            // Đóng modal khi click ra ngoài card
            if (e.target === e.currentTarget) setIsSearchOpen(false);
          }}
        >
          <div className="bg-white rounded-[2.5rem] border-4 border-secondary-pink/20 shadow-2xl max-w-2xl w-full overflow-hidden p-6 animate-in zoom-in-95 duration-300 relative">
            {/* Header Modal: Tiêu đề + Nút Đóng Modal */}
            <div className="flex justify-between items-center mb-5 px-1">
              <h3 className="font-heading text-lg text-primary-brown flex items-center gap-2">
                <span>Tìm kiếm sản phẩm</span>
                <span className="text-xs opacity-60 font-body font-normal">(Esc để đóng)</span>
              </h3>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="hover:text-accent-red transition-colors text-primary-brown/50 hover:bg-secondary-pink/20 p-2 rounded-full cursor-pointer duration-200"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* Khung nhập liệu */}
            <div className="relative flex items-center mb-6">
              <Search size={20} className="absolute left-4 text-accent-red" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Nhập món đồ bạn muốn tìm kiếm... 🧸"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full bg-secondary-pink/15 border-2 border-primary-brown/5 focus:border-accent-red rounded-full pl-12 pr-12 py-4 outline-none text-base font-bold text-primary-brown transition-all placeholder-primary-brown/40"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearchSubmit();
                  if (e.key === "Escape") setIsSearchOpen(false);
                }}
              />
              {searchKeyword.trim() && (
                <button
                  onClick={() => setSearchKeyword("")}
                  className="absolute right-4 hover:text-accent-red transition-colors text-primary-brown/50 cursor-pointer p-1"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Nội dung kết quả Autocomplete */}
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {isActuallyLoading ? (
                // Đang quét dữ liệu hoặc chờ debounce - Nằm giữa trang danh sách gợi ý
                <div className="h-[200px] flex flex-col justify-center items-center gap-3">
                  <Loader2 className="animate-spin text-accent-red" size={28} strokeWidth={2.5} />
                  <span className="text-sm font-bold text-primary-brown/60">Đang tìm món quà bạn cần... 🧸</span>
                </div>
              ) : !searchKeyword.trim() ? (
                // Trạng thái gợi ý ban đầu
                <div className="space-y-4 py-4 text-center">
                  <p className="text-xs font-extrabold tracking-widest text-primary-brown/50 uppercase">
                    🧸 Gợi ý tìm kiếm nhiều nhất
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {["Lót ly", "Túi vải", "Ví nhỏ", "Hộp bút"].map((term) => (
                      <button
                        key={term}
                        onClick={() => setSearchKeyword(term)}
                        className="px-5 py-2.5 bg-secondary-pink/15 border border-primary-brown/5 hover:bg-highlight-yellow/40 hover:border-accent-red/20 rounded-2xl text-sm font-bold text-primary-brown transition-all cursor-pointer shadow-sm active:scale-95"
                      >
                        {term} ✨
                      </button>
                    ))}
                  </div>
                </div>
              ) : searchResults.length > 0 ? (
                // Trạng thái tìm thấy sản phẩm matching
                <div className="space-y-3">
                  <p className="text-xs font-extrabold tracking-widest text-primary-brown/50 uppercase px-1">
                    ✨ Sản phẩm tìm thấy ({totalCount})
                  </p>

                  <div className="space-y-2">
                    {searchResults.map((prod) => {
                      const displayImage = prod.images[0] || "/logo/chucha-avatar.jpg";

                      return (
                        <Link
                          key={prod.id}
                          href={`/products/${prod.id}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="flex items-center gap-4 p-3 bg-secondary-pink/5 hover:bg-secondary-pink/15 rounded-2xl border border-primary-brown/5 transition-all group shadow-sm hover:scale-[1.01] duration-300"
                        >
                          {/* Ảnh thu nhỏ */}
                          <div className="w-14 h-14 relative bg-white rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-primary-brown/5">
                            <Image
                              src={displayImage}
                              alt={prod.name}
                              fill
                              className="object-contain p-2 group-hover:scale-105 transition-transform"
                            />
                          </div>

                          {/* Chi tiết */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-heading text-base truncate text-primary-brown group-hover:text-accent-red transition-colors">
                              {prod.name}
                            </h4>
                            <p className="text-xs font-bold text-accent-red mt-0.5">
                              {prod.hasDiscount
                                ? `${prod.discountPrice?.toLocaleString("vi-VN")} VNĐ`
                                : `${prod.price.toLocaleString("vi-VN")} VNĐ`
                              }
                            </p>
                          </div>

                          <ChevronRight size={16} className="text-primary-brown/30 group-hover:text-accent-red group-hover:translate-x-0.5 transition-all" />
                        </Link>
                      );
                    })}
                  </div>

                  {/* Nút Xem tất cả để chuyển hướng */}
                  <button
                    onClick={handleSearchSubmit}
                    className="w-full text-center py-3.5 bg-accent-red text-white hover:bg-accent-red/90 rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-98 duration-300 cursor-pointer mt-4"
                  >
                    Xem tất cả {totalCount} kết quả cho &quot;{searchKeyword}&quot; 🔍
                  </button>
                </div>
              ) : (
                // Trạng thái trống thực tế (chỉ hiển thị khi đã load xong hoàn toàn và không có kết quả)
                !isActuallyLoading && (
                  <div className="text-center py-10">
                    <span className="text-5xl select-none">🧸</span>
                    <p className="font-heading text-lg text-primary-brown mt-3">
                      Hic, không tìm thấy sản phẩm nào phù hợp...
                    </p>
                    <p className="text-xs text-primary-brown/50 mt-1 max-w-sm mx-auto leading-relaxed">
                      Bạn thử nhập một từ khóa khác (ví dụ: túi vải, lót ly, ví...) xem sao nhé!
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
