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
  isCollapsed = false,
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
  const groupedThreads: { clientId: string; clientName: string; threads: ThreadItem[] }[] = [];
  if (role !== "CLIENT") {
    const map = new Map<string, { clientName: string; threads: ThreadItem[] }>();
    threads.forEach((t) => {
      const cId = t.clientId || "unknown";
      const cName = t.client?.fullName || t.client?.email || "CLIENT";
      if (!map.has(cId)) {
        map.set(cId, { clientName: cName, threads: [] });
      }
      map.get(cId)!.threads.push(t);
    });
    map.forEach((val, key) => {
      groupedThreads.push({ clientId: key, clientName: val.clientName, threads: val.threads });
    });
  }

  return (
    <aside className={`portal-sidebar ${isCollapsed ? "collapsed" : ""}`}>
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
                      <div>
                        {groupedThreads.map((group) => (
                          <div key={group.clientId} style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "0.06em", textTransform: "uppercase", padding: "6px 12px 2px 12px" }}>
                              {group.clientName}
                            </div>
                            {group.threads.map((t) => {
                              const isThreadActive = activeThreadId ? activeThreadId === t.id : pathname.includes(t.id);
                              return (
                                <Link
                                  key={t.id}
                                  href={`${messagesBaseRoute}?clientId=${group.clientId}&threadId=${t.id}`}
                                  className={`portal-subnav-link ${isThreadActive ? "active" : ""}`}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    padding: "6px 12px 6px 16px",
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
                          </div>
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
