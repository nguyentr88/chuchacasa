"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { FacebookIcon } from "@/components/icons/FacebookIcon";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, LoginFormData } from "@/types/auth";
import { loginAction } from "@/app/actions/auth";

export default function LoginPage() {
  const [error, setError] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: LoginFormData) => {
    setError("");
    startTransition(() => {
      loginAction(values)
        .then((data) => {
          if (data?.error) {
            setError(data.error);
          } else {
            // Lấy callbackUrl từ query params nếu có, mặc định về "/"
            const searchParams = new URLSearchParams(window.location.search);
            const callbackUrl = searchParams.get("callbackUrl") || "/";
            window.location.href = callbackUrl;
          }
        })
        .catch((err: any) => {
          // Next.js Server Actions ném lỗi NEXT_REDIRECT khi chuyển hướng thành công
          const isRedirect = err?.message?.includes("NEXT_REDIRECT");
          if (isRedirect) {
            const searchParams = new URLSearchParams(window.location.search);
            const callbackUrl = searchParams.get("callbackUrl") || "/";
            window.location.href = callbackUrl;
          } else {
            setError("Email hoặc mật khẩu không chính xác!");
          }
        });
    });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12 bg-background">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-heading text-primary-brown mb-2">Chào mừng trở lại!</h1>
          <p className="text-primary-brown/60">Đăng nhập để tiếp tục mua sắm tại chucha.casa</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/60 backdrop-blur-md rounded-[3rem] p-8 md:p-10 border-2 border-secondary-pink shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm text-center font-medium border border-red-100">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-bold mb-2 ml-4 text-primary-brown">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-brown/40" size={20} />
                <input
                  {...register("email")}
                  type="email"
                  disabled={isPending}
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-primary-brown/10 rounded-full focus:border-accent-red outline-none transition-all"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-2 ml-4 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 ml-4 text-primary-brown">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-brown/40" size={20} />
                <input
                  {...register("password")}
                  type="password"
                  disabled={isPending}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-primary-brown/10 rounded-full focus:border-accent-red outline-none transition-all"
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-2 ml-4 font-medium">{errors.password.message}</p>
              )}
              <div className="text-right mt-2 mr-2">
                <Link href="/forgot-password" className="text-sm font-medium text-accent-red hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-4 bg-accent-red text-white font-bold rounded-full text-lg shadow-[0_6px_0_rgb(130,46,38)] hover:shadow-[0_2px_0_rgb(130,46,38)] hover:translate-y-[4px] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-[0_6px_0_rgb(130,46,38)]"
            >
              {isPending ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  Đăng nhập ngay
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-primary-brown/10"></div>
            </div>
            <div className="relative flex justify-center text-sm uppercase">
              <span className="bg-white px-4 text-primary-brown/40 font-bold">Hoặc đăng nhập bằng</span>
            </div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              type="button" 
              onClick={() => {
                startTransition(() => {
                  import("@/app/actions/auth").then(({ googleLoginAction }) => {
                    googleLoginAction();
                  });
                });
              }}
              className="flex items-center justify-center gap-2 py-3 bg-white border-2 border-primary-brown/10 rounded-full hover:bg-zinc-50 transition-colors font-bold text-sm"
            >
              <GoogleIcon />
              Google
            </button>
            <button type="button" className="flex items-center justify-center gap-2 py-3 bg-[#1877F2] text-white border-2 border-[#1877F2] rounded-full hover:opacity-90 transition-opacity font-bold text-sm">
              <FacebookIcon />
              Facebook
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-8 text-primary-brown/60">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-bold text-accent-red hover:underline">
            Đăng ký tại đây
          </Link>
        </p>
      </div>
    </div>
  );
}
