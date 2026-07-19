import type { Metadata } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import "./globals.css";

const baloo2 = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "chucha.casa | Mang hạnh phúc về nhà",
  description: "Nơi bạn “mang hạnh phúc về nhà” bằng những món quà nhỏ xinh như lót ly, pouch, ví, thúng vải...",
};

import Header from "@/components/Header";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { CartProvider } from "@/components/providers/CartContext";
import { CartDrawer } from "@/components/CartDrawer";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${baloo2.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body text-primary-brown bg-background">
        <SessionProvider>
          <CartProvider>
            <Header />
            {children}
            <CartDrawer />
            <Toaster position="bottom-right" toastOptions={{ duration: 4000, style: { borderRadius: '1rem', background: '#fff', color: '#5B4033', border: '1px solid #FFE4E1', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontWeight: 'bold' } }} />
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
