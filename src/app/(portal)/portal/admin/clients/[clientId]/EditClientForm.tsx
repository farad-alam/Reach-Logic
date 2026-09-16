"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, X } from "lucide-react";

interface Props {
  clientId: string;
  initialData: {
    fullName: string | null;
    company: string | null;
    phone: string | null;
    address: string | null;
  };
}

export default function EditClientForm({ clientId, initialData }: Props) {
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState(initialData.fullName ?? "");
  const [company, setCompany] = useState(initialData.company ?? "");
  const [phone, setPhone] = useState(initialData.phone ?? "");
  const [address, setAddress] = useState(initialData.address ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/portal/clients/${clientId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: fullName.trim() || undefined,
        company: company.trim() || null,
        phone: phone.trim() || null,
        address: address.trim() || null,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Failed to update."); return; }
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button className="btn btn-outline btn-sm" onClick={() => setOpen(true)}>
        Edit Profile
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ marginTop: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontWeight: 600, fontSize: 15, color: "var(--neutral-900)" }}>Edit Client Profile</span>
        <button type="button" onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--neutral-400)" }}>
          <X size={16} />
        </button>
      </div>
      {error && <div className="auth-error" style={{ marginBottom: 12 }}>{error}</div>}
      <div className="grid-2">
        <div className="form-group">
          <label className="form-label" htmlFor="ec-name">Full Name</label>
          <input id="ec-name" type="text" className="form-input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Smith" maxLength={120} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="ec-company">Company</label>
          <input id="ec-company" type="text" className="form-input" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Inc." maxLength={120} />
        </div>
      </div>
      <div className="grid-2">
        <div className="form-group">
          <label className="form-label" htmlFor="ec-phone">Phone</label>
          <input id="ec-phone" type="tel" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" maxLength={30} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="ec-address">Address</label>
          <input id="ec-address" type="text" className="form-input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, City" maxLength={300} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button type="button" className="btn btn-outline" onClick={() => setOpen(false)}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          Save Changes
        </button>
      </div>
    </form>
  );
}
