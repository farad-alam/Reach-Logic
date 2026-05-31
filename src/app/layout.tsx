import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";

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
  title: "Reach Logic — Scale Smarter. Reach Further.",
  description:
    "Reach Logic is a full-service digital growth agency offering social media management, paid advertising, and web design for brands ready to scale globally.",
  keywords: "digital marketing agency, social media management, paid advertising, web design, growth strategy",
  openGraph: {
    title: "Reach Logic — Scale Smarter. Reach Further.",
    description: "Full-service digital growth agency. Social automation, paid ads, web design — built to convert globally.",
    type: "website",
  },
};

import SmoothScroll from "@/components/SmoothScroll";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body
        style={{ fontFamily: "var(--font-inter), sans-serif" }}
        className="min-h-screen antialiased"
      >
        <ClientProviders />
        <SmoothScroll>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
