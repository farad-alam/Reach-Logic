"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, Lock, User, Eye, EyeOff } from "lucide-react";

interface Props {
  token: string;
  email: string;
  role: string;
  inviterName: string;
}

export default function AcceptInviteForm({ token, email, role, inviterName }: Props) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPass) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/portal/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, fullName: fullName.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      // Auto sign-in after account creation
      await signIn("credentials", { email, password, redirect: false });

      if (data.role === "CLIENT") router.push("/portal/client");
      else if (data.role === "TEAM_MEMBER") router.push("/portal/team/messages");
      else router.push("/portal/admin");
    } finally {
      setLoading(false);
    }
  }

  const roleLabel = role === "CLIENT" ? "client" : "team member";

  return (
    <div className="auth-card">
      <div className="auth-logo">
        <div style={{ display:"inline-flex", alignItems:"center", gap:8 }}>
          <div style={{ width:36, height:36, background:"var(--brand-dark)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#12c494" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontFamily:"var(--font-fraunces)", fontSize:20, fontWeight:700, color:"var(--neutral-900)", letterSpacing:"-0.03em" }}>ReachLogic</span>
        </div>
      </div>

      <h1 className="auth-title">Set up your account</h1>
      <p className="auth-sub">
        <strong>{inviterName}</strong> invited you as a {roleLabel}.<br/>
        <span style={{ color:"var(--neutral-400)" }}>{email}</span>
      </p>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="fullName">Full name</label>
          <div style={{ position:"relative" }}>
            <User size={15} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"var(--neutral-400)", pointerEvents:"none" }} />
            <input id="fullName" type="text" className="form-input" style={{ paddingLeft:36 }}
              value={fullName} onChange={e => setFullName(e.target.value)}
              placeholder="Your full name" required />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">Create a password</label>
          <div style={{ position:"relative" }}>
            <Lock size={15} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"var(--neutral-400)", pointerEvents:"none" }} />
            <input id="password" type={showPass ? "text" : "password"} className="form-input"
              style={{ paddingLeft:36, paddingRight:40 }}
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 characters" required minLength={8} />
            <button type="button" onClick={() => setShowPass(!showPass)}
              style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"transparent", border:"none", cursor:"pointer", color:"var(--neutral-400)", display:"flex", padding:2 }}>
              {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>
          </div>
          <span className="form-hint">At least 8 characters.</span>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="confirmPass">Confirm password</label>
          <div style={{ position:"relative" }}>
            <Lock size={15} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"var(--neutral-400)", pointerEvents:"none" }} />
            <input id="confirmPass" type="password" className="form-input" style={{ paddingLeft:36 }}
              value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
              placeholder="Repeat your password" required />
          </div>
        </div>

        <button type="submit" className="btn btn-primary"
          style={{ width:"100%", justifyContent:"center", marginTop:8, height:42 }}
          disabled={loading}>
          {loading ? <Loader2 size={16} className="animate-spin"/> : "Create my account"}
        </button>
      </form>
    </div>
  );
}
