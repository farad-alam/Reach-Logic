"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail } from "lucide-react";

export default function InviteTeamForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const res = await fetch("/api/portal/invite/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role: "TEAM_MEMBER" }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Failed to send invitation");
    } else {
      setSuccess(`Invitation sent to ${email}!`);
      setEmail("");
      setTimeout(() => router.push("/portal/admin/team"), 1500);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
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
      {success && <div className="auth-success" style={{ marginBottom: 12 }}>{success}</div>}
      <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
        {loading ? <Loader2 size={14} className="animate-spin" /> : null}
        Send Invitation
      </button>
    </form>
  );
}
