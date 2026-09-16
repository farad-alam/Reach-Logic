"use client";
import { useState } from "react";
import { Mail, RefreshCw, X, Copy, Check, Clock } from "lucide-react";

interface Invite {
  id: string;
  email: string;
  createdAt: Date;
  expiresAt: Date;
}

function timeAgo(d: Date) {
  const secs = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

function daysLeft(d: Date) {
  const ms = new Date(d).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86400000));
}

export default function PendingInvitesList({
  invites,
  role,
  baseUrl,
}: {
  invites: Invite[];
  role: "CLIENT" | "TEAM_MEMBER";
  baseUrl: string;
}) {
  const [list, setList] = useState(invites);
  const [loading, setLoading] = useState<Record<string, string>>({}); // inviteId -> action
  const [copied, setCopied] = useState<string | null>(null);

  if (list.length === 0) return null;

  async function revoke(inviteId: string) {
    setLoading((p) => ({ ...p, [inviteId]: "revoke" }));
    await fetch("/api/portal/invite/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteId }),
    });
    setList((p) => p.filter((i) => i.id !== inviteId));
    setLoading((p) => { const n = { ...p }; delete n[inviteId]; return n; });
  }

  async function resend(inviteId: string) {
    setLoading((p) => ({ ...p, [inviteId]: "resend" }));
    const res = await fetch("/api/portal/invite/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteId }),
    });
    setLoading((p) => { const n = { ...p }; delete n[inviteId]; return n; });
    if (res.ok) {
      // Update the expiry shown (approximate — refresh would be exact)
      setList((p) =>
        p.map((i) =>
          i.id === inviteId
            ? { ...i, createdAt: new Date(), expiresAt: new Date(Date.now() + 7 * 86400000) }
            : i
        )
      );
    }
  }

  function copyLink(inviteId: string, token?: string) {
    // We don't have the raw token here — deep-link to invite page using inviteId is not ideal.
    // Instead, the admin can just resend. We show a tooltip to explain.
    // If you want real copy-link you need to expose the token — skip for now and just show "Resend" CTA.
    navigator.clipboard.writeText(`${baseUrl}/portal/invite/[token-not-available-resend-instead]`);
    setCopied(inviteId);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Clock size={15} color="var(--warning)" />
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--neutral-700)" }}>
          Pending Invitations ({list.length})
        </span>
      </div>
      <div className="card card-sm" style={{ padding: 0 }}>
        {list.map((inv, i) => {
          const days = daysLeft(inv.expiresAt);
          const isExpiring = days <= 1;
          return (
            <div
              key={inv.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                borderBottom: i < list.length - 1 ? "1px solid var(--neutral-100)" : "none",
              }}
            >
              <Mail size={15} color="var(--neutral-400)" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--neutral-900)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {inv.email}
                </div>
                <div style={{ fontSize: 11, color: isExpiring ? "var(--danger)" : "var(--neutral-400)", marginTop: 2 }}>
                  Sent {timeAgo(inv.createdAt)} · {days === 0 ? "Expires today" : `Expires in ${days}d`}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button
                  className="btn btn-outline btn-sm"
                  disabled={!!loading[inv.id]}
                  onClick={() => resend(inv.id)}
                  title="Resend invitation email"
                >
                  {loading[inv.id] === "resend" ? (
                    <RefreshCw size={12} className="animate-spin" />
                  ) : (
                    <RefreshCw size={12} />
                  )}
                  Resend
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  style={{ color: "var(--danger)", borderColor: "var(--danger)" }}
                  disabled={!!loading[inv.id]}
                  onClick={() => revoke(inv.id)}
                  title="Revoke invitation"
                >
                  {loading[inv.id] === "revoke" ? (
                    <RefreshCw size={12} className="animate-spin" />
                  ) : (
                    <X size={12} />
                  )}
                  Revoke
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
