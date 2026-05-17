export interface ProductVariant {
  id: string;
  productId: string;
  sku?: string | null;
  color?: string | null;
  size?: string | null;
  price?: number | null;
  image?: string | null;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  code: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

export interface Product {
  id: string;
  name: string;
  sku?: string | null;
  description?: string | null;
  price: number;
  hasDiscount: boolean;
  discountPrice?: number | null;
  images: string[];
  sizes: string[];
  colors: string[];
  categoryId: string;
  category?: Category;
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}
