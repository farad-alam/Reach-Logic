"use client";
import { useState, Fragment } from "react";
import Link from "next/link";
import { Mail, RefreshCw, X, ChevronDown, ChevronUp, Users } from "lucide-react";
import DeleteRowAction from "@/components/portal/DeleteRowAction";

interface ColleagueData {
  id: string;
  fullName: string | null;
  email: string;
  isActive: boolean;
  threadName: string;
  status: string;
  invitedAt: Date;
}

interface ClientData {
  id: string;
  fullName: string | null;
  email: string;
  country?: string | null;
  state?: string | null;
  timezone?: string | null;
  isActive: boolean;
  createdAt: Date;
  orders: { status: string; amount: string | null }[];
  invoices: { isPaid: boolean; amountPaid: string | null; lineItems: { amount: string }[] }[];
  colleagues: ColleagueData[];
}

interface InviteData {
  id: string;
  email: string;
  createdAt: Date;
  expiresAt: Date;
}

function formatLocalTime(tz: string | null | undefined) {
  if (!tz) return null;
  try {
    return new Date().toLocaleTimeString("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit", hour12: true });
  } catch (e) {
    return null;
  }
}

export default function ClientTable({
  initialClients,
  initialInvites,
}: {
  initialClients: ClientData[];
  initialInvites: InviteData[];
}) {
  const [invites, setInvites] = useState(initialInvites);
  const [clients, setClients] = useState(initialClients);
  const [loading, setLoading] = useState<Record<string, string>>({});
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  function toggleRow(id: string) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function revoke(inviteId: string) {
    setLoading((p) => ({ ...p, [inviteId]: "revoke" }));
    await fetch("/api/portal/invite/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteId }),
    });
    setInvites((p) => p.filter((i) => i.id !== inviteId));
    setLoading((p) => {
      const n = { ...p };
      delete n[inviteId];
      return n;
    });
  }

  async function resend(inviteId: string) {
    setLoading((p) => ({ ...p, [inviteId]: "resend" }));
    const res = await fetch("/api/portal/invite/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteId }),
    });
    setLoading((p) => {
      const n = { ...p };
      delete n[inviteId];
      return n;
    });
    if (res.ok) {
      setInvites((p) =>
        p.map((i) =>
          i.id === inviteId
            ? { ...i, createdAt: new Date(), expiresAt: new Date(Date.now() + 7 * 86400000) }
            : i
        )
      );
    }
  }

  async function removeColleague(colleagueId: string) {
    if (!confirm("Are you sure you want to remove this colleague?")) return;
    setLoading((p) => ({ ...p, [colleagueId]: "remove" }));
    
    const res = await fetch(`/api/portal/colleagues/${colleagueId}/remove`, {
      method: "DELETE",
    });
    
    if (res.ok) {
      setClients((prev) => prev.map(c => ({
        ...c,
        colleagues: c.colleagues.filter(col => col.id !== colleagueId)
      })));
    } else {
      alert("Failed to remove colleague");
    }
    
    setLoading((p) => {
      const n = { ...p };
      delete n[colleagueId];
      return n;
    });
  }

  function getInitials(name: string | null | undefined, email: string | null | undefined) {
    if (name && name.trim()) {
      const parts = name.trim().split(/\s+/).filter(Boolean);
      if (parts.length > 0) {
        return parts.map((p) => p[0]?.toUpperCase() ?? "").join("").slice(0, 2);
      }
    }
    if (email && email.trim()) {
      return email.trim()[0]?.toUpperCase() ?? "C";
    }
    return "C";
  }

  const combined = [
    ...clients.map((c) => ({ type: "CLIENT" as const, data: c, date: new Date(c.createdAt) })),
    ...invites.map((i) => ({ type: "INVITE" as const, data: i, date: new Date(i.createdAt) })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  if (combined.length === 0) {
    return null;
  }

  return (
    <div className="table-wrapper">
      <table className="portal-table">
        <thead>
          <tr>
            <th>CLIENT</th>
            <th>COUNTRY</th>
            <th>STATE</th>
            <th>TIME ZONE</th>
            <th>ORDERS</th>
            <th>COLLEAGUES</th>
            <th>TOTAL VALUE</th>
            <th>STATUS</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {combined.map((item) => {
            if (item.type === "CLIENT") {
              const client = item.data as ClientData;
              const totalValue = client.orders.reduce((s, o) => s + Number(o.amount ?? 0), 0);
              const activeOrders = client.orders.filter(
                (o) => o.status === "IN_PROGRESS" || o.status === "PENDING"
              ).length;
              
              let paid = 0;
              for (const inv of client.invoices) {
                if (inv.isPaid) {
                  paid += inv.lineItems.reduce((s, li) => s + Number(li.amount), 0);
                } else if (inv.amountPaid) {
                  paid += Number(inv.amountPaid);
                }
              }
              const isExpanded = expandedRows.has(client.id);

              return (
                <Fragment key={`client-${client.id}`}>
                  <tr>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: "var(--brand-dark)",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 13,
                            fontWeight: 600,
                            flexShrink: 0,
                          }}
                        >
                          {getInitials(client.fullName, client.email)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: "var(--neutral-900)", fontSize: 14 }}>
                            {client.fullName ?? "—"}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--neutral-500)", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                            <Mail size={12} /> {client.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: "var(--neutral-600)", fontSize: 14 }}>{client.country || "—"}</td>
                    <td style={{ color: "var(--neutral-600)", fontSize: 14 }}>{client.state || "—"}</td>
                    <td>
                      {client.timezone ? (
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--neutral-900)", fontSize: 14 }}>
                            {client.timezone}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--neutral-500)", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            {formatLocalTime(client.timezone) ? `${formatLocalTime(client.timezone)} local time` : "local time"}
                          </div>
                        </div>
                      ) : "—"}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: "var(--neutral-900)", fontSize: 14 }}>
                        {client.orders.length}
                      </span>
                      {activeOrders > 0 && (
                        <span
                          style={{
                            marginLeft: 8,
                            padding: "2px 8px",
                            borderRadius: 12,
                            background: "#e8f5f0",
                            color: "#12c494",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {activeOrders} active
                        </span>
                      )}
                    </td>
                    <td>
                      {client.colleagues.length === 0 ? (
                        <span style={{ color: "var(--neutral-400)", fontSize: 14 }}>0</span>
                      ) : (
                        <button
                          onClick={() => toggleRow(client.id)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "4px 8px",
                            borderRadius: 6,
                            background: isExpanded ? "#085e51" : "#e8f5f0",
                            color: isExpanded ? "#fff" : "#085e51",
                            fontSize: 13,
                            fontWeight: 600,
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          <Users size={14} /> {client.colleagues.length} {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      )}
                    </td>
                    <td style={{ fontWeight: 700, color: "var(--neutral-900)", fontSize: 14 }}>
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalValue)}
                    </td>
                    <td>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: 6,
                          background: client.isActive ? "#e8f5f0" : "#fee2e2",
                          color: client.isActive ? "#12c494" : "#ef4444",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {client.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <Link
                          href={`/portal/admin/clients/${client.id}`}
                          className="btn btn-outline btn-sm"
                          style={{ background: "#fff", borderColor: "var(--neutral-200)", color: "var(--neutral-700)" }}
                        >
                          View
                        </Link>
                        <DeleteRowAction type="client" id={client.id} />
                      </div>
                    </td>
                  </tr>
                  
                  {isExpanded && (
                    <tr>
                      <td colSpan={9} style={{ padding: "0 20px 20px 20px", background: "#f8fafc", borderBottom: "1px solid var(--neutral-200)" }}>
                        <div style={{ background: "#fff", borderRadius: 8, border: "1px solid var(--neutral-200)", overflow: "hidden" }}>
                          <div style={{ padding: "12px 16px", background: "#f8fafc", borderBottom: "1px solid var(--neutral-200)", fontSize: 13, fontWeight: 600, color: "var(--brand-dark)", display: "flex", alignItems: "center", gap: 8 }}>
                            <Users size={14} /> Colleagues added by {client.fullName ?? "client"} ({client.colleagues.length})
                          </div>
                          <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                              <tr>
                                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--neutral-500)", borderBottom: "1px solid var(--neutral-100)" }}>NAME</th>
                                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--neutral-500)", borderBottom: "1px solid var(--neutral-100)" }}>EMAIL</th>
                                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--neutral-500)", borderBottom: "1px solid var(--neutral-100)" }}>THREAD ACCESS</th>
                                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--neutral-500)", borderBottom: "1px solid var(--neutral-100)" }}>ADDED ON</th>
                                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--neutral-500)", borderBottom: "1px solid var(--neutral-100)" }}>STATUS</th>
                                <th style={{ padding: "12px 16px", textAlign: "right", fontSize: 11, fontWeight: 600, color: "var(--neutral-500)", borderBottom: "1px solid var(--neutral-100)" }}></th>
                              </tr>
                            </thead>
                            <tbody>
                              {client.colleagues.map((col, idx) => {
                                // Group by colleague ID if we have multiple threads, but here they are flattened.
                                // It's fine to show a row per thread access as per the image
                                return (
                                  <tr key={`colleague-${col.id}-${idx}`}>
                                    <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--neutral-100)" }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#f1f5f9", color: "var(--neutral-700)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600 }}>
                                          {getInitials(col.fullName, col.email)}
                                        </div>
                                        <span style={{ fontWeight: 600, fontSize: 13, color: "var(--neutral-900)" }}>{col.fullName}</span>
                                      </div>
                                    </td>
                                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--neutral-600)", borderBottom: "1px solid var(--neutral-100)" }}>{col.email}</td>
                                    <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--neutral-100)" }}>
                                      <span style={{ padding: "2px 8px", borderRadius: 4, background: "#eff6ff", color: "#3b82f6", fontSize: 12, fontWeight: 500 }}>
                                        {col.threadName}
                                      </span>
                                    </td>
                                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--neutral-500)", borderBottom: "1px solid var(--neutral-100)" }}>
                                      {new Date(col.invitedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--neutral-100)" }}>
                                      <span style={{
                                        padding: "2px 8px", borderRadius: 12, fontSize: 12, fontWeight: 500,
                                        background: col.status === "ACTIVE" ? "#e8f5f0" : "#fef3c7",
                                        color: col.status === "ACTIVE" ? "#12c494" : "#d97706",
                                      }}>
                                        {col.status === "ACTIVE" ? "Active" : "Invited"}
                                      </span>
                                    </td>
                                    <td style={{ padding: "12px 16px", textAlign: "right", borderBottom: "1px solid var(--neutral-100)" }}>
                                      <button 
                                        style={{ background: "none", border: "none", color: "#ef4444", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
                                        onClick={() => removeColleague(col.id)}
                                        disabled={!!loading[col.id]}
                                      >
                                        {loading[col.id] ? "Removing..." : "Remove"}
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            } else {
              const invite = item.data as InviteData;
              return (
                <tr key={`invite-${invite.id}`}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: "var(--brand-dark)",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        {getInitials(null, invite.email)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--neutral-900)", fontSize: 14 }}>
                          {invite.email.split("@")[0]}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--neutral-500)", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                          <Mail size={12} /> {invite.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: "var(--neutral-600)", fontSize: 14 }}>—</td>
                  <td style={{ color: "var(--neutral-600)", fontSize: 14 }}>—</td>
                  <td style={{ color: "var(--neutral-600)", fontSize: 14 }}>—</td>
                  <td>
                    <span style={{ fontWeight: 600, color: "var(--neutral-900)", fontSize: 14 }}>0</span>
                  </td>
                  <td style={{ color: "var(--neutral-600)", fontSize: 14 }}>—</td>
                  <td style={{ fontWeight: 700, color: "var(--neutral-900)", fontSize: 14 }}>$0.00</td>
                  <td>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 6,
                        background: "#fef3c7",
                        color: "#d97706",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      Invited
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button
                        className="btn btn-outline btn-sm"
                        disabled={!!loading[invite.id]}
                        onClick={() => resend(invite.id)}
                        title="Resend invitation"
                        style={{ background: "#fff", borderColor: "var(--neutral-200)", color: "var(--neutral-700)" }}
                      >
                        {loading[invite.id] === "resend" ? <RefreshCw size={14} className="animate-spin" /> : "Resend"}
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ color: "var(--danger)", borderColor: "var(--danger)", background: "#fff" }}
                        disabled={!!loading[invite.id]}
                        onClick={() => revoke(invite.id)}
                        title="Revoke invitation"
                      >
                        {loading[invite.id] === "revoke" ? <RefreshCw size={14} className="animate-spin" /> : "Revoke"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }
          })}
        </tbody>
      </table>
    </div>
  );
}
