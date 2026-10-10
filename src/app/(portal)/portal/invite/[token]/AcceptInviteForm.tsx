"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, Lock } from "lucide-react";

interface Props {
  token: string;
  email: string;
  role: string;
  inviterName: string;
}

export default function AcceptInviteForm({ token, email, role, inviterName }: Props) {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!agreeTerms) {
      setError("You must agree to the Terms of Service.");
      return;
    }

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
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const res = await fetch("/api/portal/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, fullName, city: city.trim(), state: state.trim(), timezone: timezone.trim(), country: country.trim(), password }),
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

  return (
    <div className="invite-auth-card">
      <h1 className="invite-auth-title">Create your account</h1>
      <p className="invite-auth-sub">Fields marked * are required.</p>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Email Field - Disabled */}
        <div className="form-group" style={{ marginBottom: 20 }}>
          <label className="form-label">Email</label>
          <div style={{ position: "relative" }}>
            <input 
              type="text" 
              className="form-input" 
              value={email} 
              disabled 
              style={{ backgroundColor: "var(--neutral-50)", color: "var(--neutral-500)", paddingRight: 40 }}
            />
            <Lock size={15} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--neutral-400)", pointerEvents: "none" }} />
          </div>
          <span className="form-hint" style={{ marginTop: 4 }}>From your invitation, can't be changed</span>
        </div>

        {/* Name Grid */}
        <div className="form-group-grid" style={{ marginBottom: 20 }}>
          <div>
            <label className="form-label" htmlFor="firstName">First Name <span style={{color: 'var(--danger)'}}>*</span></label>
            <input id="firstName" type="text" className="form-input"
              value={firstName} onChange={e => setFirstName(e.target.value)}
              placeholder="e.g. John" required />
          </div>
          <div>
            <label className="form-label" htmlFor="lastName">Last Name <span style={{color: 'var(--danger)'}}>*</span></label>
            <input id="lastName" type="text" className="form-input"
              value={lastName} onChange={e => setLastName(e.target.value)}
              placeholder="e.g. Smith" required />
          </div>
        </div>

        {/* Location Grid */}
        <div className="form-group-grid" style={{ marginBottom: 20 }}>
          <div>
            <label className="form-label" htmlFor="city">City <span style={{color: 'var(--danger)'}}>*</span></label>
            <input id="city" type="text" className="form-input"
              value={city} onChange={e => setCity(e.target.value)}
              placeholder="e.g. Brooklyn" required />
          </div>
          <div>
            <label className="form-label" htmlFor="state">State/Province <span style={{color: 'var(--danger)'}}>*</span></label>
            <input id="state" type="text" className="form-input"
              value={state} onChange={e => setState(e.target.value)}
              placeholder="e.g. New York" required />
          </div>
        </div>

        <div className="form-group-grid" style={{ marginBottom: 20 }}>
          <div>
            <label className="form-label" htmlFor="country">Country <span style={{color: 'var(--danger)'}}>*</span></label>
            <select id="country" className="form-input" value={country} onChange={e => setCountry(e.target.value)} required>
              <option value="" disabled>Select country</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="Bangladesh">Bangladesh</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="form-label" htmlFor="timezone">Time Zone <span style={{color: 'var(--danger)'}}>*</span></label>
            <select id="timezone" className="form-input" value={timezone} onChange={e => setTimezone(e.target.value)} required>
              <option value="" disabled>Select timezone</option>
              <option value="EST">(UTC-05:00) Eastern Time</option>
              <option value="CST">(UTC-06:00) Central Time</option>
              <option value="MST">(UTC-07:00) Mountain Time</option>
              <option value="PST">(UTC-08:00) Pacific Time</option>
              <option value="GMT">(UTC+00:00) Greenwich Mean Time</option>
              <option value="CET">(UTC+01:00) Central European Time</option>
              <option value="BST">(UTC+06:00) Bangladesh Time</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Password Grid */}
        <div className="form-group-grid" style={{ marginBottom: 24 }}>
          <div>
            <label className="form-label" htmlFor="password">Password <span style={{color: 'var(--danger)'}}>*</span></label>
            <input id="password" type="password" className="form-input"
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="At least 8 characters" required minLength={8} />
          </div>
          <div>
            <label className="form-label" htmlFor="confirmPass">Confirm Password <span style={{color: 'var(--danger)'}}>*</span></label>
            <input id="confirmPass" type="password" className="form-input"
              value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
              placeholder="Repeat password" required />
          </div>
        </div>

        {/* Terms Checkbox */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <input 
            type="checkbox" 
            id="terms" 
            checked={agreeTerms} 
            onChange={(e) => setAgreeTerms(e.target.checked)}
            style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--brand-dark)' }} 
            required 
          />
          <label htmlFor="terms" style={{ fontSize: 13, color: 'var(--neutral-600)', cursor: 'pointer' }}>
            I agree to the <a href="/terms-of-service" style={{ color: 'var(--brand-accent)', textDecoration: 'underline' }}>Terms of Service</a> and <a href="/privacy-policy" style={{ color: 'var(--brand-accent)', textDecoration: 'underline' }}>Privacy Policy</a> <span style={{color: 'var(--danger)'}}>*</span>
          </label>
        </div>

        <button type="submit" className="btn btn-primary"
          style={{ width: "100%", justifyContent: "center", height: 48, fontSize: 15, background: 'var(--brand-dark)', color: '#fff', border: 'none' }}
          disabled={loading}>
          {loading ? <Loader2 size={18} className="animate-spin"/> : "Create Account"}
        </button>
      </form>
    </div>
  );
}
