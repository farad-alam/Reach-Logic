"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import PortalSidebar from "./PortalSidebar";

interface PortalShellProps {
  role: "SUPER_ADMIN" | "TEAM_MEMBER" | "CLIENT";
  userName: string;
  userEmail: string;
  avatarUrl?: string | null;
  unreadCount?: number;
  children: React.ReactNode;
}

export default function PortalShell({
  role,
  userName,
  userEmail,
  avatarUrl,
  unreadCount,
  children,
}: PortalShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto-close sidebar whenever the user navigates to a new route
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="portal-shell">
      <PortalSidebar
        role={role}
        userName={userName}
        userEmail={userEmail}
        avatarUrl={avatarUrl}
        unreadCount={unreadCount}
        sidebarOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Backdrop — only rendered & visible on mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <main className="portal-main">
        {/* Mobile topbar — hidden on desktop via CSS */}
        <div className="mobile-topbar">
          <button
            id="portal-hamburger-btn"
            className="hamburger-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
            {(unreadCount ?? 0) > 0 && (
              <span className="hamburger-badge-dot" aria-label={`${unreadCount} unread`} />
            )}
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="ReachLogic" className="mobile-topbar-logo" />
        </div>

        {children}
      </main>
    </div>
  );
}
