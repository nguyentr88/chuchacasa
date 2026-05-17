"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Edit2, Trash2, Tag, Loader2, DollarSign, Layers, Eye, RefreshCw, X, Percent } from "lucide-react";
import { getAdminProductsAction, deleteProductAction, updateProductPriceAction, getCategoriesAction } from "@/app/actions/admin";

interface ProductWithRelations {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  price: number;
  hasDiscount: boolean;
  discountPrice: number | null;
  images: string[];
  sizes: string[];
  colors: string[];
  categoryId: string;
  category: {
    name: string;
    code: string;
  };
  variants: Array<{
    id: string;
    size: string | null;
    color: string | null;
    price: number | null;
    stock: number;
  }>;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  
  // Lọc
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // State chỉnh giá nhanh
  const [editingPriceProduct, setEditingPriceProduct] = useState<ProductWithRelations | null>(null);
  const [newPrice, setNewPrice] = useState("");
  const [newDiscountPrice, setNewDiscountPrice] = useState("");
  const [hasDiscount, setHasDiscount] = useState(false);
  const [isPricePending, startPriceTransition] = useTransition();
  const [priceError, setPriceError] = useState("");

  // State xóa sản phẩm
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [isDeletePending, startDeleteTransition] = useTransition();

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        getAdminProductsAction(),
        getCategoriesAction()
      ]);
      
      if (prodRes.products) setProducts(prodRes.products as any);
      if (catRes.categories) setCategories(catRes.categories);
    } catch (err) {
      console.error("Không thể tải danh sách sản phẩm/danh mục", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Xóa sản phẩm
  const handleDeleteProduct = (id: string) => {
    setDeletingProductId(id);
  };

  const confirmDelete = () => {
    if (!deletingProductId) return;

    startDeleteTransition(async () => {
      try {
        const res = await deleteProductAction(deletingProductId);
        if (res.success) {
          // Cập nhật lại state danh sách
          setProducts(products.filter((p) => p.id !== deletingProductId));
          setDeletingProductId(null);
        } else {
          alert(res.error || "Đã xảy ra lỗi khi xóa sản phẩm.");
        }
      } catch (err) {
        alert("Đã xảy ra lỗi.");
      }
    });
  };

  // Mở modal sửa giá nhanh
  const handleOpenPriceEdit = (product: ProductWithRelations) => {
    setEditingPriceProduct(product);
    setNewPrice(product.price.toString());
    setNewDiscountPrice(product.discountPrice ? product.discountPrice.toString() : "");
    setHasDiscount(product.hasDiscount);
    setPriceError("");
  };

  // Lưu chỉnh giá nhanh
  const handleSavePrice = () => {
    if (!editingPriceProduct) return;
    setPriceError("");

    const priceVal = parseInt(newPrice);
    if (isNaN(priceVal) || priceVal <= 0) {
      setPriceError("Giá gốc phải là số dương hợp lệ!");
      return;
    }

    let discVal: number | null = null;
    if (hasDiscount) {
      discVal = parseInt(newDiscountPrice);
      if (isNaN(discVal) || discVal <= 0) {
        setPriceError("Giá giảm phải là số dương hợp lệ!");
        return;
      }
      if (discVal >= priceVal) {
        setPriceError("Giá giảm phải nhỏ hơn giá gốc!");
        return;
      }
    }

    startPriceTransition(async () => {
      try {
        const res = await updateProductPriceAction(editingPriceProduct.id, priceVal, discVal);
        if (res.success) {
          // Cập nhật giá trị trực tiếp trong state
          setProducts(products.map((p) => {
            if (p.id === editingPriceProduct.id) {
              return {
                ...p,
                price: priceVal,
                hasDiscount,
                discountPrice: discVal
              };
            }
            return p;
          }));
          setEditingPriceProduct(null);
        } else {
          setPriceError(res.error || "Không thể cập nhật giá.");
        }
      } catch (err) {
        setPriceError("Đã xảy ra lỗi.");
      }
    });
  };

  // Lọc sản phẩm
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || p.categoryId === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Title & Add button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-heading text-primary-brown mb-2">Quản lý Sản phẩm</h1>
          <p className="text-primary-brown/60">
            Xem, sửa thông tin, giá bán và tháo tác nhanh cho các món quà xinh tại chucha.casa
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="px-6 py-3.5 bg-accent-red text-white font-bold rounded-full text-base shadow-[0_5px_0_rgb(130,46,38)] hover:shadow-[0_2px_0_rgb(130,46,38)] hover:translate-y-[3px] active:shadow-none active:translate-y-[5px] transition-all flex items-center gap-2 cursor-pointer shadow-md self-stretch sm:self-auto justify-center"
        >
          <Plus size={20} />
          Đăng sản phẩm mới
        </Link>
      </div>

      {/* Filter Row */}
      <div className="bg-white/40 border-2 border-primary-brown/5 rounded-[2.5rem] p-4 flex flex-col md:flex-row gap-4 items-center backdrop-blur-sm shadow-sm">
        {/* Search */}
        <div className="relative w-full flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-brown/40" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm theo tên, SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-primary-brown/10 rounded-full focus:border-accent-red outline-none transition-all font-medium text-sm"
          />
        </div>

        {/* Category selector */}
        <div className="w-full md:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-5 py-3 bg-white border-2 border-primary-brown/10 rounded-full focus:border-accent-red outline-none transition-all font-bold text-sm text-primary-brown cursor-pointer"
          >
            <option value="all">Tất cả phân loại</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Reload button */}
        <button
          onClick={fetchInitialData}
          className="p-3 bg-white border-2 border-primary-brown/10 rounded-full hover:bg-highlight-yellow text-primary-brown transition-all shadow-sm flex items-center justify-center self-end md:self-auto cursor-pointer"
          title="Tải lại dữ liệu"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Product List Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 text-primary-brown/60 space-y-3">
          <Loader2 size={48} className="animate-spin text-accent-red" />
          <span className="text-sm font-bold">Đang tải danh sách sản phẩm...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-24 bg-white/30 border-2 border-dashed border-primary-brown/10 rounded-[3rem] text-primary-brown/50">
          <Layers size={48} className="mx-auto opacity-35 mb-4 text-accent-red" />
          <p className="text-lg font-bold">Không tìm thấy sản phẩm nào phù hợp.</p>
          <Link href="/admin/products/new" className="text-accent-red font-bold hover:underline mt-2 inline-block">
            Đăng sản phẩm mới ngay!
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
            return (
              <div
                key={product.id}
                className="group flex flex-col bg-white/40 border-2 border-primary-brown/5 rounded-[2.5rem] overflow-hidden hover:shadow-xl transition-all duration-300 relative"
              >
                {/* Product Thumbnail Banner */}
                <div className="aspect-[4/3] relative bg-secondary-pink/20 overflow-hidden flex items-center justify-center border-b-2 border-primary-brown/5">
                  <Image
                    src={product.images[0] || "/globe.svg"}
                    alt={product.name}
                    fill
                    className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Category Pill (Top Left) */}
                  <span className="absolute top-4 left-4 px-3 py-1 bg-white border border-primary-brown/5 text-primary-brown rounded-full text-xs font-bold shadow-sm uppercase tracking-wider">
                    {product.category.name}
                  </span>

                  {/* SKU prefix (Top Right) */}
                  {product.sku && (
                    <span className="absolute top-4 right-4 px-2.5 py-1 bg-accent-red/90 text-white rounded-lg text-xs font-black tracking-widest shadow-sm">
                      {product.sku}
                    </span>
                  )}
                </div>

                {/* Info and Actions */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-heading text-xl mb-1 text-primary-brown truncate" title={product.name}>
                      {product.name}
                    </h3>

                    {/* Price and Discount info */}
                    <div className="flex items-baseline gap-2 mb-3">
                      {product.hasDiscount && product.discountPrice ? (
                        <>
                          <span className="font-bold text-lg text-accent-red">
                            {product.discountPrice.toLocaleString("vi-VN")}đ
                          </span>
                          <span className="text-xs line-through text-primary-brown/40">
                            {product.price.toLocaleString("vi-VN")}đ
                          </span>
                          <span className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-[10px] font-black uppercase">
                            Giảm {Math.round((1 - product.discountPrice / product.price) * 100)}%
                          </span>
                        </>
                      ) : (
                        <span className="font-bold text-lg text-accent-red">
                          {product.price.toLocaleString("vi-VN")}đ
                        </span>
                      )}
                    </div>

                    {/* Variants and Stocks info */}
                    <div className="grid grid-cols-2 gap-3 p-3 bg-white/30 rounded-2xl border border-primary-brown/5 text-xs font-bold text-primary-brown/70">
                      <div>
                        <p className="text-primary-brown/40 text-[10px] uppercase tracking-wider mb-0.5">Biến thể</p>
                        <p className="flex items-center gap-1">
                          <Layers size={14} className="text-purple-600" />
                          {product.variants.length} mẫu
                        </p>
                      </div>
                      <div>
                        <p className="text-primary-brown/40 text-[10px] uppercase tracking-wider mb-0.5">Tổng kho</p>
                        <p className="flex items-center gap-1">
                          <span className={`w-2.5 h-2.5 rounded-full ${totalStock > 5 ? "bg-emerald-500" : "bg-red-500"}`} />
                          {totalStock} chiếc
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex gap-2 border-t border-primary-brown/5 pt-4">
                    {/* Quick adjust price */}
                    <button
                      onClick={() => handleOpenPriceEdit(product)}
                      className="flex-1 py-2.5 bg-highlight-yellow text-primary-brown font-bold rounded-full text-xs border border-primary-brown/10 hover:bg-highlight-yellow/80 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <DollarSign size={14} />
                      Sửa giá nhanh
                    </button>
                    
                    {/* Edit info */}
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="p-2.5 bg-white border border-primary-brown/10 hover:border-accent-red hover:bg-accent-red hover:text-white text-primary-brown rounded-full transition-all flex items-center justify-center cursor-pointer shadow-sm"
                      title="Chỉnh sửa chi tiết"
                    >
                      <Edit2 size={14} />
                    </Link>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2.5 bg-white border border-primary-brown/10 hover:border-red-500 hover:bg-red-500 hover:text-white text-primary-brown rounded-full transition-all flex items-center justify-center cursor-pointer shadow-sm"
                      title="Xóa sản phẩm"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QUICK PRICE EDIT DIALOG */}
      {editingPriceProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white/90 border-2 border-secondary-pink rounded-[3rem] p-8 max-w-md w-full shadow-2xl relative space-y-6">
            <button
              onClick={() => setEditingPriceProduct(null)}
              className="absolute top-6 right-6 p-2 text-primary-brown/40 hover:text-accent-red hover:bg-zinc-50 rounded-full transition-all cursor-pointer"
            >
              <X size={20} />
            </button>

            <div>
              <h2 className="text-2xl font-heading text-primary-brown mb-1 flex items-center gap-2">
                <DollarSign className="text-accent-red" />
                <span>Sửa giá cực nhanh</span>
              </h2>
              <p className="text-xs text-primary-brown/60">
                Chỉnh sửa giá trực tiếp cho sản phẩm <strong>{editingPriceProduct.name}</strong>
              </p>
            </div>

            {priceError && (
              <div className="bg-red-50 text-red-500 p-3 rounded-2xl text-xs text-center font-medium border border-red-100">
                {priceError}
              </div>
            )}

            <div className="space-y-4">
              {/* Base price */}
              <div>
                <label className="block text-xs font-bold mb-1.5 ml-3">Giá gốc sản phẩm (VNĐ)</label>
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="Nhập giá gốc..."
                  className="w-full px-4 py-3 bg-white border-2 border-primary-brown/10 rounded-full focus:border-accent-red outline-none transition-all text-sm font-bold"
                />
              </div>

              {/* Discount check */}
              <label className="flex items-center gap-2 ml-2 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={hasDiscount}
                  onChange={(e) => setHasDiscount(e.target.checked)}
                  className="w-4 h-4 rounded text-accent-red border-primary-brown/20 focus:ring-accent-red cursor-pointer"
                />
                <span className="text-xs font-bold group-hover:text-accent-red transition-colors flex items-center gap-1">
                  <Percent size={12} />
                  Sản phẩm này có giảm giá?
                </span>
              </label>

              {/* Discounted price */}
              {hasDiscount && (
                <div className="animate-in slide-in-from-top-2 duration-200">
                  <label className="block text-xs font-bold mb-1.5 ml-3 text-accent-red">Giá sau khi giảm (VNĐ)</label>
                  <input
                    type="number"
                    value={newDiscountPrice}
                    onChange={(e) => setNewDiscountPrice(e.target.value)}
                    placeholder="Nhập giá sau khi giảm..."
                    className="w-full px-4 py-3 bg-white border-2 border-accent-red/20 focus:border-accent-red rounded-full outline-none transition-all text-sm font-bold text-accent-red"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setEditingPriceProduct(null)}
                className="flex-1 py-3 bg-white hover:bg-zinc-50 border border-primary-brown/10 rounded-full font-bold text-sm cursor-pointer transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSavePrice}
                disabled={isPricePending}
                className="flex-1 py-3 bg-accent-red hover:bg-accent-red/90 text-white rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isPricePending ? <Loader2 size={16} className="animate-spin" /> : "Lưu giá trị"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM DIALOG */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white/90 border-2 border-red-200 rounded-[3rem] p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <Trash2 size={28} />
              </div>
              <h2 className="text-2xl font-heading text-primary-brown">Bạn có chắc chắn?</h2>
              <p className="text-sm leading-relaxed text-primary-brown/70">
                Hành động này sẽ <strong>xóa vĩnh viễn</strong> sản phẩm và <strong>tất cả các biến thể màu sắc, kích thước</strong> liên quan của nó khỏi cơ sở dữ liệu. Thao tác này không thể hoàn tác!
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeletingProductId(null)}
                disabled={isDeletePending}
                className="flex-1 py-3 bg-white hover:bg-zinc-50 border border-primary-brown/10 rounded-full font-bold text-sm cursor-pointer transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeletePending}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isDeletePending ? <Loader2 size={16} className="animate-spin" /> : "Xóa ngay lập tức"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
