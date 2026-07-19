"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Plus, X, Image as ImageIcon, Sparkles, Tag, Layers, Loader2, DollarSign, Package, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { getCategoriesAction, createProductAction } from "@/app/actions/admin";

interface Category {
  id: string;
  name: string;
  code: string;
}

interface VariantState {
  sku: string;
  color: string;
  size: string;
  price: string;
  image: string;
  stock: number;
}

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Basic Form States
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountPrice, setDiscountPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Images List
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Attribute Tag States
  const [colors, setColors] = useState<string[]>([]);
  const [newColor, setNewColor] = useState("");
  const [sizes, setSizes] = useState<string[]>([]);
  const [newSize, setNewSize] = useState("");

  // Variants Grid State
  const [variants, setVariants] = useState<VariantState[]>([]);

  // Load phân loại danh mục ban đầu
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await getCategoriesAction();
        if (res.categories) {
          setCategories(res.categories);
          if (res.categories.length > 0) {
            setCategoryId(res.categories[0].id);
          }
        }
      } catch (err) {
        console.error("Không thể tải danh mục", err);
      } finally {
        setLoadingCats(false);
      }
    };
    fetchCats();
  }, []);

  // Tự động sinh/cập nhật danh sách biến thể dựa trên màu sắc và kích thước
  useEffect(() => {
    if (colors.length === 0 && sizes.length === 0) {
      setVariants([]);
      return;
    }

    const colorList = colors.length > 0 ? colors : [""];
    const sizeList = sizes.length > 0 ? sizes : [""];
    const newVariants: VariantState[] = [];

    colorList.forEach((c) => {
      sizeList.forEach((s) => {
        // Tạo SKU tiền tố tự động dựa trên SKU chung + màu + kích thước
        const cCode = c ? c.trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").substring(0, 3) : "";
        const sCode = s ? s.trim().toUpperCase().substring(0, 3) : "";
        
        let autoVariantSku = sku ? sku.trim().toUpperCase() : "PROD";
        if (cCode) autoVariantSku += `-${cCode}`;
        if (sCode) autoVariantSku += `-${sCode}`;

        // Giữ lại cấu hình cũ nếu trùng màu và kích thước để tránh mất công admin gõ lại
        const existing = variants.find((v) => v.color === c && v.size === s);
        
        newVariants.push({
          sku: existing ? existing.sku : autoVariantSku,
          color: c,
          size: s,
          price: existing ? existing.price : "",
          image: existing ? existing.image : "",
          stock: existing ? existing.stock : 10, // mặc định tồn kho là 10
        });
      });
    });

    setVariants(newVariants);
  }, [colors, sizes, sku]);

  // Thêm ảnh mới từ Input URL
  const handleAddImage = (url: string) => {
    if (!url) return;
    const cleanUrl = url.trim();
    if (!images.includes(cleanUrl)) {
      setImages([...images, cleanUrl]);
    }
    setNewImageUrl("");
  };

  // Upload ảnh từ thiết bị
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ chấp nhận file hình ảnh");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước file tối đa 5MB");
      return;
    }

    setIsUploadingImage(true);
    ;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Lỗi upload ảnh");
      }

      setImages((prev) => [...prev, data.url]);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsUploadingImage(false);
      // Xóa giá trị input để có thể chọn lại cùng 1 file
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  // Xóa ảnh
  const handleRemoveImage = (index: number) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
    
    // Reset ảnh của các biến thể nếu ảnh đó bị xóa
    const deletedImageUrl = images[index];
    setVariants(variants.map(v => v.image === deletedImageUrl ? { ...v, image: "" } : v));
  };

  // Thêm màu sắc
  const handleAddColor = () => {
    const clean = newColor.trim();
    if (clean && !colors.includes(clean)) {
      setColors([...colors, clean]);
    }
    setNewColor("");
  };

  // Xóa màu sắc
  const handleRemoveColor = (c: string) => {
    setColors(colors.filter(item => item !== c));
  };

  // Thêm kích thước
  const handleAddSize = () => {
    const clean = newSize.trim();
    if (clean && !sizes.includes(clean)) {
      setSizes([...sizes, clean]);
    }
    setNewSize("");
  };

  // Xóa kích thước
  const handleRemoveSize = (s: string) => {
    setSizes(sizes.filter(item => item !== s));
  };

  // Cập nhật trường trong biến thể cụ thể
  const handleUpdateVariant = (index: number, field: keyof VariantState, value: any) => {
    const updated = [...variants];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setVariants(updated);
  };

  // Submit Lưu Sản Phẩm
  const handleSaveProduct = () => {
    ;
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = "Vui lòng nhập tên sản phẩm!";
    }
    
    const basePriceNum = parseInt(price);
    if (isNaN(basePriceNum) || basePriceNum <= 0) {
      errors.price = "Vui lòng nhập giá gốc hợp lệ!";
    }

    let discPriceNum: number | undefined = undefined;
    if (hasDiscount) {
      discPriceNum = parseInt(discountPrice);
      if (isNaN(discPriceNum) || discPriceNum <= 0) {
        errors.discountPrice = "Vui lòng nhập giá giảm hợp lệ!";
      } else if (discPriceNum >= basePriceNum) {
        errors.discountPrice = "Giá giảm phải nhỏ hơn giá gốc sản phẩm!";
      }
    }

    if (images.length === 0) {
      errors.images = "Vui lòng thêm ít nhất 1 hình ảnh cho sản phẩm!";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Vui lòng kiểm tra lại các thông tin bị lỗi (in đỏ)!");
      return;
    }

    setFieldErrors({});

    // Format biến thể để gửi lên server action
    const formattedVariants = variants.map((v) => ({
      sku: v.sku.trim() || undefined,
      color: v.color || undefined,
      size: v.size || undefined,
      price: v.price ? parseInt(v.price) : undefined,
      image: v.image || undefined,
      stock: v.stock,
    }));

    startTransition(async () => {
      try {
        const res = await createProductAction({
          name: name.trim(),
          sku: sku.trim() || undefined,
          description: description.trim() || undefined,
          price: basePriceNum,
          hasDiscount,
          discountPrice: discPriceNum,
          images,
          sizes,
          colors,
          categoryId: categoryId || undefined,
          variants: formattedVariants,
        });

        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Thêm sản phẩm thành công!");
          router.push("/admin/products");
          router.refresh();
        }
      } catch (err) {
        toast.error("Đã xảy ra lỗi hệ thống trong quá trình đăng sản phẩm.");
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2.5 bg-white border border-primary-brown/10 hover:bg-highlight-yellow text-primary-brown rounded-full transition-all shadow-sm flex items-center justify-center cursor-pointer"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-4xl font-heading text-primary-brown">Đăng sản phẩm mới</h1>
            <p className="text-sm text-primary-brown/60">
              Nhập thông tin sản phẩm và tự động sinh các biến thể màu sắc, kích thước, ảnh tương ứng
            </p>
          </div>
        </div>
      </div>



      {/* Main Form Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Left Column: Basic Metadata & attributes (3 cols) */}
        <div className="lg:col-span-3 space-y-8">
          {/* Card 1: Core metadata */}
          <div className="bg-white/60 border-2 border-secondary-pink rounded-[3rem] p-6 md:p-8 backdrop-blur-md shadow-md space-y-5">
            <h2 className="text-2xl font-heading text-primary-brown flex items-center gap-2 border-b border-primary-brown/5 pb-3">
              <Sparkles size={20} className="text-accent-red" />
              <span>Thông tin cơ bản</span>
            </h2>

            {/* Product Name */}
            <div>
              <label className={`block text-xs font-bold mb-2 ml-4 ${fieldErrors.name ? "text-red-500" : ""}`}>Tên sản phẩm *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setFieldErrors(prev => ({...prev, name: ""})); }}
                placeholder="Ví dụ: Pouch hoa nhí thêu tay"
                className={`w-full px-5 py-3.5 bg-white border-2 rounded-full focus:outline-none transition-all text-sm font-medium ${fieldErrors.name ? "border-red-500 focus:border-red-500" : "border-primary-brown/10 focus:border-accent-red"}`}
              />
              {fieldErrors.name && <p className="text-red-500 text-xs font-bold mt-1.5 ml-4">{fieldErrors.name}</p>}
            </div>

            {/* SKU & Category selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-2 ml-4">Mã SKU tiền tố (không bắt buộc)</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="Ví dụ: CC07, LOTLY"
                  className="w-full px-5 py-3.5 bg-white border-2 border-primary-brown/10 rounded-full focus:border-accent-red outline-none transition-all text-sm font-bold uppercase tracking-wider"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-2 ml-4">Phân loại sản phẩm</label>
                {loadingCats ? (
                  <div className="w-full py-3.5 bg-white border-2 border-primary-brown/10 rounded-full flex items-center justify-center">
                    <Loader2 size={16} className="animate-spin text-accent-red" />
                  </div>
                ) : categories.length === 0 ? (
                  <div className="w-full px-5 py-3.5 bg-zinc-50 border-2 border-primary-brown/10 rounded-full text-sm font-medium text-primary-brown/50 italic">
                    Chưa có phân loại nào
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-5 py-3.5 bg-white border-2 border-primary-brown/10 rounded-full focus:border-accent-red outline-none transition-all text-sm font-bold text-primary-brown cursor-pointer appearance-none"
                    >
                      <option value="">-- Không chọn phân loại --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.code})
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-primary-brown/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div>
                <label className={`block text-xs font-bold mb-2 ml-4 ${fieldErrors.price ? "text-red-500" : ""}`}>Giá gốc (VNĐ) *</label>
                <div className="relative">
                  <DollarSign className={`absolute left-4 top-1/2 -translate-y-1/2 ${fieldErrors.price ? "text-red-500" : "text-primary-brown/40"}`} size={16} />
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => { setPrice(e.target.value); setFieldErrors(prev => ({...prev, price: ""})); }}
                    placeholder="120000"
                    className={`w-full pl-10 pr-4 py-3.5 bg-white border-2 rounded-full focus:outline-none transition-all text-sm font-bold ${fieldErrors.price ? "border-red-500 text-red-500 focus:border-red-500" : "border-primary-brown/10 focus:border-accent-red"}`}
                  />
                </div>
                {fieldErrors.price && <p className="text-red-500 text-xs font-bold mt-1.5 ml-4">{fieldErrors.price}</p>}
              </div>

              <div className="pb-3 flex items-center justify-center">
                <label className="flex items-center gap-2 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={hasDiscount}
                    onChange={(e) => setHasDiscount(e.target.checked)}
                    className="w-4 h-4 rounded text-accent-red border-primary-brown/20 focus:ring-accent-red cursor-pointer"
                  />
                  <span className="text-xs font-bold group-hover:text-accent-red transition-colors">
                    Có giảm giá?
                  </span>
                </label>
              </div>

              {hasDiscount && (
                <div className="animate-in slide-in-from-left-2 duration-200">
                  <label className={`block text-xs font-bold mb-2 ml-4 ${fieldErrors.discountPrice ? "text-red-500" : "text-accent-red"}`}>Giá sau giảm (VNĐ) *</label>
                  <div className="relative">
                    <DollarSign className={`absolute left-4 top-1/2 -translate-y-1/2 ${fieldErrors.discountPrice ? "text-red-500" : "text-accent-red/40"}`} size={16} />
                    <input
                      type="number"
                      value={discountPrice}
                      onChange={(e) => { setDiscountPrice(e.target.value); setFieldErrors(prev => ({...prev, discountPrice: ""})); }}
                      placeholder="95000"
                      className={`w-full pl-10 pr-4 py-3.5 bg-white border-2 rounded-full focus:outline-none transition-all text-sm font-bold ${fieldErrors.discountPrice ? "border-red-500 text-red-500 focus:border-red-500" : "border-accent-red/20 focus:border-accent-red text-accent-red"}`}
                    />
                  </div>
                  {fieldErrors.discountPrice && <p className="text-red-500 text-xs font-bold mt-1.5 ml-4">{fieldErrors.discountPrice}</p>}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold mb-2 ml-4">Mô tả sản phẩm</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập vài câu mô tả về câu chuyện của món quà xinh xắn này..."
                rows={4}
                className="w-full px-5 py-4 bg-white border-2 border-primary-brown/10 rounded-[2rem] focus:border-accent-red outline-none transition-all text-sm font-medium leading-relaxed resize-none"
              />
            </div>
          </div>

          {/* Card 2: Image Gallery */}
          <div className={`bg-white/60 border-2 rounded-[3rem] p-6 md:p-8 backdrop-blur-md shadow-md space-y-5 transition-colors ${fieldErrors.images ? "border-red-500" : "border-secondary-pink"}`}>
            <h2 className={`text-2xl font-heading flex items-center gap-2 border-b pb-3 ${fieldErrors.images ? "text-red-500 border-red-500/20" : "text-primary-brown border-primary-brown/5"}`}>
              <ImageIcon size={20} className={fieldErrors.images ? "text-red-500" : "text-accent-red"} />
              <span>Thư viện ảnh sản phẩm</span>
            </h2>
            {fieldErrors.images && <p className="text-red-500 text-sm font-bold">{fieldErrors.images}</p>}

            {/* Visual list of currently added images */}
            {images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {images.map((url, i) => (
                  <div
                    key={i}
                    className="aspect-square relative rounded-2xl border-2 border-primary-brown/10 overflow-hidden bg-white/70 group"
                  >
                    <img
                      src={url}
                      alt={`Product Upload ${i}`}
                      className="w-full h-full object-contain p-2 cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => setZoomedImage(url)}
                    />
                    {/* Delete overlay */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute top-2 right-2 w-7 h-7 bg-white/90 hover:bg-accent-red hover:text-white text-primary-brown border border-primary-brown/10 rounded-full flex items-center justify-center shadow-md transition-colors duration-200 cursor-pointer z-10"
                      title="Xóa ảnh này"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-primary-brown/10 rounded-[2rem] text-primary-brown/50 text-xs">
                Sản phẩm bắt buộc phải có ít nhất 1 ảnh. Hãy tải ảnh lên hoặc dán link ảnh.
              </div>
            )}

            {/* Image upload and paste link */}
            <div className="flex flex-col gap-5">
              {/* Drag and Drop / Upload Button Area */}
              <div className="relative group rounded-[2rem] border-2 border-dashed border-primary-brown/20 bg-white/50 hover:bg-white/80 hover:border-accent-red/50 transition-all p-8 flex flex-col items-center justify-center gap-3 text-center cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadImage}
                  disabled={isUploadingImage}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                />
                <div className="w-14 h-14 rounded-full bg-accent-red/10 text-accent-red flex items-center justify-center group-hover:scale-110 transition-transform">
                  {isUploadingImage ? (
                    <Loader2 size={28} className="animate-spin" />
                  ) : (
                    <Upload size={28} />
                  )}
                </div>
                <div>
                  <p className="font-bold text-primary-brown text-sm md:text-base">
                    {isUploadingImage ? "Đang xử lý tải ảnh..." : "Nhấn hoặc kéo thả để tải ảnh từ máy"}
                  </p>
                  <p className="text-xs text-primary-brown/50 mt-1.5">Chấp nhận JPG, PNG, WebP (Tối đa 5MB)</p>
                </div>
              </div>

              <div className="flex items-center gap-3 px-4">
                <div className="flex-1 h-px bg-primary-brown/10"></div>
                <span className="text-xs font-bold text-primary-brown/40 uppercase tracking-widest">Hoặc</span>
                <div className="flex-1 h-px bg-primary-brown/10"></div>
              </div>

              {/* Paste URL */}
              <div className="flex gap-2 relative z-20">
                <input
                  type="text"
                  placeholder="Dán link ảnh có sẵn (https://...)"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 px-5 py-3.5 bg-white border-2 border-primary-brown/10 rounded-full focus:border-accent-red outline-none text-sm transition-colors font-medium"
                />
                <button
                  type="button"
                  onClick={() => handleAddImage(newImageUrl)}
                  disabled={!newImageUrl.trim()}
                  className="px-6 py-3.5 bg-white text-primary-brown font-bold border-2 border-primary-brown/10 rounded-full text-sm shadow-sm hover:bg-highlight-yellow hover:border-highlight-yellow hover:text-primary-brown cursor-pointer flex items-center gap-2 flex-shrink-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-primary-brown/10"
                >
                  <Plus size={16} />
                  Thêm từ link
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Custom Attribute Tag Editors (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Card 3: Color tags */}
          <div className="bg-white/60 border-2 border-secondary-pink rounded-[3rem] p-6 md:p-8 backdrop-blur-md shadow-md space-y-4">
            <h2 className="text-2xl font-heading text-primary-brown flex items-center gap-2 border-b border-primary-brown/5 pb-3">
              <Tag size={20} className="text-accent-red" />
              <span>Màu sắc có sẵn</span>
            </h2>

            {/* Colors tags wrapper */}
            <div className="flex flex-wrap gap-2">
              {colors.length === 0 ? (
                <span className="text-xs text-primary-brown/40 italic">Chưa thêm màu nào. Nhập và bấm Thêm...</span>
              ) : (
                colors.map((c) => (
                  <span
                    key={c}
                    className="pl-3 pr-1.5 py-1.5 bg-accent-red/10 border border-accent-red/20 text-accent-red rounded-full text-xs font-bold flex items-center gap-1.5 animate-in zoom-in-75 duration-200"
                  >
                    {c}
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(c)}
                      className="p-0.5 hover:bg-accent-red hover:text-white rounded-full transition-colors cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Add color input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ví dụ: Hồng hoa nhí, Vàng pastel"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddColor())}
                className="flex-1 px-4 py-2.5 bg-white border border-primary-brown/10 rounded-full focus:border-accent-red outline-none text-xs font-medium"
              />
              <button
                type="button"
                onClick={handleAddColor}
                disabled={!newColor.trim()}
                className="px-4 py-2 bg-accent-red text-white font-bold rounded-full text-xs shadow-sm hover:bg-accent-red/90 cursor-pointer flex items-center gap-1 flex-shrink-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-accent-red"
              >
                <Plus size={14} />
                Thêm
              </button>
            </div>
          </div>

          {/* Card 4: Size tags */}
          <div className="bg-white/60 border-2 border-secondary-pink rounded-[3rem] p-6 md:p-8 backdrop-blur-md shadow-md space-y-4">
            <h2 className="text-2xl font-heading text-primary-brown flex items-center gap-2 border-b border-primary-brown/5 pb-3">
              <Layers size={20} className="text-accent-red" />
              <span>Kích thước có sẵn</span>
            </h2>

            {/* Sizes tags wrapper */}
            <div className="flex flex-wrap gap-2">
              {sizes.length === 0 ? (
                <span className="text-xs text-primary-brown/40 italic">Chưa thêm kích thước nào. Nhập và bấm Thêm...</span>
              ) : (
                sizes.map((s) => (
                  <span
                    key={s}
                    className="pl-3 pr-1.5 py-1.5 bg-primary-brown/10 border border-primary-brown/20 text-primary-brown rounded-full text-xs font-bold flex items-center gap-1.5 animate-in zoom-in-75 duration-200"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(s)}
                      className="p-0.5 hover:bg-primary-brown hover:text-white rounded-full transition-colors cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Add size input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ví dụ: S, M, L, FreeSize"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSize())}
                className="flex-1 px-4 py-2.5 bg-white border border-primary-brown/10 rounded-full focus:border-accent-red outline-none text-xs font-medium"
              />
              <button
                type="button"
                onClick={handleAddSize}
                disabled={!newSize.trim()}
                className="px-4 py-2 bg-accent-red text-white font-bold rounded-full text-xs shadow-sm hover:bg-accent-red/90 cursor-pointer flex items-center gap-1 flex-shrink-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-accent-red"
              >
                <Plus size={14} />
                Thêm
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DYNAMIC AUTO-GENERATED VARIANTS LIST (Full width row) */}
      {variants.length > 0 && (
        <section className="bg-white/40 border-2 border-primary-brown/5 rounded-[3rem] p-6 md:p-8 backdrop-blur-sm shadow-md space-y-6">
          <div>
            <h2 className="text-2xl font-heading text-primary-brown flex items-center gap-2">
              <Package size={22} className="text-accent-red animate-pulse" />
              <span>Sinh biến thể tự động ({variants.length} tổ hợp)</span>
            </h2>
            <p className="text-xs text-primary-brown/60 mt-1">
              Hệ thống tự động đồng bộ khi bạn thêm màu sắc, kích thước. Bạn có thể thay đổi SKU cụ thể, nhập số lượng tồn kho riêng, giá bán riêng (nếu đắt hơn), hoặc liên kết hình ảnh tương ứng.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs font-bold">
              <thead>
                <tr className="border-b border-primary-brown/10 text-primary-brown/60 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Phân loại cụ thể</th>
                  <th className="py-3 px-3">SKU Biến thể</th>
                  <th className="py-3 px-3 w-32">Tồn kho</th>
                  <th className="py-3 px-3 w-40">Giá riêng (VNĐ)</th>
                  <th className="py-3 px-3 w-48">Ảnh tương ứng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-brown/5 font-medium">
                {variants.map((v, index) => (
                  <tr key={index} className="hover:bg-white/20 transition-colors">
                    {/* Size and color info */}
                    <td className="py-3 px-3 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        {v.color && (
                          <span className="px-2.5 py-0.5 bg-accent-red/10 border border-accent-red/20 text-accent-red rounded-lg text-xs font-bold uppercase">
                            Màu: {v.color}
                          </span>
                        )}
                        {v.size && (
                          <span className="px-2.5 py-0.5 bg-primary-brown/10 border border-primary-brown/20 text-primary-brown rounded-lg text-xs font-bold">
                            Kích thước: {v.size}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Auto-filled SKU variant */}
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) => handleUpdateVariant(index, "sku", e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-primary-brown/10 rounded-full focus:border-accent-red outline-none text-xs uppercase font-bold"
                      />
                    </td>

                    {/* Stock input */}
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        min="0"
                        value={v.stock}
                        onChange={(e) => handleUpdateVariant(index, "stock", parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-white border border-primary-brown/10 rounded-full focus:border-accent-red outline-none text-xs font-bold text-center"
                      />
                    </td>

                    {/* Variant-specific price override */}
                    <td className="py-3 px-3">
                      <div className="relative">
                        <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 text-primary-brown/40" size={12} />
                        <input
                          type="number"
                          placeholder="Mặc định"
                          value={v.price}
                          onChange={(e) => handleUpdateVariant(index, "price", e.target.value)}
                          className="w-full pl-6 pr-2 py-2 bg-white border border-primary-brown/10 rounded-full focus:border-accent-red outline-none text-xs font-bold"
                        />
                      </div>
                    </td>

                    {/* Bind with product images list */}
                    <td className="py-3 px-3">
                      <select
                        value={v.image}
                        onChange={(e) => handleUpdateVariant(index, "image", e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-primary-brown/10 rounded-full focus:border-accent-red outline-none text-xs font-bold text-primary-brown cursor-pointer"
                      >
                        <option value="">Không có ảnh riêng</option>
                        {images.map((url, imgIndex) => (
                          <option key={imgIndex} value={url}>
                            Ảnh {imgIndex + 1}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}


      {/* Action Footer */}
      <div className="pt-2 pb-8 flex justify-end">
        <button
          onClick={handleSaveProduct}
          disabled={isPending}
          className="px-8 py-4 bg-accent-red text-white font-bold rounded-full text-lg shadow-[0_6px_0_rgb(130,46,38)] hover:shadow-[0_3px_0_rgb(130,46,38)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            <>
              <Save size={24} />
              Lưu & Đăng bán ngay
            </>
          )}
        </button>
      </div>

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 cursor-zoom-out"
          onClick={() => setZoomedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/30 text-white rounded-full transition-colors z-10 cursor-pointer"
            onClick={(e) => { e.stopPropagation(); setZoomedImage(null); }}
          >
            <X size={24} />
          </button>
          <img 
            src={zoomedImage} 
            alt="Zoomed" 
            className="max-w-full max-h-[90vh] object-contain select-none shadow-2xl rounded-lg"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
}
