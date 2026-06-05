import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";
import SmoothScroll from "@/components/SmoothScroll";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TawkToChat from "@/components/TawkToChat";
import { RootJsonLd } from "@/components/JsonLd";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.reachlogic.net"),

  title: {
    default: "Reach Logic — Scale Smarter. Reach Further.",
    template: "%s | Reach Logic",
  },
  description:
    "Reach Logic is a full-service digital growth agency offering social media management, paid advertising, SEO, and web design for brands ready to scale globally.",
  keywords: [
    "digital marketing agency",
    "social media management",
    "paid advertising agency",
    "SEO agency",
    "web design agency",
    "growth marketing",
    "social media automation",
    "Reach Logic",
  ],

  alternates: {
    canonical: "https://www.reachlogic.net",
  },

  openGraph: {
    title: "Reach Logic — Scale Smarter. Reach Further.",
    description:
      "Full-service digital growth agency. Social automation, paid ads, SEO, web design — built to convert globally.",
    url: "https://www.reachlogic.net",
    siteName: "Reach Logic",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Reach Logic — Scale Smarter. Reach Further.",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Reach Logic — Scale Smarter. Reach Further.",
    description:
      "Full-service digital growth agency. Paid ads, social, SEO & web design — built to convert.",
    images: ["/og-image.png"],
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },

  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body
        style={{ fontFamily: "var(--font-inter), sans-serif" }}
        className="min-h-screen antialiased"
      >
        <RootJsonLd />
        <ClientProviders />
        <SmoothScroll>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <TawkToChat />
        </SmoothScroll>
      </body>
    </html>
  );
}
