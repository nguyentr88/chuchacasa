import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ShoppingBag, Grid, Home, LogOut, FileText } from "lucide-react";
import Image from "next/image";
import AdminNav from "./AdminNav";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
  const adminAvatar = session.user?.image || "/logo/chucha-avatar.jpg";

  return (
    <div className="min-h-screen bg-background text-primary-brown flex flex-col md:flex-row font-body">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-white/40 border-b md:border-b-0 md:border-r border-primary-brown/10 flex flex-col backdrop-blur-md">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-primary-brown/10 flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-full border-2 border-white flex items-center justify-center shadow-md overflow-hidden bg-white">
            <Image
              src="/logo/logo-icon.png"
              alt="Chu Cha Logo"
              width={40}
              height={40}
              className="object-contain"
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

        {/* Navigation Menu (Client Component) */}
        <AdminNav />

        {/* Sidebar Footer - Admin Profile */}
        <div className="p-6 border-t border-primary-brown/10 bg-white/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative w-10 h-10 rounded-full border border-primary-brown/20 overflow-hidden bg-white flex items-center justify-center">
              <Image
                src={adminAvatar}
                alt="Avatar"
                width={40}
                height={40}
                className="w-full h-full object-contain"
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
            <div className="w-8 h-8 rounded-full bg-white overflow-hidden flex items-center justify-center shadow-sm">
              <Image
                src="/logo/logo-icon.png"
                alt="Logo"
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
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
