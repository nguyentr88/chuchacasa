"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

/**
 * Kiểm tra xem người dùng hiện tại có phải là Admin hay không
 */
async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Không có quyền truy cập. Bạn phải là Admin.");
  }
  return session;
}

// ==========================================
// CATEGORY ACTIONS
// ==========================================

export async function createCategoryAction(code: string, name: string) {
  try {
    await requireAdmin();

    if (!code || !name) {
      return { error: "Mã loại và tên loại không được để trống!" };
    }

    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();

    // Kiểm tra trùng lặp mã loại
    const existing = await prisma.category.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      return { error: `Mã loại "${cleanCode}" đã tồn tại!` };
    }

    const category = await prisma.category.create({
      data: {
        code: cleanCode,
        name: cleanName,
      },
    });

    revalidatePath("/admin/categories");
    return { success: "Thêm phân loại mới thành công!", category };
  } catch (error: any) {
    return { error: error.message || "Đã xảy ra lỗi khi tạo phân loại." };
  }
}

export async function getCategoriesAction() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: "asc" },
    });
    return { categories };
  } catch (error: any) {
    return { error: error.message || "Không thể lấy danh sách phân loại." };
  }
}

// ==========================================
// PRODUCT ACTIONS
// ==========================================

export interface VariantInput {
  sku?: string;
  color?: string;
  size?: string;
  price?: number;
  image?: string;
  stock: number;
}

export interface CreateProductInput {
  name: string;
  sku?: string;
  description?: string;
  price: number;
  hasDiscount: boolean;
  discountPrice?: number;
  images: string[];
  sizes: string[];
  colors: string[];
  categoryId: string;
  variants: VariantInput[];
}

export async function createProductAction(data: CreateProductInput) {
  try {
    await requireAdmin();

    if (!data.name || !data.price || !data.categoryId) {
      return { error: "Vui lòng điền đầy đủ các thông tin bắt buộc!" };
    }

    // Thực hiện tạo sản phẩm và các biến thể trong 1 Transaction
    const product = await prisma.$transaction(async (tx) => {
      // 1. Tạo sản phẩm chính
      const newProduct = await tx.product.create({
        data: {
          name: data.name,
          sku: data.sku || null,
          description: data.description || null,
          price: data.price,
          hasDiscount: data.hasDiscount,
          discountPrice: data.hasDiscount ? (data.discountPrice || null) : null,
          images: data.images,
          sizes: data.sizes,
          colors: data.colors,
          categoryId: data.categoryId,
        },
      });

      // 2. Tạo danh sách các biến thể nếu có
      if (data.variants && data.variants.length > 0) {
        const variantData = data.variants.map((v) => ({
          productId: newProduct.id,
          sku: v.sku || null,
          color: v.color || null,
          size: v.size || null,
          price: v.price || null,
          image: v.image || null,
          stock: v.stock || 0,
        }));

        await tx.productVariant.createMany({
          data: variantData,
        });
      }

      return newProduct;
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    return { success: "Tạo sản phẩm thành công!", productId: product.id };
  } catch (error: any) {
    return { error: error.message || "Đã xảy ra lỗi khi tạo sản phẩm." };
  }
}

export async function updateProductAction(id: string, data: CreateProductInput) {
  try {
    await requireAdmin();

    if (!id || !data.name || !data.price || !data.categoryId) {
      return { error: "Vui lòng điền đầy đủ các thông tin bắt buộc!" };
    }

    await prisma.$transaction(async (tx) => {
      // 1. Cập nhật thông tin cơ bản sản phẩm
      await tx.product.update({
        where: { id },
        data: {
          name: data.name,
          sku: data.sku || null,
          description: data.description || null,
          price: data.price,
          hasDiscount: data.hasDiscount,
          discountPrice: data.hasDiscount ? (data.discountPrice || null) : null,
          images: data.images,
          sizes: data.sizes,
          colors: data.colors,
          categoryId: data.categoryId,
        },
      });

      // 2. Xóa toàn bộ các biến thể cũ
      await tx.productVariant.deleteMany({
        where: { productId: id },
      });

      // 3. Tạo lại danh sách các biến thể mới
      if (data.variants && data.variants.length > 0) {
        const variantData = data.variants.map((v) => ({
          productId: id,
          sku: v.sku || null,
          color: v.color || null,
          size: v.size || null,
          price: v.price || null,
          image: v.image || null,
          stock: v.stock || 0,
        }));

        await tx.productVariant.createMany({
          data: variantData,
        });
      }
    });

    revalidatePath("/admin/products");
    revalidatePath(`/products/${id}`);
    revalidatePath("/products");
    return { success: "Cập nhật sản phẩm thành công!" };
  } catch (error: any) {
    return { error: error.message || "Đã xảy ra lỗi khi cập nhật sản phẩm." };
  }
}

export async function deleteProductAction(id: string) {
  try {
    await requireAdmin();

    // Do Cascade delete được khai báo trong Prisma,
    // khi xóa Product, các ProductVariant liên quan sẽ tự động bị xóa.
    await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    return { success: "Xóa sản phẩm thành công!" };
  } catch (error: any) {
    return { error: error.message || "Đã xảy ra lỗi khi xóa sản phẩm." };
  }
}

export async function updateProductPriceAction(id: string, price: number, discountPrice?: number | null) {
  try {
    await requireAdmin();

    if (!id || price < 0) {
      return { error: "Thông tin giá trị không hợp lệ!" };
    }

    const hasDiscount = discountPrice !== undefined && discountPrice !== null && discountPrice > 0;

    await prisma.product.update({
      where: { id },
      data: {
        price,
        hasDiscount,
        discountPrice: hasDiscount ? discountPrice : null,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath(`/products/${id}`);
    revalidatePath("/products");
    return { success: "Điều chỉnh giá sản phẩm thành công!" };
  } catch (error: any) {
    return { error: error.message || "Đã xảy ra lỗi khi cập nhật giá sản phẩm." };
  }
}

export async function getAdminProductsAction() {
  try {
    await requireAdmin();

    const products = await prisma.product.findMany({
      include: {
        category: true,
        variants: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { products };
  } catch (error: any) {
    return { error: error.message || "Không thể lấy danh sách sản phẩm quản trị." };
  }
}

export async function getProductByIdAction(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
      },
    });

    if (!product) {
      return { error: "Không tìm thấy sản phẩm!" };
    }

    return { product };
  } catch (error: any) {
    return { error: error.message || "Đã xảy ra lỗi khi lấy chi tiết sản phẩm." };
  }
}
