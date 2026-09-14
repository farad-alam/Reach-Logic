"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  FileText,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  UserCog,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface SidebarProps {
  role: "SUPER_ADMIN" | "TEAM_MEMBER" | "CLIENT";
  userName: string;
  userEmail: string;
  avatarUrl?: string | null;
  unreadCount?: number;
}

const adminNav: NavItem[] = [
  { href: "/portal/admin", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
  { href: "/portal/admin/clients", label: "Clients", icon: <Users size={16} /> },
  { href: "/portal/admin/orders", label: "Orders", icon: <ShoppingBag size={16} /> },
  { href: "/portal/admin/invoices", label: "Invoices", icon: <FileText size={16} /> },
  { href: "/portal/admin/messages", label: "Messages", icon: <MessageSquare size={16} /> },
  { href: "/portal/admin/team", label: "Team", icon: <UserCog size={16} /> },
  { href: "/portal/admin/notifications", label: "Notifications", icon: <Bell size={16} /> },
  { href: "/portal/admin/settings", label: "Settings", icon: <Settings size={16} /> },
];

const clientNav: NavItem[] = [
  { href: "/portal/client", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
  { href: "/portal/client/orders", label: "My Orders", icon: <ShoppingBag size={16} /> },
  { href: "/portal/client/invoices", label: "Invoices", icon: <FileText size={16} /> },
  { href: "/portal/client/messages", label: "Messages", icon: <MessageSquare size={16} /> },
  { href: "/portal/client/notifications", label: "Notifications", icon: <Bell size={16} /> },
  { href: "/portal/client/profile", label: "Profile", icon: <Settings size={16} /> },
];

const teamNav: NavItem[] = [
  { href: "/portal/team/messages", label: "Messages", icon: <MessageSquare size={16} /> },
  { href: "/portal/team/notifications", label: "Notifications", icon: <Bell size={16} /> },
  { href: "/portal/team/profile", label: "Profile", icon: <Settings size={16} /> },
];

const navByRole = {
  SUPER_ADMIN: adminNav,
  CLIENT: clientNav,
  TEAM_MEMBER: teamNav,
};

const roleLabel = {
  SUPER_ADMIN: "Super Admin",
  CLIENT: "Client",
  TEAM_MEMBER: "Team Member",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function PortalSidebar({
  role,
  userName,
  userEmail,
  avatarUrl,
  unreadCount = 0,
}: SidebarProps) {
  const pathname = usePathname();
  const nav = navByRole[role];

  return (
    <aside className="portal-sidebar">
      {/* Logo */}
      <div className="portal-sidebar-logo">
        <span className="portal-sidebar-logo-text">ReachLogic</span>
        <span className="portal-sidebar-logo-badge">Portal</span>
      </div>

      {/* Navigation */}
      <nav className="portal-nav">
        {nav.map((item) => {
          const isActive =
            item.href === "/portal/admin" ||
            item.href === "/portal/client" ||
            item.href === "/portal/team/messages"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          const showBadge =
            (item.label === "Notifications" || item.label === "Messages") &&
            unreadCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`portal-nav-link ${isActive ? "active" : ""}`}
            >
              {item.icon}
              {item.label}
              {showBadge && (
                <span className="portal-nav-badge">{unreadCount}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User card + logout */}
      <div className="portal-sidebar-user">
        <div className="portal-sidebar-avatar">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={userName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            getInitials(userName || userEmail)
          )}
        </div>
        <div className="portal-sidebar-user-info">
          <div className="portal-sidebar-user-name">{userName || userEmail}</div>
          <div className="portal-sidebar-user-role">{roleLabel[role]}</div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/portal/login" })}
          title="Sign out"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "rgba(255,255,255,0.4)",
            padding: "4px",
            borderRadius: "4px",
            display: "flex",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
        >
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  );
}
