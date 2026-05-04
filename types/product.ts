export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string;
  category_id: string;
  category_slug: string;
  size?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  is_featured?: boolean;
  stock_quantity: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}
