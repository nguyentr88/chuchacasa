"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Plus, X, Image as ImageIcon, Sparkles, Tag, Layers, Loader2, DollarSign, Package, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { getCategoriesAction, updateProductAction } from "@/app/actions/admin";

interface Category {
  id: string;
  name: string;
  code: string;
}

interface VariantState {
  id?: string;
  sku: string;
  color: string;
  size: string;
  price: string;
  image: string;
  stock: number;
}

interface EditProductFormProps {
  product: {
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
    variants: Array<{
      id: string;
      sku: string | null;
      color: string | null;
      size: string | null;
      price: number | null;
      image: string | null;
      stock: number;
    }>;
  };
}

export default function EditProductForm({ product }: EditProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Basic Form States
  const [name, setName] = useState(product.name);
  const [sku, setSku] = useState(product.sku || "");
  const [description, setDescription] = useState(product.description || "");
  const [price, setPrice] = useState(product.price.toString());
  const [hasDiscount, setHasDiscount] = useState(product.hasDiscount);
  const [discountPrice, setDiscountPrice] = useState(product.discountPrice ? product.discountPrice.toString() : "");
  const [categoryId, setCategoryId] = useState(product.categoryId);


  // Images List
  const [images, setImages] = useState<string[]>(product.images);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Preset cute placeholders for testing
  const presetImages = [
    "/logo/chucha-avatar.jpg",
    "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=300",
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=300",
    "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=300"
  ];

  // Attribute Tag States
  const [colors, setColors] = useState<string[]>(product.colors);
  const [newColor, setNewColor] = useState("");
  const [sizes, setSizes] = useState<string[]>(product.sizes);
  const [newSize, setNewSize] = useState("");

  // Initialized variants list
  const initialVariants = product.variants.map((v) => ({
    id: v.id,
    sku: v.sku || "",
    color: v.color || "",
    size: v.size || "",
    price: v.price ? v.price.toString() : "",
    image: v.image || "",
    stock: v.stock,
  }));

  // Variants Grid State
  const [variants, setVariants] = useState<VariantState[]>(initialVariants);

  // Load phân loại danh mục ban đầu
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await getCategoriesAction();
        if (res.categories) {
          setCategories(res.categories);
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
  // Nhưng ưu tiên giữ lại các cấu hình đang chỉnh sửa hoặc cấu hình đã có sẵn của DB
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

        // Kiểm tra xem tổ hợp này có khớp với một biến thể hiện tại (đang gõ hoặc từ DB) không
        const existing = variants.find((v) => v.color === c && v.size === s) ||
          initialVariants.find((v) => v.color === c && v.size === s);

        newVariants.push({
          id: existing?.id,
          sku: existing ? existing.sku : autoVariantSku,
          color: c,
          size: s,
          price: existing ? existing.price : "",
          image: existing ? existing.image : "",
          stock: existing ? existing.stock : 10,
        });
      });
    });

    setVariants(newVariants);
  }, [colors, sizes, sku]);

  // Thêm ảnh mới từ Input
  const handleAddImage = (url: string) => {
    if (!url) return;
    const cleanUrl = url.trim();
    if (!images.includes(cleanUrl)) {
      setImages([...images, cleanUrl]);
    }
    setNewImageUrl("");
  };

  // Upload ảnh từ máy tính
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append("file", file);

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
      if (e.target) e.target.value = '';
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

  // Submit Cập nhật Sản Phẩm
  const handleSaveProduct = () => {

    if (!name.trim()) {
      toast.error("Vui lòng nhập tên sản phẩm!");
      return;
    }

    const basePriceNum = parseInt(price);
    if (isNaN(basePriceNum) || basePriceNum <= 0) {
      toast.error("Vui lòng nhập giá gốc hợp lệ!");
      return;
    }

    let discPriceNum: number | undefined = undefined;
    if (hasDiscount) {
      discPriceNum = parseInt(discountPrice);
      if (isNaN(discPriceNum) || discPriceNum <= 0) {
        toast.error("Vui lòng nhập giá giảm hợp lệ!");
        return;
      }
      if (discPriceNum >= basePriceNum) {
        toast.error("Giá giảm phải nhỏ hơn giá gốc sản phẩm!");
        return;
      }
    }

    if (!categoryId) {
      toast.error("Vui lòng chọn phân loại sản phẩm!");
      return;
    }

    if (images.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 hình ảnh cho sản phẩm!");
      return;
    }

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
        const res = await updateProductAction(product.id, {
          name: name.trim(),
          sku: sku.trim() || undefined,
          description: description.trim() || undefined,
          price: basePriceNum,
          hasDiscount,
          discountPrice: discPriceNum,
          images,
          sizes,
          colors,
          categoryId,
          variants: formattedVariants,
        });

        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Cập nhật sản phẩm thành công!");
          router.push("/admin/products");
          router.refresh();
        }
      } catch (err) {
        toast.error("Đã xảy ra lỗi hệ thống trong quá trình cập nhật sản phẩm.");
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
            <h1 className="text-4xl font-heading text-primary-brown">Chỉnh sửa chi tiết</h1>
            <p className="text-sm text-primary-brown/60">
              Đang chỉnh sửa: <strong>{product.name}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveProduct}
          disabled={isPending}
          className="px-6 py-3.5 bg-accent-red text-white font-bold rounded-full text-base shadow-[0_5px_0_rgb(130,46,38)] hover:shadow-[0_2px_0_rgb(130,46,38)] hover:translate-y-[3px] active:shadow-none active:translate-y-[5px] transition-all flex items-center gap-2 cursor-pointer shadow-md self-stretch sm:self-auto justify-center disabled:opacity-70"
        >
          {isPending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              <Save size={18} />
              Lưu thay đổi
            </>
          )}
        </button>
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
              <label className="block text-xs font-bold mb-2 ml-4">Tên sản phẩm *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Pouch hoa nhí thêu tay"
                className="w-full px-5 py-3.5 bg-white border-2 border-primary-brown/10 rounded-full focus:border-accent-red outline-none transition-all text-sm font-medium"
              />
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
                <label className="block text-xs font-bold mb-2 ml-4">Phân loại sản phẩm *</label>
                {loadingCats ? (
                  <div className="w-full py-3.5 bg-white border-2 border-primary-brown/10 rounded-full flex items-center justify-center">
                    <Loader2 size={16} className="animate-spin text-accent-red" />
                  </div>
                ) : (
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-5 py-3.5 bg-white border-2 border-primary-brown/10 rounded-full focus:border-accent-red outline-none transition-all text-sm font-bold text-primary-brown cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold mb-2 ml-4">Giá gốc (VNĐ) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-brown/40" size={16} />
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="120000"
                    className="w-full pl-10 pr-4 py-3.5 bg-white border-2 border-primary-brown/10 rounded-full focus:border-accent-red outline-none transition-all text-sm font-bold"
                  />
                </div>
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
                  <label className="block text-xs font-bold mb-2 ml-4 text-accent-red">Giá sau giảm (VNĐ) *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-accent-red/40" size={16} />
                    <input
                      type="number"
                      value={discountPrice}
                      onChange={(e) => setDiscountPrice(e.target.value)}
                      placeholder="95000"
                      className="w-full pl-10 pr-4 py-3.5 bg-white border-2 border-accent-red/20 focus:border-accent-red rounded-full outline-none transition-all text-sm font-bold text-accent-red"
                    />
                  </div>
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
          <div className="bg-white/60 border-2 border-secondary-pink rounded-[3rem] p-6 md:p-8 backdrop-blur-md shadow-md space-y-5">
            <h2 className="text-2xl font-heading text-primary-brown flex items-center gap-2 border-b border-primary-brown/5 pb-3">
              <ImageIcon size={20} className="text-accent-red" />
              <span>Thư viện ảnh sản phẩm</span>
            </h2>

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
                      className="w-full h-full object-contain p-2"
                    />
                    {/* Delete overlay */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute inset-0 bg-accent-red/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-200 cursor-pointer"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-primary-brown/10 rounded-[2rem] text-primary-brown/50 text-xs">
                Chưa có ảnh nào. Vui lòng thêm từ Preset bên dưới hoặc dán link ảnh.
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

            {/* Cute presets library */}
            <div className="pt-2">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-primary-brown/40 mb-2">
                Click để thử thêm ảnh preset cute mẫu:
              </span>
              <div className="flex flex-wrap gap-2">
                {presetImages.map((pUrl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAddImage(pUrl)}
                    className="h-10 px-3 bg-white hover:bg-highlight-yellow/50 border border-primary-brown/10 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer text-xs font-bold text-primary-brown/80"
                  >
                    <span className="w-5 h-5 overflow-hidden rounded relative flex items-center justify-center border border-primary-brown/5 bg-secondary-pink/20">
                      <img src={pUrl} className="object-contain w-full h-full p-0.5" />
                    </span>
                    Ảnh mẫu {i + 1}
                  </button>
                ))}
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
                    className="pl-3 pr-1.5 py-1.5 bg-accent-red/10 border border-accent-red/20 text-accent-red rounded-full text-xs font-bold flex items-center gap-1.5"
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
                    className="pl-3 pr-1.5 py-1.5 bg-primary-brown/10 border border-primary-brown/20 text-primary-brown rounded-full text-xs font-bold flex items-center gap-1.5"
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
              Đồng bộ ngay khi chỉnh sửa thuộc tính. Các giá trị SKU, tồn kho, giá bán riêng và ảnh tương ứng đã cài đặt sẽ được bảo toàn nếu vẫn tồn tại màu/kích thước đó.
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

                    {/* SKU variant */}
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) => handleUpdateVariant(index, "sku", e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-primary-brown/10 rounded-full focus:border-accent-red outline-none text-xs uppercase font-bold"
                      />
                    </td>

                    {/* Stock */}
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        min="0"
                        value={v.stock}
                        onChange={(e) => handleUpdateVariant(index, "stock", parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-white border border-primary-brown/10 rounded-full focus:border-accent-red outline-none text-xs font-bold text-center"
                      />
                    </td>

                    {/* Override price */}
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

                    {/* Image binder */}
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
    </div>
  );
}
