// src/app/(portal)/layout.tsx — Root portal layout (no marketing navbar/footer)
import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "../globals.css";
import "./portal.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "ReachLogic Portal",
    template: "%s | ReachLogic Portal",
  },
  description: "ReachLogic Client Management Portal",
  robots: { index: false, follow: false }, // Don't index portal pages
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body
        style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
        className="antialiased"
      >
        {children}
      </body>
    </html>
  );
}
