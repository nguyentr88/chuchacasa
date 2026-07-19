"use client";

import { useSession, signOut } from "next-auth/react";
import { LogOut, User as UserIcon, Settings, ChevronDown, ShieldCheck } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function UserMenu() {
  const { data: session } = useSession();
  console.log("🧸 [UserMenu Client] Current Session:", session);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session?.user) {
    return (
      <Link href="/login" className="hover:text-accent-red transition-colors cursor-pointer">
        <UserIcon size={24} strokeWidth={2.5} />
      </Link>
    );
  }

  const user = session.user;
  const initials = user.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase() : user.email?.[0].toUpperCase();
  const isAdmin = (user as any).role === "ADMIN";

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:bg-primary-brown/5 p-1 rounded-full transition-all group"
      >
        <div className="w-8 h-8 rounded-full bg-accent-red text-white flex items-center justify-center font-bold text-sm shadow-sm">
          {user.image ? (
            <img src={user.image} alt={user.name || "User"} className="w-full h-full rounded-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <ChevronDown size={16} className={`text-primary-brown/40 group-hover:text-primary-brown transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-2xl border-2 border-secondary-pink p-2 z-[100] animate-in fade-in zoom-in duration-200">
          <div className="px-4 py-3 border-b border-primary-brown/5 mb-2">
            <p className="text-sm font-bold text-primary-brown truncate">{user.name || "Người dùng"}</p>
            <p className="text-xs text-primary-brown/60 truncate">{user.email}</p>
          </div>

          {isAdmin && (
            <Link 
              href="/admin" 
              className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-accent-red bg-highlight-yellow/45 hover:bg-highlight-yellow border border-highlight-yellow/60 rounded-2xl transition-colors mb-1.5"
              onClick={() => setIsOpen(false)}
            >
              <ShieldCheck size={18} />
              Quản lý Admin 🧸
            </Link>
          )}
          
          <Link 
            href="/settings" 
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-primary-brown hover:bg-secondary-pink/30 rounded-2xl transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <Settings size={18} />
            Cài đặt tài khoản
          </Link>

          <button
            onClick={async () => {
              setIsOpen(false);
              await signOut({ callbackUrl: "/login" });
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-accent-red hover:bg-red-50 rounded-2xl transition-colors mt-1"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}
