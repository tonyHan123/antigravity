import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable}`}>
        <Navbar />
        <main style={{ minHeight: 'calc(100vh - 80px - 300px)' }}> {/* Approx height of nav + footer */}
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
