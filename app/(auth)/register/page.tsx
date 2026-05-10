"use client";

import Link from "next/link";
import { Mail, Lock, User, ArrowRight, ShieldCheck } from "lucide-react";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { FacebookIcon } from "@/components/icons/FacebookIcon";

export default function RegisterPage() {
  return (
    <div className="min-h-[90vh] flex items-center justify-center px-6 py-12 bg-background">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-heading text-primary-brown mb-2">Tạo tài khoản mới</h1>
          <p className="text-primary-brown/60">Gia nhập ngôi nhà nhỏ chucha.casa ngay hôm nay</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/60 backdrop-blur-md rounded-[3rem] p-8 md:p-10 border-2 border-secondary-pink shadow-xl">
          <form className="space-y-5">
            <div>
              <label className="block text-sm font-bold mb-2 ml-4">Họ và tên</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-brown/40" size={20} />
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-primary-brown/10 rounded-full focus:border-accent-red outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 ml-4">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-brown/40" size={20} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-primary-brown/10 rounded-full focus:border-accent-red outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 ml-4">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-brown/40" size={20} />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-primary-brown/10 rounded-full focus:border-accent-red outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex items-start gap-3 mt-2 ml-2">
              <input type="checkbox" className="mt-1 accent-accent-red" id="terms" />
              <label htmlFor="terms" className="text-xs text-primary-brown/70 leading-relaxed">
                Tôi đồng ý với các <button type="button" className="font-bold text-accent-red hover:underline">Điều khoản dịch vụ</button> và <button type="button" className="font-bold text-accent-red hover:underline">Chính sách bảo mật</button>
              </label>
            </div>

            <button
              type="button"
              className="w-full py-4 bg-accent-red text-white font-bold rounded-full text-lg shadow-[0_6px_0_rgb(130,46,38)] hover:shadow-[0_2px_0_rgb(130,46,38)] hover:translate-y-[4px] transition-all flex items-center justify-center gap-2 group mt-4"
            >
              Đăng ký tài khoản
              <ShieldCheck size={20} className="group-hover:scale-110 transition-transform" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-primary-brown/10"></div>
            </div>
            <div className="relative flex justify-center text-sm uppercase">
              <span className="bg-white px-4 text-primary-brown/40 font-bold">Hoặc đăng ký bằng</span>
            </div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-3 bg-white border-2 border-primary-brown/10 rounded-full hover:bg-zinc-50 transition-colors font-bold text-sm">
              <GoogleIcon />
              Google
            </button>
            <button className="flex items-center justify-center gap-2 py-3 bg-[#1877F2] text-white border-2 border-[#1877F2] rounded-full hover:opacity-90 transition-opacity font-bold text-sm">
              <FacebookIcon />
              Facebook
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-8 text-primary-brown/60">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-bold text-accent-red hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
