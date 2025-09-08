import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/Auth";
import { CartProvider } from "./context/Cart";
import Footer from "./components/layout/Footer";

const cairo = Cairo({ 
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Almasya",
   description: "Almasya للمجوهرات الإماراتية اليدوية - خواتم، سلاسل، وإكسسوارات مصنوعة خصيصاً لك أو جاهزة. نشتغل بالجملة وبالقطعة ونشحن لكل الدول",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.className} bg-[#211c31]`}>
        <AuthProvider>
          <CartProvider>
            {children}
            <div className="bg-[#211c31] flex justify-center py-8 px-4">
              <Footer />
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
