import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { preload } from "react-dom";
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
    default: "Reach Logic LLC — Strategy That Moves Brands Forward.",
    template: "%s | Reach Logic LLC",
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
    title: "Reach Logic LLC — Strategy That Moves Brands Forward.",
    description:
      "Full-service digital growth agency. Social automation, paid ads, SEO, web design — built to convert globally.",
    url: "https://www.reachlogic.net",
    siteName: "Reach Logic LLC",
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
    title: "Reach Logic LLC — Strategy That Moves Brands Forward.",
    description:
      "Full-service digital growth agency. Paid ads, social, SEO & web design — built to convert.",
    images: ["/og-image.png"],
  },


  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Inject fetchpriority="high" preload for logo in the HTML <head>.
  // React 19's preload() is called inside a Server Component and hoists a
  // <link rel="preload" fetchpriority="high"> before the browser sees the body.
  // We target the Next.js Image-optimized URL (/_next/image) — not the raw PNG —
  // so the preloaded resource matches exactly what the <img> srcset will request.
  preload("/_next/image?url=%2Flogo.png&w=384&q=75", {
    as: "image",
    fetchPriority: "high",
    // Cover 1x and 2x mobile DPRs
    imageSrcSet:
      "/_next/image?url=%2Flogo.png&w=256&q=75 256w, /_next/image?url=%2Flogo.png&w=384&q=75 384w, /_next/image?url=%2Flogo.png&w=640&q=75 640w",
    imageSizes: "152px",
  });

  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body
        style={{
          fontFamily: "var(--font-inter), sans-serif",
          // Critical above-fold styles inlined directly in HTML so the page
          // shows the correct background/foreground before the CSS chunk loads.
          // Without this the browser paints white, then flashes to dark — which
          // Lighthouse counts against Speed Index.
          backgroundColor: "#042f28",
          color: "#ffffff",
        }}
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
