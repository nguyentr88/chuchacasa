"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

/**
 * Cập nhật thông tin Profile (Tên, Ảnh đại diện)
 */
export async function updateProfileAction({
  name,
  image,
}: {
  name: string;
  image?: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Bạn chưa đăng nhập." };
    }

    if (!name.trim()) {
      return { success: false, message: "Tên không được để trống." };
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        ...(image && { image }),
      },
    });

    return { success: true, message: "Cập nhật hồ sơ thành công!" };
  } catch (error: any) {
    console.error("Lỗi cập nhật hồ sơ:", error);
    return { success: false, message: "Đã xảy ra lỗi hệ thống." };
  }
}

/**
 * Cập nhật Mật khẩu
 */
export async function updatePasswordAction({
  currentPassword,
  newPassword,
}: {
  currentPassword?: string;
  newPassword: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Bạn chưa đăng nhập." };
    }

    if (newPassword.length < 6) {
      return { success: false, message: "Mật khẩu mới phải có ít nhất 6 ký tự." };
    }

    // Lấy thông tin user hiện tại
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return { success: false, message: "Không tìm thấy tài khoản." };
    }

    // Nếu user đã có password, bắt buộc phải cung cấp mật khẩu cũ và kiểm tra
    if (user.password) {
      if (!currentPassword) {
        return { success: false, message: "Vui lòng nhập mật khẩu hiện tại." };
      }
      
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return { success: false, message: "Mật khẩu hiện tại không đúng." };
      }
    }
    // Nếu user chưa có password (VD: trước đây đăng nhập bằng Google)
    // thì cho phép tạo thẳng password mới mà không cần currentPassword.

    // Băm mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedPassword,
      },
    });

    return { success: true, message: "Đổi mật khẩu thành công!" };
  } catch (error: any) {
    console.error("Lỗi đổi mật khẩu:", error);
    return { success: false, message: "Đã xảy ra lỗi hệ thống." };
  }
}
