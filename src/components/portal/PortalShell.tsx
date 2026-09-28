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
  
  return (
    <div className="portal-shell">
      <PortalSidebar
        role={role}
        userName={userName}
        userEmail={userEmail}
        avatarUrl={avatarUrl}
        unreadCount={unreadCount}
      />
      <main className="portal-main">{children}</main>
    </div>
  );
}
