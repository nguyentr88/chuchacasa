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
  title: {
    template: "%s | chucha.casa",
    default: "chucha.casa | Mang hạnh phúc về nhà",
  },
  description: "Nơi bạn “mang hạnh phúc về nhà” bằng những món quà nhỏ xinh như lót ly, pouch, ví, thúng vải được làm thủ công bằng tình yêu thương.",
  keywords: ["quà tặng thủ công", "đồ handmade", "lót ly vải", "ví vải", "thúng vải", "chucha casa", "quà tặng độc đáo"],
  authors: [{ name: "Chu Cha Casa" }],
  openGraph: {
    title: "chucha.casa | Mang hạnh phúc về nhà",
    description: "Nơi bạn “mang hạnh phúc về nhà” bằng những món quà nhỏ xinh như lót ly, pouch, ví, thúng vải...",
    url: "https://chucha-casa.vercel.app", // Thay bằng URL chính thức sau này
    siteName: "Chu Cha Casa",
    images: [
      {
        url: "/logo/logo-main.png",
        width: 1200,
        height: 630,
        alt: "Chu Cha Casa Logo",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "chucha.casa | Mang hạnh phúc về nhà",
    description: "Nơi bạn “mang hạnh phúc về nhà” bằng những món quà nhỏ xinh như lót ly, pouch, ví, thúng vải...",
    images: ["/logo/logo-main.png"],
  },
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
