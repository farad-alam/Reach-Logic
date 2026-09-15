"use client";
import { useState } from "react";
import Link from "next/link";
import { Bell, BellOff, Check } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

const typeColors: Record<string, string> = {
  NEW_MESSAGE: "var(--brand-accent)",
  ORDER_CREATED: "var(--info, #3b82f6)",
  ORDER_STATUS_CHANGED: "var(--warning)",
  INVOICE_CREATED: "var(--neutral-600)",
  INVOICE_PAID: "var(--success)",
  INVITATION_SENT: "var(--brand-accent)",
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationList({ initialNotifications }: { initialNotifications: Notification[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  async function markOneRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    await fetch("/api/portal/notifications/mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    });
  }

  async function markAllRead() {
    setMarkingAll(true);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await fetch("/api/portal/notifications/mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setMarkingAll(false);
  }

  return (
    <div>
      {/* Header actions */}
      {unreadCount > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={markAllRead}
            disabled={markingAll}
          >
            <Check size={13} />
            Mark all as read ({unreadCount})
          </button>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="card card-sm" style={{ textAlign: "center", padding: "48px 20px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <BellOff size={32} color="var(--neutral-300)" />
            <p style={{ color: "var(--neutral-400)", fontSize: 14 }}>No notifications yet</p>
          </div>
        </div>
      ) : (
        <div className="card card-sm" style={{ padding: 0 }}>
          {notifications.map((n, i) => {
            const dot = typeColors[n.type] ?? "var(--neutral-400)";
            const content = (
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  padding: "14px 18px",
                  borderBottom: i < notifications.length - 1 ? "1px solid var(--neutral-100)" : "none",
                  background: n.isRead ? "transparent" : "rgba(18,196,148,0.04)",
                  cursor: n.link ? "pointer" : "default",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!n.isRead) (e.currentTarget as HTMLDivElement).style.background = "rgba(18,196,148,0.07)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = n.isRead ? "transparent" : "rgba(18,196,148,0.04)";
                }}
              >
                {/* Dot */}
                <div style={{ paddingTop: 4, flexShrink: 0 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: n.isRead ? "var(--neutral-200)" : dot,
                    transition: "background 0.2s",
                  }} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: n.isRead ? 400 : 600, color: "var(--neutral-900)" }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--neutral-400)", flexShrink: 0, paddingTop: 1 }}>
                      {timeAgo(n.createdAt)}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--neutral-500)", marginTop: 2 }}>{n.body}</div>
                </div>

                {/* Mark read button */}
                {!n.isRead && (
                  <button
                    title="Mark as read"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); markOneRead(n.id); }}
                    style={{
                      flexShrink: 0, background: "transparent", border: "none",
                      cursor: "pointer", color: "var(--neutral-400)", padding: 2,
                      display: "flex", alignItems: "center",
                    }}
                  >
                    <Bell size={13} />
                  </button>
                )}
              </div>
            );

            return n.link ? (
              <Link key={n.id} href={n.link} style={{ textDecoration: "none" }} onClick={() => markOneRead(n.id)}>
                {content}
              </Link>
            ) : (
              <div key={n.id}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
