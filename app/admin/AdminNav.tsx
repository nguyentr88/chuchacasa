"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Grid, Home, FileText } from "lucide-react";

export default function AdminNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="flex-1 p-6 space-y-3">
      <Link
        href="/admin"
        className={`flex items-center gap-3 px-5 py-4 rounded-full font-bold transition-all duration-200 ${
          isActive("/admin")
            ? "bg-highlight-yellow text-accent-red shadow-sm scale-105"
            : "text-primary-brown hover:bg-highlight-yellow/40 hover:translate-x-1"
        }`}
      >
        <LayoutDashboard size={20} className={isActive("/admin") ? "text-accent-red" : "text-primary-brown/60"} />
        <span>Tổng quan</span>
      </Link>
      <Link
        href="/admin/products"
        className={`flex items-center gap-3 px-5 py-4 rounded-full font-bold transition-all duration-200 ${
          isActive("/admin/products")
            ? "bg-highlight-yellow text-accent-red shadow-sm scale-105"
            : "text-primary-brown hover:bg-highlight-yellow/40 hover:translate-x-1"
        }`}
      >
        <ShoppingBag size={20} className={isActive("/admin/products") ? "text-accent-red" : "text-primary-brown/60"} />
        <span>Sản phẩm</span>
      </Link>
      <Link
        href="/admin/categories"
        className={`flex items-center gap-3 px-5 py-4 rounded-full font-bold transition-all duration-200 ${
          isActive("/admin/categories")
            ? "bg-highlight-yellow text-accent-red shadow-sm scale-105"
            : "text-primary-brown hover:bg-highlight-yellow/40 hover:translate-x-1"
        }`}
      >
        <Grid size={20} className={isActive("/admin/categories") ? "text-accent-red" : "text-primary-brown/60"} />
        <span>Phân loại</span>
      </Link>
      <Link
        href="/admin/orders"
        className={`flex items-center gap-3 px-5 py-4 rounded-full font-bold transition-all duration-200 ${
          isActive("/admin/orders")
            ? "bg-highlight-yellow text-accent-red shadow-sm scale-105"
            : "text-primary-brown hover:bg-highlight-yellow/40 hover:translate-x-1"
        }`}
      >
        <FileText size={20} className={isActive("/admin/orders") ? "text-accent-red" : "text-primary-brown/60"} />
        <span>Đơn hàng</span>
      </Link>

      <div className="pt-6 border-t border-primary-brown/10">
        <Link
          href="/"
          className="flex items-center gap-3 px-5 py-4 rounded-full font-bold transition-all hover:bg-highlight-yellow/60 hover:translate-x-1 duration-200 text-primary-brown"
        >
          <Home size={20} className="text-primary-brown/60" />
          <span>Về Trang chủ shop</span>
        </Link>
      </div>
    </nav>
  );
}
