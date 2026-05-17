"use server";

import { prisma } from "@/lib/prisma";
import { Product, Category } from "@/types/product";

export interface GetProductsParams {
  categoryId?: string;
  search?: string;
  sizes?: string[];
  colors?: string[];
  sort?: string;
  page?: number;
  limit?: number;
}

/**
 * Lấy danh sách sản phẩm từ PostgreSQL với các bộ lọc động nâng cao
 */
export async function getProductsAction(params: GetProductsParams) {
  try {
    const { categoryId, search, sizes, colors, sort, page = 1, limit = 6 } = params;
    const skip = (page - 1) * limit;

    // Đối tượng chứa các điều kiện lọc Prisma
    const where: any = {};

    // 1. Lọc theo danh mục
    if (categoryId && categoryId !== "all" && categoryId !== "Tất cả sản phẩm") {
      where.categoryId = categoryId;
    }

    // 2. Lọc theo từ khóa tìm kiếm
    if (search && search.trim() !== "") {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // 3. Lọc theo kích thước (nếu mảng sizes có phần tử)
    if (sizes && sizes.length > 0) {
      where.sizes = {
        hasSome: sizes,
      };
    }

    // 4. Lọc theo màu sắc (nếu mảng colors có phần tử)
    if (colors && colors.length > 0) {
      where.colors = {
        hasSome: colors,
      };
    }

    // 5. Cấu hình sắp xếp (Sorting)
    let orderBy: any = { createdAt: "desc" };
    if (sort === "name-asc") {
      orderBy = { name: "asc" };
    } else if (sort === "name-desc") {
      orderBy = { name: "desc" };
    } else if (sort === "price-asc") {
      orderBy = { price: "asc" };
    } else if (sort === "price-desc") {
      orderBy = { price: "desc" };
    }

    // Chạy song song truy vấn lấy sản phẩm và đếm tổng số lượng sản phẩm thỏa mãn điều kiện
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          variants: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    // Trả về dữ liệu dạng JSON thuần túy (Next.js Server Actions yêu cầu serialize)
    return {
      success: true,
      products: JSON.parse(JSON.stringify(products)) as Product[],
      totalCount,
      hasMore: skip + products.length < totalCount,
    };
  } catch (error: any) {
    return {
      success: false,
      products: [],
      totalCount: 0,
      hasMore: false,
      error: error.message || "Đã xảy ra lỗi khi lấy danh sách sản phẩm.",
    };
  }
}

/**
 * Lấy danh sách danh mục phân loại thực tế kèm số lượng sản phẩm của mỗi phân loại
 */
export async function getCategoriesWithCountAction() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return {
      success: true,
      categories: JSON.parse(JSON.stringify(categories)) as Category[],
    };
  } catch (error: any) {
    return {
      success: false,
      categories: [],
      error: error.message || "Đã xảy ra lỗi khi lấy danh mục phân loại.",
    };
  }
}

/**
 * Lấy động tất cả các kích cỡ và màu sắc hiện đang có trên toàn bộ sản phẩm trong database
 */
export async function getProductFiltersAction() {
  try {
    const products = await prisma.product.findMany({
      select: {
        sizes: true,
        colors: true,
      },
    });

    // Lọc trùng và loại bỏ phần tử rỗng
    const uniqueSizes = Array.from(new Set(products.flatMap((p) => p.sizes)))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    const uniqueColors = Array.from(new Set(products.flatMap((p) => p.colors)))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    return {
      success: true,
      sizes: uniqueSizes,
      colors: uniqueColors,
    };
  } catch (error: any) {
    return {
      success: false,
      sizes: [],
      colors: [],
      error: error.message || "Đã xảy ra lỗi khi tải bộ lọc sản phẩm.",
    };
  }
}
