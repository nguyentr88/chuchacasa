import { supabase } from "@/lib/supabase";
import { Product } from "@/types/product";

export class ProductError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = "ProductError";
  }
}

export const ProductService = {
  /**
   * Lấy danh sách sản phẩm, hỗ trợ lọc theo slug của category
   */
  async getAll(categorySlug?: string): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    // Chỉ lọc nếu có categorySlug (không phụ thuộc vào nhãn UI "Tất cả")
    if (categorySlug) {
      query = query.eq('category_slug', categorySlug);
    }

    const { data, error } = await query;

    if (error) {
      throw new ProductError("Không thể lấy danh sách sản phẩm", error);
    }

    return data as Product[];
  },

  /**
   * Tìm kiếm sản phẩm theo tên (không phân biệt hoa thường)
   */
  async search(searchTerm: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .ilike('name', `%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new ProductError(`Lỗi tìm kiếm sản phẩm với từ khóa: ${searchTerm}`, error);
    }

    return data as Product[];
  },

  /**
   * Lấy chi tiết một sản phẩm theo ID
   */
  async getById(id: string): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new ProductError(`Không tìm thấy sản phẩm với ID: ${id}`, error);
    }

    return data as Product;
  }
};
