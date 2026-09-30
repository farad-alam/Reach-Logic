"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ExternalLink, Plus, Clock } from "lucide-react";

interface Member {
  id: string;
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
  role: string;
  designation?: string | null;
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
    company?: string | null;
    createdAt: string;
    country?: string | null;
    state?: string | null;
    timezone?: string | null;
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
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);
}
function fmtDate(d: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(d));
}
function fmtShortRange(start: string, end: string) {
  const s = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(start));
  const e = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(end));
  return `${s} to ${e}`;
}

function Initials({ name, email, size = 44 }: { name: string | null; email: string; size?: number }) {
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
  userRole = "CLIENT",
}: {
  threadId: string;
  currentUserId: string;
  userRole?: "SUPER_ADMIN" | "TEAM_MEMBER" | "CLIENT";
}) {
  const isSuperAdmin = userRole === "SUPER_ADMIN";
  const isTeamMember = userRole === "TEAM_MEMBER";
  const isClient = userRole === "CLIENT";
  const isStaff = isSuperAdmin || isTeamMember;
  const [info, setInfo] = useState<ThreadInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  
  const [teamEmail, setTeamEmail] = useState("");
  const [addingTeam, setAddingTeam] = useState(false);
  const [addTeamOpen, setAddTeamOpen] = useState(false);

  const fetchInfo = () => {
    setLoading(true);
    fetch(`/api/portal/threads/${threadId}/info`)
      .then((r) => r.json())
      .then((d) => setInfo(d.thread ?? null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInfo();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  async function handleInvite() {
    if (!inviteEmail.trim() || inviting) return;
    setInviting(true);
    try {
      const res = await fetch(`/api/portal/threads/${threadId}/invite-colleague`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim() })
      });
      if (res.ok) {
        setInviteEmail("");
        setInviteOpen(false);
        fetchInfo();
      } else {
        alert("Failed to invite colleague.");
      }
    } finally {
      setInviting(false);
    }
  }

  async function handleAddTeam() {
    if (!teamEmail.trim() || addingTeam) return;
    setAddingTeam(true);
    try {
      const res = await fetch(`/api/portal/threads/${threadId}/add-team-member`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: teamEmail.trim() })
      });
      if (res.ok) {
        setTeamEmail("");
        setAddTeamOpen(false);
        fetchInfo();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to add team member.");
      }
    } finally {
      setAddingTeam(false);
    }
  }

  if (loading) {
    return (
      <div className="thread-info-sidebar">
        <div style={{ padding: 24, color: "var(--neutral-400)", fontSize: 13 }}>Loading info…</div>
      </div>
    );
  }

  if (!info) return null;

  const pct = info.payments && info.payments.totalBilled > 0
    ? Math.round((info.payments.totalPaid / info.payments.totalBilled) * 100)
    : 100;

  const agencyTeam = info.members.filter(m => m.role === "SUPER_ADMIN" || m.role === "TEAM_MEMBER");
  const clientTeam = info.members.filter(m => m.role === "CLIENT");

  return (
    <div className="thread-info-sidebar">
      {/* Client card */}
      <div className="info-section">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <Initials name={info.client.fullName} email={isTeamMember ? "C" : info.client.email} size={44} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--neutral-900)" }}>
              {info.client.fullName || (isTeamMember ? "Client" : info.client.email)}
            </div>
            {!isClient && !isTeamMember && (
              <div style={{ fontSize: 12, color: "var(--neutral-500)" }}>{info.client.email}</div>
            )}
            {isClient && <div style={{ fontSize: 11, color: "var(--neutral-400)", marginTop: 2 }}>Since {fmtDate(info.client.createdAt)}</div>}
          </div>
        </div>
        {isSuperAdmin && (
          <Link href={`/portal/admin/clients/${info.client.id}`} style={{ fontSize: 12, color: "var(--brand-accent)", display: "flex", alignItems: "center", gap: 4, textDecoration: "none", fontWeight: 600 }}>
            View profile <ExternalLink size={12} />
          </Link>
        )}
      </div>

      {/* SUPER_ADMIN VIEW: Client Info */}
      {isSuperAdmin && (
        <div className="info-section">
          <div className="info-section-label">CLIENT INFO</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--neutral-500)" }}>Country</span>
              <span style={{ fontWeight: 600, color: "var(--neutral-900)" }}>{info.client.country || "United States"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--neutral-500)" }}>State</span>
              <span style={{ fontWeight: 600, color: "var(--neutral-900)" }}>{info.client.state || "New York"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--neutral-500)" }}>Time Zone</span>
              <span style={{ fontWeight: 600, color: "var(--neutral-900)" }}>{info.client.timezone || "EST (UTC-5)"}</span>
            </div>
          </div>
          <div style={{
            background: "#f8fafc",
            border: "1px solid var(--neutral-200)",
            borderRadius: 8,
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            color: "var(--neutral-700)",
            fontWeight: 500,
          }}>
            <Clock size={14} color="var(--neutral-500)" />
            <span>Client&apos;s local time: <strong>10:57 PM</strong></span>
          </div>
        </div>
      )}

      {/* CLIENT VIEW: Payment Status Card */}
      {isClient && info.payments && (
        <div className="info-section">
          <div className="info-section-label" style={{ display: "flex", justifyContent: "space-between" }}>
            PAYMENT STATUS
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <div style={{ border: "1px solid #bbf7d0", background: "#f0fdf4", borderRadius: 8, padding: "8px 10px" }}>
              <div style={{ fontSize: 11, color: "#166534", fontWeight: 600, marginBottom: 2 }}>Paid</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#15803d" }}>{fmt(info.payments.totalPaid)}</div>
            </div>
            <div style={{ border: "1px solid #fef3c7", background: "#fffbeb", borderRadius: 8, padding: "8px 10px" }}>
              <div style={{ fontSize: 11, color: "#92400e", fontWeight: 600, marginBottom: 2 }}>Due</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#b45309" }}>{fmt(info.payments.totalDue)}</div>
            </div>
          </div>
          <div className="info-progress-track" style={{ height: 4, borderRadius: 2, background: "var(--neutral-100)", overflow: "hidden" }}>
            <div className="info-progress-fill" style={{ width: `${Math.min(pct, 100)}%`, height: "100%", background: "#10b981" }} />
          </div>
        </div>
      )}

      {/* STAFF & CLIENT VIEW: Projects in this Thread */}
      {(isStaff || isClient) && info.orders.length > 0 && (
        <div className="info-section">
          <div className="info-section-label">PROJECTS IN THIS THREAD</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {info.orders.map((order) => (
              <div key={order.id} style={{
                background: "#fff",
                border: "1px solid var(--neutral-200)",
                borderRadius: 8,
                padding: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--neutral-900)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {order.serviceTitle}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--neutral-500)", marginTop: 2 }}>
                    {fmtShortRange(order.startDate, order.endDate)}
                  </div>
                </div>
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "4px 8px",
                  borderRadius: 12,
                  whiteSpace: "nowrap",
                  background: order.status === "COMPLETED" ? "#dcfce7" : "#fef3c7",
                  color: order.status === "COMPLETED" ? "#15803d" : "#b45309",
                }}>
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* IN THIS THREAD (Both Client & Team/Admin Views) */}
      <div className="info-section">
        <div className="info-section-label">IN THIS THREAD</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {info.members.map((member) => {
            const isSelf = member.id === currentUserId;
            let roleSubtitle = "";
            
            if (member.role === "SUPER_ADMIN" || member.role === "TEAM_MEMBER") {
              roleSubtitle = member.designation ? member.designation : (member.role === "SUPER_ADMIN" ? "ReachLogic Team" : "ReachLogic Team");
            } else if (member.role === "CLIENT") {
              roleSubtitle = "Client";
            } else if (member.role === "CLIENT_COLLEAGUE") {
              roleSubtitle = "Colleague";
            }

            return (
              <div key={member.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Initials name={member.fullName} email={isTeamMember && member.role === "CLIENT" ? "C" : member.email} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--neutral-900)" }}>
                    {member.fullName || (isTeamMember && member.role === "CLIENT" ? "Client" : member.email)}
                    {isSelf && !member.fullName?.includes("(you)") && <span style={{ color: "var(--neutral-500)", marginLeft: 4, fontWeight: 400 }}>(you)</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--neutral-500)" }}>
                    {roleSubtitle}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add Colleague Button for Client View */}
          {isClient && (
            <div style={{ marginTop: 8 }}>
              {!inviteOpen ? (
                <button
                  onClick={() => setInviteOpen(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    width: "100%",
                    padding: "8px 12px",
                    background: "#f0fdf4",
                    border: "1px dashed #10b981",
                    borderRadius: 8,
                    color: "#059669",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <Plus size={14} /> Add your colleague here
                </button>
              ) : (
                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    type="email"
                    placeholder="Colleague email..."
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    style={{ flex: 1, minWidth: 0, padding: "6px 8px", fontSize: 12, borderRadius: 6, border: "1px solid var(--neutral-200)", outline: "none", color: "var(--neutral-900)" }}
                  />
                  <button
                    onClick={handleInvite}
                    disabled={inviting || !inviteEmail.trim()}
                    style={{ background: "#10b981", color: "#fff", border: "none", borderRadius: 6, padding: "0 10px", fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: (!inviteEmail.trim() || inviting) ? 0.5 : 1 }}
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Add Team Member Button for Admin View */}
          {isSuperAdmin && (
            <div style={{ marginTop: 8 }}>
              {!addTeamOpen ? (
                <button
                  onClick={() => setAddTeamOpen(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    width: "100%",
                    padding: "8px 12px",
                    background: "#f8fafc",
                    border: "1px dashed #6366f1",
                    borderRadius: 8,
                    color: "#4f46e5",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <Plus size={14} /> Add Team Member
                </button>
              ) : (
                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    type="email"
                    placeholder="Team member email..."
                    value={teamEmail}
                    onChange={(e) => setTeamEmail(e.target.value)}
                    style={{ flex: 1, minWidth: 0, padding: "6px 8px", fontSize: 12, borderRadius: 6, border: "1px solid var(--neutral-200)", outline: "none", color: "var(--neutral-900)" }}
                  />
                  <button
                    onClick={handleAddTeam}
                    disabled={addingTeam || !teamEmail.trim()}
                    style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 6, padding: "0 10px", fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: (!teamEmail.trim() || addingTeam) ? 0.5 : 1 }}
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
