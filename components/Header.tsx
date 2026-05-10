"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, User, ShoppingCart } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const isProductPage = pathname.startsWith("/products");

  return (
    <header className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full sticky top-0 bg-background/80 backdrop-blur-md z-50">
      <Link 
        href="/products" 
        className={`text-3xl font-heading tracking-tight transition-all relative ${
          isProductPage ? "text-accent-red" : "text-primary-brown hover:text-accent-red"
        }`}
      >
        Sản phẩm
        {isProductPage && (
          <div className="absolute -bottom-1 left-0 w-full h-1 bg-accent-red rounded-full" />
        )}
      </Link>
      
      <nav className="flex items-center gap-10">
        <Link href="/" className="font-heading text-xl text-primary-brown hover:text-accent-red transition-colors">
          chucha.casa
        </Link>
        
        <div className="flex items-center gap-6 text-primary-brown">
          <button className="hover:text-accent-red transition-colors cursor-pointer">
            <Search size={24} strokeWidth={2.5} />
          </button>
          <Link href="/login" className="hover:text-accent-red transition-colors cursor-pointer">
            <User size={24} strokeWidth={2.5} />
          </Link>
          <button className="hover:text-accent-red transition-colors cursor-pointer">
            <ShoppingCart size={24} strokeWidth={2.5} />
          </button>
        </div>
      </nav>
    </header>
  );
}
