import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
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
  isCollapsed?: boolean;
  sidebarOpen?: boolean;
  onClose?: () => void;
}

interface ThreadClient {
  id: string;
  fullName: string | null;
  email: string;
}

interface ThreadItem {
  id: string;
  name: string;
  clientId: string;
  client?: ThreadClient | null;
  unread?: number;
}

const adminNav: NavItem[] = [
  { href: "/portal/admin", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
  { href: "/portal/admin/clients", label: "Clients", icon: <Users size={16} /> },
  { href: "/portal/admin/orders", label: "Orders", icon: <ShoppingBag size={16} /> },
  { href: "/portal/admin/invoices", label: "Invoices", icon: <FileText size={16} /> },
  { href: "/portal/admin/statement", label: "Statement", icon: <FileText size={16} /> },
  { href: "/portal/admin/messages", label: "Messages", icon: <MessageSquare size={16} /> },
  { href: "/portal/admin/team", label: "Team", icon: <UserCog size={16} /> },
  { href: "/portal/admin/notifications", label: "Notifications", icon: <Bell size={16} /> },
  { href: "/portal/admin/settings", label: "Settings", icon: <Settings size={16} /> },
  { href: "/portal/admin/trash", label: "Trash", icon: <Trash2 size={16} /> },
];

const clientNav: NavItem[] = [
  { href: "/portal/client", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
  { href: "/portal/client/orders", label: "My All Projects", icon: <ShoppingBag size={16} /> },
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

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function ClientSidebarGroup({
  group,
  activeThreadId,
  pathname,
  messagesBaseRoute,
  router
}: {
  group: { clientId: string; clientName: string; threads: ThreadItem[]; unreadCount: number };
  activeThreadId: string | null;
  pathname: string;
  messagesBaseRoute: string;
  router: any;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasActiveChild = group.threads.some(t => activeThreadId ? activeThreadId === t.id : pathname.includes(t.id));
  
  useEffect(() => {
    if (hasActiveChild) {
      setExpanded(true);
    }
  }, [hasActiveChild]);

  return (
    <div style={{ marginBottom: 8 }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 10px",
          background: hasActiveChild && !expanded ? "rgba(255,255,255,0.05)" : "transparent",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          color: "#fff",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = hasActiveChild && !expanded ? "rgba(255,255,255,0.05)" : "transparent"; }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#fff", color: "var(--brand-dark)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
            {getInitials(group.clientName)}
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {group.clientName}
          </span>
          {group.unreadCount > 0 && (
            <span style={{ background: "#ef4444", color: "#fff", fontSize: 11, fontWeight: 600, padding: "2px 6px", borderRadius: 10 }}>
              {group.unreadCount}
            </span>
          )}
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              router.push(`${messagesBaseRoute}?clientId=${group.clientId}`);
            }}
            style={{ 
              width: 20, height: 20, borderRadius: 4, border: "1px solid rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "rgba(255,255,255,0.7)"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
          >
            <Plus size={12} />
          </div>
          <div style={{ color: "rgba(255,255,255,0.5)", display: "flex" }}>
            <ChevronDown size={14} style={{ transform: expanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
          </div>
        </div>
      </button>

      {expanded && (
        <div style={{ paddingLeft: 14, paddingTop: 4, position: "relative" }}>
          {/* Connecting line */}
          <div style={{ position: "absolute", left: 23, top: 0, bottom: 8, width: 1, background: "rgba(255,255,255,0.1)" }} />
          
          {group.threads.map((t) => {
            const isThreadActive = activeThreadId ? activeThreadId === t.id : pathname.includes(t.id);
            return (
              <Link
                key={t.id}
                href={`${messagesBaseRoute}?clientId=${group.clientId}&threadId=${t.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 10px 6px 20px",
                  fontSize: 13,
                  color: isThreadActive ? "#fff" : "rgba(255,255,255,0.7)",
                  background: isThreadActive ? "rgba(255,255,255,0.12)" : "transparent",
                  borderRadius: 6,
                  textDecoration: "none",
                  marginBottom: 2,
                  fontWeight: isThreadActive ? 600 : 400,
                  transition: "background 0.15s, color 0.15s"
                }}
                onMouseEnter={(e) => { if (!isThreadActive) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#fff"; } }}
                onMouseLeave={(e) => { if (!isThreadActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; } }}
              >
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: isThreadActive ? "var(--brand-accent)" : "rgba(255,255,255,0.3)" }} />
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {t.name}
                </span>
                {(t.unread ?? 0) > 0 && (
                  <span style={{ background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 600, padding: "2px 5px", borderRadius: 10 }}>
                    {t.unread}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function PortalSidebar({
  role,
  userName,
  userEmail,
  avatarUrl,
  unreadCount = 0,
  isCollapsed = false,
  sidebarOpen = false,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nav = navByRole[role];

  const activeThreadId = searchParams.get("threadId");
  const isMessagePage = pathname.includes("/messages");

  const [messagesExpanded, setMessagesExpanded] = useState(isMessagePage);
  const [threads, setThreads] = useState<ThreadItem[]>([]);
  const [newThreadName, setNewThreadName] = useState("");
  const [creatingThread, setCreatingThread] = useState(false);

  // Fetch threads whenever on a message route or when expanded
  const fetchThreads = async () => {
    try {
      const res = await fetch("/api/portal/threads");
      if (res.ok) {
        const data = await res.json();
        setThreads(data.threads || []);
      }
    } catch (e) {
      console.error("Failed to fetch threads for sidebar", e);
    }
  };

  useEffect(() => {
    if (isMessagePage || messagesExpanded) {
      fetchThreads();
    }
  }, [isMessagePage, messagesExpanded]);

  async function handleCreateThread(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!newThreadName.trim() || creatingThread) return;
    setCreatingThread(true);
    try {
      const res = await fetch("/api/portal/threads/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newThreadName.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setNewThreadName("");
        await fetchThreads();
        const baseRoute = role === "CLIENT" ? "/portal/client/messages" : role === "SUPER_ADMIN" ? "/portal/admin/messages" : "/portal/team/messages";
        router.push(`${baseRoute}?threadId=${data.thread.id}`);
      }
    } finally {
      setCreatingThread(false);
    }
  }

  // Group threads by client for ADMIN / TEAM_MEMBER
  const groupedThreads: { clientId: string; clientName: string; threads: ThreadItem[]; unreadCount: number }[] = [];
  if (role !== "CLIENT") {
    const map = new Map<string, { clientName: string; threads: ThreadItem[]; unreadCount: number }>();
    threads.forEach((t) => {
      const cId = t.clientId || "unknown";
      const cName = t.client?.fullName || t.client?.email || "CLIENT";
      if (!map.has(cId)) {
        map.set(cId, { clientName: cName, threads: [], unreadCount: 0 });
      }
      const group = map.get(cId)!;
      group.threads.push(t);
      if (t.unread && t.unread > 0) {
        group.unreadCount += t.unread;
      }
    });
    map.forEach((val, key) => {
      groupedThreads.push({ clientId: key, clientName: val.clientName, threads: val.threads, unreadCount: val.unreadCount });
    });
  }

  return (
    <aside className={`portal-sidebar ${isCollapsed ? "collapsed" : ""} ${sidebarOpen ? "open" : ""}`}>
      {/* Logo */}
      <div style={{ padding: "20px 20px 0 20px", marginBottom: "30px", display: "flex", flexDirection: "column" }}>
        <Link href={`/portal/${role.toLowerCase()}`} style={{ display: "block" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="ReachLogic" style={{ height: 32, objectFit: "contain", objectPosition: "left" }} />
        </Link>
        <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 8, fontWeight: 600 }}>
          {role === "SUPER_ADMIN" ? "Admin Portal" : role === "TEAM_MEMBER" ? "Team Portal" : "Client Portal"}
        </span>
      </div>

      {/* Navigation */}
      <nav className="portal-nav">
        {nav.map((item) => {
          const isMessagesItem = item.label === "Messages";
          const isActive =
            item.href === "/portal/admin" ||
            item.href === "/portal/client" ||
            item.href === "/portal/team/messages"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          const showBadge =
            (item.label === "Notifications" || item.label === "Messages") &&
            unreadCount > 0;

          if (isMessagesItem) {
            const messagesBaseRoute =
              role === "CLIENT"
                ? "/portal/client/messages"
                : role === "SUPER_ADMIN"
                ? "/portal/admin/messages"
                : "/portal/team/messages";

            return (
              <div key={item.href} style={{ marginBottom: 4 }}>
                <div
                  className={`portal-nav-link ${isActive ? "active" : ""}`}
                  style={{ cursor: "pointer", justifyContent: "space-between" }}
                  onClick={() => {
                    setMessagesExpanded((v) => !v);
                    if (!pathname.startsWith(messagesBaseRoute)) {
                      onClose?.();
                      router.push(messagesBaseRoute);
                    }
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {item.icon}
                    <span>{item.label}</span>
                    {showBadge && <span className="portal-nav-badge">{unreadCount}</span>}
                  </div>
                  {messagesExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>

                {/* Sub-threads Accordion */}
                {messagesExpanded && (
                  <div style={{ paddingLeft: 12, paddingTop: 4, paddingBottom: 6 }}>
                    {role === "CLIENT" ? (
                      <div>
                        {threads.map((t) => {
                          const isThreadActive = activeThreadId ? activeThreadId === t.id : pathname.includes(t.id);
                          return (
                            <Link
                              key={t.id}
                              href={`${messagesBaseRoute}?threadId=${t.id}`}
                              className={`portal-subnav-link ${isThreadActive ? "active" : ""}`}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "7px 12px",
                                fontSize: 13,
                                color: isThreadActive ? "#fff" : "rgba(255,255,255,0.7)",
                                background: isThreadActive ? "rgba(255,255,255,0.12)" : "transparent",
                                borderRadius: 6,
                                textDecoration: "none",
                                marginBottom: 2,
                                fontWeight: isThreadActive ? 600 : 400,
                              }}
                            >
                              <span style={{ width: 6, height: 6, borderRadius: "50%", background: isThreadActive ? "var(--brand-accent)" : "rgba(255,255,255,0.4)" }} />
                              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {t.name}
                              </span>
                              {(t.unread ?? 0) > 0 && <span className="portal-nav-badge">{t.unread}</span>}
                            </Link>
                          );
                        })}

                        {/* Inline Create Thread Input */}
                        <form onSubmit={handleCreateThread} style={{ display: "flex", gap: 6, marginTop: 8, padding: "0 4px" }}>
                          <input
                            type="text"
                            placeholder="New thread name"
                            value={newThreadName}
                            onChange={(e) => setNewThreadName(e.target.value)}
                            style={{
                              flex: 1,
                              minWidth: 0,
                              background: "rgba(0, 0, 0, 0.25)",
                              border: "1px solid rgba(255, 255, 255, 0.15)",
                              color: "#fff",
                              borderRadius: 6,
                              padding: "6px 10px",
                              fontSize: 12,
                              outline: "none",
                            }}
                          />
                          <button
                            type="submit"
                            disabled={creatingThread || !newThreadName.trim()}
                            style={{
                              background: "#10b981",
                              color: "#fff",
                              border: "none",
                              borderRadius: 6,
                              width: 28,
                              height: 28,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              opacity: !newThreadName.trim() || creatingThread ? 0.5 : 1,
                              flexShrink: 0,
                            }}
                          >
                            <Plus size={16} />
                          </button>
                        </form>
                      </div>
                    ) : (
                      <div style={{ padding: "4px 8px" }}>
                        {groupedThreads.map((group) => (
                          <ClientSidebarGroup
                            key={group.clientId}
                            group={group}
                            activeThreadId={activeThreadId}
                            pathname={pathname}
                            messagesBaseRoute={messagesBaseRoute}
                            router={router}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`portal-nav-link ${isActive ? "active" : ""}`}
              onClick={() => onClose?.()}
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
          <div className="portal-sidebar-user-name">{userName || "User"}</div>
          <div className="portal-sidebar-user-role" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {userEmail}
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/portal/login" })}
          title="Sign out"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            cursor: "pointer",
            color: "rgba(255,255,255,0.8)",
            padding: "6px 10px",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.15s",
            fontSize: "12px",
            fontWeight: 500,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.8)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
      {/* Extra padding for mobile bottom safe area */}
      <div style={{ height: "env(safe-area-inset-bottom, 20px)" }} className="mobile-safe-area"></div>
    </aside>
  );
}
