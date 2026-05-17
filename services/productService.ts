import { prisma } from "@/lib/prisma";
import { Product } from "@/types/product";

export class ProductError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = "ProductError";
  }
}

export const ProductService = {
  /**
   * Lấy danh sách sản phẩm, hỗ trợ lọc theo ID của category
   */
  async getAll(categoryId?: string): Promise<Product[]> {
    try {
      const products = await prisma.product.findMany({
        where: categoryId ? { categoryId } : {},
        include: {
          category: true,
          variants: true,
        },
        orderBy: { createdAt: "desc" },
      });
      return JSON.parse(JSON.stringify(products)) as Product[];
    } catch (error: any) {
      throw new ProductError("Không thể lấy danh sách sản phẩm", error);
    }
  },

  /**
   * Tìm kiếm sản phẩm theo tên (không phân biệt hoa thường)
   */
  async search(searchTerm: string): Promise<Product[]> {
    try {
      const products = await prisma.product.findMany({
        where: {
          name: { contains: searchTerm, mode: "insensitive" },
        },
        include: {
          category: true,
          variants: true,
        },
        orderBy: { createdAt: "desc" },
      });
      return JSON.parse(JSON.stringify(products)) as Product[];
    } catch (error: any) {
      throw new ProductError(`Lỗi tìm kiếm sản phẩm với từ khóa: ${searchTerm}`, error);
    }
  },

  /**
   * Lấy chi tiết một sản phẩm theo ID
   */
  async getById(id: string): Promise<Product> {
    try {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
          variants: true,
        },
      });

      if (!product) {
        throw new Error("Không tìm thấy sản phẩm");
      }

      return JSON.parse(JSON.stringify(product)) as Product;
    } catch (error: any) {
      throw new ProductError(`Không tìm thấy sản phẩm với ID: ${id}`, error);
    }
  }
};
