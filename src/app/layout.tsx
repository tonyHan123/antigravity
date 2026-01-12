import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { auth } from "@/auth";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { WishlistProvider } from "@/components/providers/WishlistProvider";
import { CouponProvider } from "@/components/providers/CouponProvider";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans-var",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-serif-var",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "K-Beauty Booking | Premium Beauty Services in Korea",
  description: "Book premium hair, nail, massage, and makeup services in Korea.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable}`}>
        <AuthProvider session={session}>
          <LanguageProvider>
            <WishlistProvider>
              <CouponProvider>
                <Navbar />
                <main style={{ minHeight: 'calc(100vh - 80px - 300px)' }}>
                  {children}
                </main>
                <Footer />
              </CouponProvider>
            </WishlistProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
