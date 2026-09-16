"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, User, CheckCircle2 } from "lucide-react";

export default function InviteTeamForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/portal/invite/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name: name.trim() || undefined, role: "TEAM_MEMBER" }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Failed to send invitation");
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "16px 0" }}>
        <CheckCircle2 size={40} color="var(--success)" style={{ margin: "0 auto 16px" }} />
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--neutral-900)", marginBottom: 8 }}>
          Invitation sent!
        </div>
        <p style={{ fontSize: 14, color: "var(--neutral-500)", marginBottom: 24 }}>
          An invite email has been sent to <strong>{email}</strong>.
          They will appear in the Pending Invitations list until they accept.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button className="btn btn-outline" onClick={() => { setSuccess(false); setEmail(""); setName(""); }}>
            Invite Another
          </button>
          <button className="btn btn-primary" onClick={() => router.push("/portal/admin/team")}>
            Back to Team
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label" htmlFor="tm-name">Name (optional)</label>
        <div style={{ position: "relative" }}>
          <User size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--neutral-400)", pointerEvents: "none" }} />
          <input
            id="tm-name"
            type="text"
            className="form-input"
            style={{ paddingLeft: 34 }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Johnson"
          />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="tm-email">Email address</label>
        <div style={{ position: "relative" }}>
          <Mail size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--neutral-400)", pointerEvents: "none" }} />
          <input
            id="tm-email"
            type="email"
            className="form-input"
            style={{ paddingLeft: 34 }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@example.com"
            required
          />
        </div>
      </div>
      {error && <div className="auth-error" style={{ marginBottom: 12 }}>{error}</div>}
      <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
        {loading ? <Loader2 size={14} className="animate-spin" /> : null}
        Send Invitation
      </button>
    </form>
  );
}
