import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ShoppingBag, Grid, Home, LogOut, FileText } from "lucide-react";
import Image from "next/image";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Kiểm tra quyền ADMIN ở phía Server
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin");
  }

  const adminName = session.user?.name || "Chu Cha Admin";
  const adminEmail = session.user?.email || "admin@chucha.casa";
  const adminAvatar = session.user?.image || "/globe.svg";

  return (
    <div className="min-h-screen bg-background text-primary-brown flex flex-col md:flex-row font-body">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-white/40 border-b md:border-b-0 md:border-r border-primary-brown/10 flex flex-col backdrop-blur-md">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-primary-brown/10 flex items-center gap-4">
          <div className="relative w-12 h-12 bg-secondary-pink rounded-full border-2 border-white flex items-center justify-center shadow-md overflow-hidden">
            <Image
              src="/globe.svg"
              alt="Mascot"
              width={32}
              height={32}
              className="opacity-80 object-contain"
            />
          </div>
          <div>
            <h2 className="font-heading text-2xl tracking-wide text-accent-red leading-none mb-1">
              Chu Cha
            </h2>
            <span className="text-xs font-bold tracking-widest text-primary-brown/60 uppercase">
              Admin Panel
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-6 space-y-3">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-5 py-4 rounded-full font-bold transition-all hover:bg-highlight-yellow hover:translate-x-1 duration-200"
          >
            <LayoutDashboard size={20} className="text-accent-red" />
            <span>Tổng quan</span>
          </Link>
          <Link
            href="/admin/products"
            className="flex items-center gap-3 px-5 py-4 rounded-full font-bold transition-all hover:bg-highlight-yellow hover:translate-x-1 duration-200"
          >
            <ShoppingBag size={20} className="text-accent-red" />
            <span>Sản phẩm</span>
          </Link>
          <Link
            href="/admin/categories"
            className="flex items-center gap-3 px-5 py-4 rounded-full font-bold transition-all hover:bg-highlight-yellow hover:translate-x-1 duration-200"
          >
            <Grid size={20} className="text-accent-red" />
            <span>Phân loại</span>
          </Link>
          <Link
            href="/admin/refund-policy"
            className="flex items-center gap-3 px-5 py-4 rounded-full font-bold transition-all hover:bg-highlight-yellow hover:translate-x-1 duration-200"
          >
            <FileText size={20} className="text-accent-red" />
            <span>Chính sách hoàn tiền</span>
          </Link>

          <div className="pt-6 border-t border-primary-brown/10">
            <Link
              href="/"
              className="flex items-center gap-3 px-5 py-4 rounded-full font-bold transition-all hover:bg-highlight-yellow/60 hover:translate-x-1 duration-200"
            >
              <Home size={20} className="opacity-70" />
              <span>Về Trang chủ shop</span>
            </Link>
          </div>
        </nav>

        {/* Sidebar Footer - Admin Profile */}
        <div className="p-6 border-t border-primary-brown/10 bg-white/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative w-10 h-10 rounded-full border border-primary-brown/20 overflow-hidden bg-white flex items-center justify-center">
              <Image
                src={adminAvatar}
                alt="Avatar"
                width={36}
                height={36}
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{adminName}</p>
              <p className="text-xs text-primary-brown/60 truncate">{adminEmail}</p>
            </div>
          </div>
          
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="w-full py-3 bg-white/60 border border-primary-brown/10 hover:bg-accent-red hover:text-white hover:border-accent-red rounded-full font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
            >
              <LogOut size={16} />
              Đăng xuất
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Mobile Header (Hidden on Desktop) */}
        <header className="md:hidden px-6 py-4 bg-white/40 border-b border-primary-brown/10 flex justify-between items-center backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Image
              src="/globe.svg"
              alt="Mascot"
              width={24}
              height={24}
              className="opacity-80"
            />
            <span className="font-heading text-xl text-accent-red">Chu Cha Admin</span>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
