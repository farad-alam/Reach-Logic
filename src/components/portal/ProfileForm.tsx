"use client";
import { useState, FormEvent } from "react";
import { Loader2, Check, Camera, MapPin } from "lucide-react";

interface Props {
  initialName: string;
  initialEmail: string;
  initialAvatar?: string | null;
  initialCompany?: string;
  initialPhone?: string;
  initialAddress?: string;
}

export default function ProfileForm({
  initialName,
  initialEmail,
  initialAvatar,
  initialCompany = "",
  initialPhone = "",
  initialAddress = "",
}: Props) {
  const [fullName, setFullName] = useState(initialName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatar ?? "");
  const [company, setCompany] = useState(initialCompany);
  const [phone, setPhone] = useState(initialPhone);
  const [address, setAddress] = useState(initialAddress);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileLoading, setProfileLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [passMsg, setPassMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleProfile(e: FormEvent) {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const res = await fetch("/api/portal/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          avatarUrl: avatarUrl || null,
          company: company || null,
          phone: phone || null,
          address: address || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setProfileMsg({ ok: false, text: data.error ?? "Update failed" });
      } else {
        setProfileMsg({ ok: true, text: "Profile updated successfully!" });
      }
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePassword(e: FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPassMsg({ ok: false, text: "New passwords do not match" });
      return;
    }
    setPassLoading(true);
    setPassMsg(null);
    try {
      const res = await fetch("/api/portal/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPassMsg({ ok: false, text: data.error ?? "Password change failed" });
      } else {
        setPassMsg({ ok: true, text: "Password changed successfully!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } finally {
      setPassLoading(false);
    }
  }

  function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 600 }}>
      {/* Profile Section */}
      <div className="card card-sm">
        <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--neutral-900)", marginBottom: 20 }}>
          Profile Information
        </h2>

        {/* Avatar preview */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "var(--brand-dark)", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 700, overflow: "hidden", flexShrink: 0,
          }}>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              getInitials(fullName || initialEmail)
            )}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--neutral-900)" }}>{initialEmail}</div>
            <div style={{ fontSize: 12, color: "var(--neutral-400)", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
              <Camera size={12} /> Paste an image URL below to update your avatar
            </div>
          </div>
        </div>

        <form onSubmit={handleProfile}>
          <div className="form-group">
            <label className="form-label" htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              className="form-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="avatarUrl">Avatar URL <span style={{ color: "var(--neutral-400)", fontWeight: 400 }}>(optional)</span></label>
            <input
              id="avatarUrl"
              type="url"
              className="form-input"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          {profileMsg && (
            <div className={profileMsg.ok ? "auth-success" : "auth-error"} style={{ marginBottom: 12 }}>
              {profileMsg.text}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-sm" disabled={profileLoading}>
            {profileLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Save Changes
          </button>
        </form>
      </div>

      {/* Billing Address Section */}
      <div className="card card-sm">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <MapPin size={16} color="var(--brand-accent)" />
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--neutral-900)", margin: 0 }}>
            Billing Address
          </h2>
        </div>
        <p style={{ fontSize: 13, color: "var(--neutral-500)", marginBottom: 20 }}>
          Used to auto-fill your billing details on invoices. You can always override this per invoice.
        </p>

        <form onSubmit={handleProfile}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="company">Company / Business Name</label>
              <input
                id="company"
                type="text"
                className="form-input"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Inc. (optional)"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 000 0000 (optional)"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="address">Full Billing Address</label>
            <textarea
              id="address"
              className="form-textarea"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={"123 Main Street\nNew York, NY 10001\nUnited States"}
            />
            <div style={{ fontSize: 12, color: "var(--neutral-400)", marginTop: 6 }}>
              This address will be automatically added to any new invoices created for your account.
            </div>
          </div>

          {profileMsg && (
            <div className={profileMsg.ok ? "auth-success" : "auth-error"} style={{ marginBottom: 12 }}>
              {profileMsg.text}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-sm" disabled={profileLoading}>
            {profileLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Save Billing Address
          </button>
        </form>
      </div>

      {/* Password Section */}
      <div className="card card-sm">
        <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--neutral-900)", marginBottom: 20 }}>
          Change Password
        </h2>
        <form onSubmit={handlePassword}>
          <div className="form-group">
            <label className="form-label" htmlFor="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              type="password"
              className="form-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              className="form-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          {passMsg && (
            <div className={passMsg.ok ? "auth-success" : "auth-error"} style={{ marginBottom: 12 }}>
              {passMsg.text}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-sm" disabled={passLoading}>
            {passLoading ? <Loader2 size={14} className="animate-spin" /> : null}
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
