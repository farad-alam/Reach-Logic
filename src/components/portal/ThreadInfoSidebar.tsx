"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

interface Member {
  id: string;
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
  role: string;
}

interface OrderInfo {
  id: string;
  serviceTitle: string;
  status: string;
  startDate: string;
  endDate: string;
  amount: string | null;
}

interface ThreadInfo {
  id: string;
  name: string;
  client: {
    id: string;
    fullName: string | null;
    email: string;
    avatarUrl: string | null;
    company: string | null;
    createdAt: string;
  };
  members: Member[];
  orders: OrderInfo[];
  payments: {
    totalBilled: number;
    totalPaid: number;
    totalDue: number;
  } | null;
}

const STATUS_COLORS: Record<string, string> = {
  AWAITING_QUOTE: "#f59e0b",
  PENDING: "#6366f1",
  IN_PROGRESS: "#0ea5e9",
  COMPLETED: "#22c55e",
  CANCELLED: "#ef4444",
};
const STATUS_LABELS: Record<string, string> = {
  AWAITING_QUOTE: "Awaiting Quote",
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}
function fmtDate(d: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(d));
}

function Initials({ name, email, size = 40 }: { name: string | null; email: string; size?: number }) {
  const txt = name ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : email[0].toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "var(--brand-mid)", color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, flexShrink: 0,
    }}>{txt}</div>
  );
}

export default function ThreadInfoSidebar({
  threadId,
  currentUserId,
  isAdmin = false,
}: {
  threadId: string;
  currentUserId: string;
  isAdmin?: boolean;
}) {
  const [info, setInfo] = useState<ThreadInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/portal/threads/${threadId}/info`)
      .then((r) => r.json())
      .then((d) => setInfo(d.thread ?? null))
      .finally(() => setLoading(false));
  }, [threadId]);

  if (loading) {
    return (
      <div className="thread-info-sidebar">
        <div style={{ padding: 24, color: "var(--neutral-400)", fontSize: 13 }}>Loading…</div>
      </div>
    );
  }

  if (!info) return null;

  const pct = info.payments && info.payments.totalBilled > 0
    ? Math.round((info.payments.totalPaid / info.payments.totalBilled) * 100)
    : 0;

  return (
    <div className="thread-info-sidebar">
      {/* Client card */}
      <div className="info-section">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <Initials name={info.client.fullName} email={info.client.email} size={48} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--neutral-900)" }}>{info.client.fullName ?? info.client.email}</div>
            <div style={{ fontSize: 12, color: "var(--neutral-500)" }}>{info.client.email}</div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: "var(--neutral-500)" }}>
          {info.client.company && <div>{info.client.company}</div>}
          <div>Since {fmtDate(info.client.createdAt)}</div>
        </div>
        {isAdmin && (
          <Link href={`/portal/admin/clients/${info.client.id}`} style={{ fontSize: 12, color: "var(--brand-accent)", display: "flex", alignItems: "center", gap: 4, marginTop: 8, textDecoration: "none" }}>
            View profile <ExternalLink size={11} />
          </Link>
        )}
      </div>

      {/* Projects for this thread */}
      {info.orders.length > 0 && (
        <div className="info-section">
          <div className="info-section-label">PROJECTS ({info.orders.length})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {info.orders.map((order) => (
              <div key={order.id} className="info-order-row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--neutral-900)", marginBottom: 2 }}>{order.serviceTitle}</div>
                  <div style={{ fontSize: 11, color: "var(--neutral-500)" }}>
                    {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(order.startDate))} –{" "}
                    {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(order.endDate))}
                  </div>
                </div>
                <span className="badge" style={{ background: STATUS_COLORS[order.status] + "22", color: STATUS_COLORS[order.status], fontSize: 10, padding: "3px 7px", borderRadius: 20, whiteSpace: "nowrap", fontWeight: 600 }}>
                  {STATUS_LABELS[order.status]}
                </span>
              </div>
            ))}
          </div>
          {isAdmin && (
            <Link href={`/portal/admin/clients/${info.client.id}`} style={{ fontSize: 12, color: "var(--brand-accent)", textDecoration: "none", marginTop: 6, display: "block" }}>
              View all orders →
            </Link>
          )}
          {!isAdmin && (
            <Link href="/portal/client/orders" style={{ fontSize: 12, color: "var(--brand-accent)", textDecoration: "none", marginTop: 6, display: "block" }}>
              View all orders →
            </Link>
          )}
        </div>
      )}

      {/* Payments — SUPER ADMIN ONLY */}
      {isAdmin && info.payments && (
        <div className="info-section">
          <div className="info-section-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            PAYMENTS
            <span style={{ background: "#fef3c7", color: "#92400e", fontSize: 9, fontWeight: 700, padding: "2px 5px", borderRadius: 4, textTransform: "uppercase" }}>Admin Only</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
            <div className="info-payment-card" style={{ borderColor: "var(--brand-accent)" }}>
              <div style={{ fontSize: 11, color: "var(--neutral-500)", marginBottom: 2 }}>Total Paid</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "var(--brand-dark)" }}>{fmt(info.payments.totalPaid)}</div>
            </div>
            <div className="info-payment-card" style={{ borderColor: "#f59e0b" }}>
              <div style={{ fontSize: 11, color: "var(--neutral-500)", marginBottom: 2 }}>Due</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "#b45309" }}>{fmt(info.payments.totalDue)}</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: "var(--neutral-500)", marginBottom: 6 }}>{pct}% of {fmt(info.payments.totalBilled)} billed</div>
          <div className="info-progress-track">
            <div className="info-progress-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
        </div>
      )}

      {/* Thread members */}
      <div className="info-section">
        <div className="info-section-label">IN THIS THREAD</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {info.members.map((member) => (
            <div key={member.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--brand-mid)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                {member.avatarUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={member.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                  : (member.fullName?.[0] ?? member.email[0]).toUpperCase()
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--neutral-900)" }}>
                  {member.fullName ?? member.email}
                  {member.id === currentUserId && <span style={{ color: "var(--neutral-400)", marginLeft: 4, fontWeight: 400 }}>(you)</span>}
                </div>
              </div>
              <span style={{ fontSize: 11, color: "var(--neutral-400)" }}>
                {member.role === "SUPER_ADMIN" ? "Super Admin" : member.role === "TEAM_MEMBER" ? "Team" : "Client"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
