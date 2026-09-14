"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, CheckCircle } from "lucide-react";

export default function InviteClientForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/portal/invite/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim(), role: "CLIENT" }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to send invitation."); return; }
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div style={{ textAlign: "center", padding: "16px 0" }}>
        <CheckCircle size={40} color="var(--success)" style={{ marginBottom: 12 }} />
        <div style={{ fontSize: 16, fontWeight: 600, color: "var(--neutral-900)", marginBottom: 6 }}>
          Invitation sent!
        </div>
        <p style={{ fontSize: 14, color: "var(--neutral-500)", marginBottom: 20 }}>
          An invitation email has been sent to <strong>{email}</strong>.<br/>
          The link expires in 7 days.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button className="btn btn-outline" onClick={() => { setSent(false); setEmail(""); }}>
            Invite another
          </button>
          <button className="btn btn-primary" onClick={() => router.push("/portal/admin/clients")}>
            Back to Clients
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="auth-error">{error}</div>}
      <div className="form-group">
        <label className="form-label" htmlFor="clientEmail">Client email address</label>
        <div style={{ position: "relative" }}>
          <Mail size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--neutral-400)", pointerEvents: "none" }} />
          <input id="clientEmail" type="email" className="form-input" style={{ paddingLeft: 36 }}
            value={email} onChange={e => setEmail(e.target.value)}
            placeholder="client@company.com" required />
        </div>
        <span className="form-hint">The client will receive a secure invitation link valid for 7 days.</span>
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
        <button type="button" className="btn btn-outline" onClick={() => router.back()}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <Loader2 size={14} className="animate-spin" /> : "Send Invitation"}
        </button>
      </div>
    </form>
  );
}
