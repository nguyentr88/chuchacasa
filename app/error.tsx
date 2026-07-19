"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import Header from "@/components/Header";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-primary-brown flex flex-col font-body">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white/60 border-2 border-secondary-pink rounded-[3rem] p-10 md:p-16 max-w-lg w-full backdrop-blur-md shadow-md animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-accent-red/10 text-accent-red rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <AlertTriangle size={48} />
          </div>
          <h1 className="text-4xl font-heading text-accent-red mb-4">Đã xảy ra lỗi!</h1>
          <p className="text-primary-brown/70 mb-8 leading-relaxed">
            Hệ thống đang gặp chút sự cố ngoài ý muốn. Vui lòng thử lại sau, hoặc trở về trang chủ nhé.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-primary-brown font-bold border-2 border-primary-brown/10 rounded-full hover:bg-highlight-yellow hover:border-highlight-yellow transition-all cursor-pointer"
            >
              <RefreshCcw size={18} />
              Thử lại
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-accent-red text-white font-bold rounded-full shadow-[0_5px_0_rgb(130,46,38)] hover:shadow-[0_2px_0_rgb(130,46,38)] hover:translate-y-[3px] active:shadow-none active:translate-y-[5px] transition-all"
            >
              Về Trang Chủ
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
