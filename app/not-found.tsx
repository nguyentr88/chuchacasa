"use client";

import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import Header from "@/components/Header";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-primary-brown flex flex-col font-body">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white/60 border-2 border-secondary-pink rounded-[3rem] p-10 md:p-16 max-w-lg w-full backdrop-blur-md shadow-md animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-accent-red/10 text-accent-red rounded-full flex items-center justify-center mx-auto mb-6">
            <SearchX size={48} />
          </div>
          <h1 className="text-6xl font-heading text-accent-red mb-4">404</h1>
          <h2 className="text-2xl font-bold mb-4">Ối! Lạc đường rồi!</h2>
          <p className="text-primary-brown/70 mb-8 leading-relaxed">
            Trang bạn đang tìm kiếm có vẻ như đã bị chuyển đi hoặc không tồn tại. Đừng lo, hãy quay lại trang chủ và khám phá thêm những món đồ thủ công xinh xắn nhé!
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent-red text-white font-bold rounded-full text-lg shadow-[0_6px_0_rgb(130,46,38)] hover:shadow-[0_3px_0_rgb(130,46,38)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all"
          >
            <ArrowLeft size={20} />
            Về Trang Chủ
          </Link>
        </div>
      </main>
    </div>
  );
}
