"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, X, Edit2, Plus, Trash2 } from "lucide-react";

interface LineItem {
  description: string;
  quantity: string;
  rate: string;
}

interface Props {
  invoiceId: string;
  initialData: {
    dueDate: Date;
    notes: string | null;
    isPaid: boolean;
    paidAt: Date | null;
    amountPaid: string;
    billingName: string | null;
    billingEmail: string | null;
    billingCompany: string | null;
    billingAddress: string | null;
    lineItems: LineItem[];
  };
}

export default function EditInvoiceForm({ invoiceId, initialData }: Props) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    dueDate: initialData.dueDate.toISOString().split("T")[0],
    notes: initialData.notes || "",
    isPaid: initialData.isPaid,
    paidAt: initialData.paidAt ? initialData.paidAt.toISOString().split("T")[0] : "",
    amountPaid: initialData.amountPaid,
    billingName: initialData.billingName || "",
    billingEmail: initialData.billingEmail || "",
    billingCompany: initialData.billingCompany || "",
    billingAddress: initialData.billingAddress || "",
    lineItems: initialData.lineItems,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/portal/invoices/${invoiceId}/edit`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        dueDate: new Date(formData.dueDate).toISOString(),
        paidAt: formData.paidAt ? new Date(formData.paidAt).toISOString() : null,
      }),
    });
    setLoading(false);
    if (!res.ok) { setError("Failed to update invoice."); return; }
    setOpen(false);
    router.refresh();
  }

  function handleAddLineItem() {
    setFormData({
      ...formData,
      lineItems: [...formData.lineItems, { description: "", quantity: "1", rate: "0" }],
    });
  }

  function handleRemoveLineItem(index: number) {
    setFormData({
      ...formData,
      lineItems: formData.lineItems.filter((_, i) => i !== index),
    });
  }

  function handleLineItemChange(index: number, field: keyof LineItem, value: string) {
    const newItems = [...formData.lineItems];
    newItems[index][field] = value;
    setFormData({ ...formData, lineItems: newItems });
  }

  if (!open) {
    return (
      <button className="btn btn-outline" onClick={() => setOpen(true)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
        <Edit2 size={14} /> Edit Invoice
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ marginTop: 24, marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontWeight: 600, fontSize: 15, color: "var(--neutral-900)" }}>Edit Invoice Details</span>
        <button type="button" onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--neutral-400)" }}>
          <X size={16} />
        </button>
      </div>
      {error && <div className="auth-error" style={{ marginBottom: 12 }}>{error}</div>}
      
      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Due Date</label>
          <input type="date" className="form-input" required value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} />
        </div>
        <div className="form-group">
          <label className="form-label">Is Paid?</label>
          <div style={{ display: "flex", alignItems: "center", height: 38 }}>
            <input type="checkbox" checked={formData.isPaid} onChange={(e) => setFormData({...formData, isPaid: e.target.checked})} style={{ width: 18, height: 18 }} />
          </div>
        </div>
        {formData.isPaid && (
          <div className="form-group">
            <label className="form-label">Paid At</label>
            <input type="date" className="form-input" required={formData.isPaid} value={formData.paidAt} onChange={(e) => setFormData({...formData, paidAt: e.target.value})} />
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Amount Paid</label>
          <input type="number" step="0.01" className="form-input" value={formData.amountPaid} onChange={(e) => setFormData({...formData, amountPaid: e.target.value})} />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Notes</label>
        <textarea className="form-input" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
      </div>

      <div style={{ marginTop: 24, marginBottom: 16, fontWeight: 600, fontSize: 14 }}>Billing Details</div>
      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Name</label>
          <input type="text" className="form-input" value={formData.billingName} onChange={(e) => setFormData({...formData, billingName: e.target.value})} />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input type="email" className="form-input" value={formData.billingEmail} onChange={(e) => setFormData({...formData, billingEmail: e.target.value})} />
        </div>
        <div className="form-group">
          <label className="form-label">Company</label>
          <input type="text" className="form-input" value={formData.billingCompany} onChange={(e) => setFormData({...formData, billingCompany: e.target.value})} />
        </div>
        <div className="form-group">
          <label className="form-label">Address</label>
          <input type="text" className="form-input" value={formData.billingAddress} onChange={(e) => setFormData({...formData, billingAddress: e.target.value})} />
        </div>
      </div>

      <div style={{ marginTop: 24, marginBottom: 16, fontWeight: 600, fontSize: 14, display: "flex", justifyContent: "space-between" }}>
        <span>Line Items</span>
        <button type="button" onClick={handleAddLineItem} className="btn btn-outline btn-sm" style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Plus size={14} /> Add Item
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {formData.lineItems.map((item, index) => (
          <div key={index} style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 40px", gap: 12, alignItems: "center" }}>
            <input type="text" className="form-input" placeholder="Description" required value={item.description} onChange={(e) => handleLineItemChange(index, "description", e.target.value)} />
            <input type="number" step="0.01" className="form-input" placeholder="Qty" required value={item.quantity} onChange={(e) => handleLineItemChange(index, "quantity", e.target.value)} />
            <input type="number" step="0.01" className="form-input" placeholder="Rate" required value={item.rate} onChange={(e) => handleLineItemChange(index, "rate", e.target.value)} />
            <button type="button" onClick={() => handleRemoveLineItem(index)} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer" }}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24 }}>
        <button type="button" className="btn btn-outline" onClick={() => setOpen(false)}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          Save Changes
        </button>
      </div>
    </form>
  );
}
