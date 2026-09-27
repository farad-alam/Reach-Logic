"use client";

import { useState, FormEvent } from "react";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/portal/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Failed to send reset email.");
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 36, height: 36, background: "var(--brand-dark)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#12c494" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span style={{ fontFamily: "var(--font-fraunces)", fontSize: 20, fontWeight: 700, color: "var(--neutral-900)", letterSpacing: "-0.03em" }}>
              ReachLogic
            </span>
          </div>
        </div>

        <h1 className="auth-title">Reset your password</h1>
        <p className="auth-sub">Enter your email and we'll send you a link to reset your password.</p>

        {error && <div className="auth-error">{error}</div>}
        {success ? (
          <div style={{ padding: 16, background: "#e8f5f0", color: "#085e51", borderRadius: 8, fontSize: 14, textAlign: "center", marginBottom: 24, border: "1px solid #12c494" }}>
            Check your email! We sent a password reset link to <strong>{email}</strong>.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email address</label>
              <div style={{ position: "relative" }}>
                <Mail size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--neutral-400)", pointerEvents: "none" }} />
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: 36 }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 8, height: 42 }} disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Send reset link"}
            </button>
          </form>
        )}

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Link href="/portal/login" style={{ fontSize: 14, color: "var(--neutral-500)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <ArrowLeft size={14} /> Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
