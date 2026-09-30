// src/app/(portal)/layout.tsx — Root portal layout
import type { Metadata } from "next";
import "../globals.css";
import "./portal.css";

export const metadata: Metadata = {
  title: {
    default: "ReachLogic Portal",
    template: "%s | ReachLogic Portal",
  },
  description: "ReachLogic Client Management Portal",
  robots: { index: false, follow: false },
};

import TawkToChat from "@/components/TawkToChat";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", height: "100vh" }}>
      {children}
      <TawkToChat />
    </div>
  );
}
