"use client";

import { Suspense, useState, FormEvent } from "react";
import { Loader2, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="auth-shell">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <h1 className="auth-title">Invalid Link</h1>
          <p className="auth-sub">This password reset link is invalid or missing.</p>
          <div style={{ marginTop: 24 }}>
            <Link href="/portal/forgot-password" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--brand-accent)", textDecoration: "none" }}>
              Request a new link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/portal/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Failed to reset password.");
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
        <h1 className="auth-title">Create new password</h1>
        <p className="auth-sub">Please enter your new password below.</p>

        {error && <div className="auth-error">{error}</div>}
        {success ? (
          <div style={{ padding: 16, background: "#e8f5f0", color: "#085e51", borderRadius: 8, fontSize: 14, textAlign: "center", marginBottom: 24, border: "1px solid #12c494" }}>
            Password reset successfully! You can now sign in with your new password.
            <div style={{ marginTop: 16 }}>
              <Link href="/portal/login" className="btn btn-primary" style={{ textDecoration: "none", display: "inline-flex", justifyContent: "center", width: "100%" }}>
                Go to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="password">New Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--neutral-400)", pointerEvents: "none" }} />
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: 36 }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--neutral-400)", pointerEvents: "none" }} />
                <input
                  id="confirmPassword"
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: 36 }}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 8, height: 42 }} disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Reset password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="auth-shell"><div className="auth-card" style={{ display: 'flex', justifyContent: 'center' }}><Loader2 className="animate-spin" /></div></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
