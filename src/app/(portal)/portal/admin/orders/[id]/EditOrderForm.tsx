"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, X, Edit2 } from "lucide-react";

interface Props {
  orderId: string;
  initialData: {
    serviceTitle: string;
    description: string;
    startDate: Date;
    endDate: Date;
    amount: string | null;
    status: string;
    billingCity: string | null;
    billingState: string | null;
    billingCountry: string | null;
  };
}

export default function EditOrderForm({ orderId, initialData }: Props) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    serviceTitle: initialData.serviceTitle,
    description: initialData.description,
    startDate: initialData.startDate.toISOString().split("T")[0],
    endDate: initialData.endDate.toISOString().split("T")[0],
    amount: initialData.amount || "",
    status: initialData.status,
    billingCity: initialData.billingCity || "",
    billingState: initialData.billingState || "",
    billingCountry: initialData.billingCountry || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/portal/orders/${orderId}/edit`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        amount: formData.amount ? formData.amount : null,
      }),
    });
    setLoading(false);
    if (!res.ok) { setError("Failed to update order."); return; }
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button className="btn btn-outline" onClick={() => setOpen(true)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
        <Edit2 size={14} /> Edit Order
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ marginTop: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontWeight: 600, fontSize: 15, color: "var(--neutral-900)" }}>Edit Order Details</span>
        <button type="button" onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--neutral-400)" }}>
          <X size={16} />
        </button>
      </div>
      {error && <div className="auth-error" style={{ marginBottom: 12 }}>{error}</div>}
      
      <div className="grid-2">
        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
          <label className="form-label">Service Title</label>
          <input type="text" className="form-input" required value={formData.serviceTitle} onChange={(e) => setFormData({...formData, serviceTitle: e.target.value})} />
        </div>
        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
          <label className="form-label">Description</label>
          <textarea className="form-input" required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} style={{ minHeight: 80 }} />
        </div>
        <div className="form-group">
          <label className="form-label">Start Date</label>
          <input type="date" className="form-input" required value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
        </div>
        <div className="form-group">
          <label className="form-label">End Date</label>
          <input type="date" className="form-input" required value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
        </div>
        <div className="form-group">
          <label className="form-label">Amount (Optional)</label>
          <input type="number" step="0.01" className="form-input" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-input" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
            <option value="AWAITING_QUOTE">AWAITING_QUOTE</option>
            <option value="PENDING">PENDING</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      <div style={{ marginTop: 24, marginBottom: 16, fontWeight: 600, fontSize: 14 }}>Billing Details</div>
      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">City</label>
          <input type="text" className="form-input" value={formData.billingCity} onChange={(e) => setFormData({...formData, billingCity: e.target.value})} />
        </div>
        <div className="form-group">
          <label className="form-label">State / Region</label>
          <input type="text" className="form-input" value={formData.billingState} onChange={(e) => setFormData({...formData, billingState: e.target.value})} />
        </div>
        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
          <label className="form-label">Country</label>
          <input type="text" className="form-input" value={formData.billingCountry} onChange={(e) => setFormData({...formData, billingCountry: e.target.value})} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
        <button type="button" className="btn btn-outline" onClick={() => setOpen(false)}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          Save Changes
        </button>
      </div>
    </form>
  );
}
