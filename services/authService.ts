import bcrypt from "bcryptjs";
import { userRepository } from "@/repositories/userRepository";
import { RegisterFormData } from "@/types/auth";

export class AuthService {
  async register(data: RegisterFormData) {
    // 1. Kiểm tra xem email đã tồn tại chưa
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error("Email này đã được sử dụng.");
    }

    // 2. Hash mật khẩu (mã hóa 1 chiều an toàn)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    // 3. Gọi Repository để lưu user vào DB
    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    return user;
  }
}

export const authService = new AuthService();
