import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Display serif — modern luxury editorial (2026 trend)
const instrumentSerif = Instrument_Serif({
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

// Body sans-serif — temiz, okunaklı
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cosmositio | Türkiye'nin Trend Bulduğu Ürünler",
  description:
    "Amazon.com.tr'de en çok satılan, viral olan trend ürünler. Teknoloji, mutfak, güzellik, spor, anne&bebek — her kategoride dürüst seçkiler ve en iyi fiyatlar.",
  keywords: [
    "amazon türkiye",
    "trend ürünler",
    "en çok satılan",
    "viral ürünler",
    "teknoloji",
    "mutfak",
    "güzellik",
    "spor",
    "bebek",
    "air fryer",
    "akıllı ev",
    "cilt bakımı",
  ],
  authors: [{ name: "Cosmositio" }],
  openGraph: {
    title: "Cosmositio | Türkiye'nin Trend Bulduğu Ürünler",
    description:
      "Amazon.com.tr'de viral olan trend ürünler — teknoloji, mutfak, güzellik, spor, bebek kategorilerinde dürüst seçkiler.",
    type: "website",
    locale: "tr_TR",
    siteName: "Cosmositio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cosmositio | Trend Ürünler",
    description: "Amazon.com.tr en çok satılan ürünleri kürasyonu",
  },
  alternates: { canonical: "https://cosmositio.com" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="tr"
      className={`${inter.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900 font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
