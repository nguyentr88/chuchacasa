"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { authService } from "@/services/authService";
import {
  LoginFormData,
  RegisterFormData,
  LoginSchema,
  RegisterSchema,
} from "@/types/auth";

export async function loginAction(values: LoginFormData) {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Dữ liệu không hợp lệ!" };
  }

  const { email, password } = validatedFields.data;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/", // Redirect to home page after successful login
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Email hoặc mật khẩu không chính xác!" };
        default:
          return { error: "Đã có lỗi xảy ra. Vui lòng thử lại!" };
      }
    }
    throw error;
  }
}

export async function registerAction(values: RegisterFormData) {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Dữ liệu không hợp lệ!" };
  }

  try {
    await authService.register(validatedFields.data);

    // Automatically log the user in after registration
    await signIn("credentials", {
      email: validatedFields.data.email,
      password: validatedFields.data.password,
      redirectTo: "/",
    });

    return { success: "Đăng ký thành công!" };
  } catch (error: any) {
    return { error: error.message || "Đã có lỗi xảy ra khi đăng ký." };
  }
}

export async function googleLoginAction() {
  await signIn("google", { redirectTo: "/" });
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
