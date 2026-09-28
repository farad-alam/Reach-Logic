"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
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
  
  // Collapse sidebar explicitly on messages route for all roles
  const isMessageRoute = pathname.includes("/messages");

  return (
    <div className={`portal-shell ${isMessageRoute ? "sidebar-collapsed" : ""}`}>
      <PortalSidebar
        role={role}
        userName={userName}
        userEmail={userEmail}
        avatarUrl={avatarUrl}
        unreadCount={unreadCount}
        isCollapsed={isMessageRoute}
      />
      <main className="portal-main">{children}</main>
    </div>
  );
}
