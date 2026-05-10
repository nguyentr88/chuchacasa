"use client";

import Link from "next/link";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { FacebookIcon } from "@/components/icons/FacebookIcon";

export default function LoginPage() {
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
          <form className="space-y-6">
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
              <div className="text-right mt-2 mr-2">
                <button type="button" className="text-sm font-medium text-accent-red hover:underline">Quên mật khẩu?</button>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-4 bg-accent-red text-white font-bold rounded-full text-lg shadow-[0_6px_0_rgb(130,46,38)] hover:shadow-[0_2px_0_rgb(130,46,38)] hover:translate-y-[4px] transition-all flex items-center justify-center gap-2 group"
            >
              Đăng nhập ngay
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
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
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-bold text-accent-red hover:underline">
            Đăng ký tại đây
          </Link>
        </p>
      </div>
    </div>
  );
}
