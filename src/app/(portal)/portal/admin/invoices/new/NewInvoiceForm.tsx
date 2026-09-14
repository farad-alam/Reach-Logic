"use client";
import { useState, FormEvent, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";

interface ClientData {
  id: string;
  fullName: string | null;
  email: string;
  clientOrders: Array<{ id: string; serviceTitle: string; amount: number | null }>;
}

export default function NewInvoiceForm({
  clients,
  initialOrderId,
}: {
  clients: ClientData[];
  initialOrderId?: string;
}) {
  const router = useRouter();
  
  // Find initial client if orderId provided
  const initialClient = useMemo(() => {
    if (!initialOrderId) return "";
    for (const c of clients) {
      if (c.clientOrders.some(o => o.id === initialOrderId)) return c.id;
    }
    return "";
  }, [clients, initialOrderId]);

  const [clientId, setClientId] = useState(initialClient);
  const [orderId, setOrderId] = useState(initialOrderId || "");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  
  const [lineItems, setLineItems] = useState([{ description: "", quantity: 1, rate: 0 }]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedClient = clients.find(c => c.id === clientId);
  const availableOrders = selectedClient?.clientOrders || [];

  // When client changes, reset order unless we just loaded
  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setClientId(e.target.value);
    setOrderId("");
  };

  // If they select an order that has a quoted amount and no line items exist yet, auto-fill it?
  // Let's just leave it manual for flexibility, or maybe auto-fill on order change.
  const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setOrderId(val);
    if (val && lineItems.length === 1 && lineItems[0].description === "" && lineItems[0].rate === 0) {
      const ord = availableOrders.find(o => o.id === val);
      if (ord && ord.amount) {
        setLineItems([{ description: ord.serviceTitle, quantity: 1, rate: Number(ord.amount) }]);
      }
    }
  };

  const total = lineItems.reduce((acc, item) => acc + (item.quantity * item.rate), 0);

  const addLineItem = () => setLineItems([...lineItems, { description: "", quantity: 1, rate: 0 }]);
  const removeLineItem = (idx: number) => setLineItems(lineItems.filter((_, i) => i !== idx));

  const updateLineItem = (idx: number, field: "description" | "quantity" | "rate", val: string | number) => {
    const newItems = [...lineItems];
    newItems[idx] = { ...newItems[idx], [field]: val };
    setLineItems(newItems);
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!clientId || !orderId || !dueDate || lineItems.length === 0) {
      setError("Please fill all required fields and add at least one line item.");
      return;
    }
    
    // Validate line items
    if (lineItems.some(i => !i.description || i.quantity <= 0 || i.rate < 0)) {
       setError("Please provide a description, valid quantity (>0), and rate (>=0) for all line items.");
       return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/portal/invoices/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          orderId,
          dueDate,
          notes,
          lineItems,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create invoice.");
        return;
      }

      router.push(`/portal/admin/invoices/${data.invoiceId}`);
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}
      
      <div className="grid-2">
        <div className="form-group">
          <label className="form-label" htmlFor="client">Client</label>
          <select id="client" className="form-select" value={clientId} onChange={handleClientChange} required>
            <option value="">Select a client...</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.fullName ?? c.email}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="order">Project</label>
          <select id="order" className="form-select" value={orderId} onChange={handleOrderChange} required disabled={!clientId}>
            <option value="">Select a project...</option>
            {availableOrders.map(o => (
              <option key={o.id} value={o.id}>{o.serviceTitle} {o.amount ? `($${Number(o.amount).toFixed(2)})` : ""}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="dueDate">Due Date</label>
        <input 
          id="dueDate" 
          type="date" 
          className="form-input" 
          value={dueDate} 
          onChange={(e) => setDueDate(e.target.value)} 
          required 
          style={{ maxWidth: 200 }}
        />
      </div>

      <div style={{ marginTop: 24, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--neutral-200)", paddingBottom: 8 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--neutral-900)" }}>Line Items</h3>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
        {lineItems.map((item, idx) => (
          <div key={idx} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Description" 
                value={item.description} 
                onChange={(e) => updateLineItem(idx, "description", e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0, maxWidth: 100 }}>
              <input 
                type="number" 
                min="0.1" 
                step="any"
                className="form-input" 
                placeholder="Qty" 
                value={item.quantity} 
                onChange={(e) => updateLineItem(idx, "quantity", Number(e.target.value))}
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0, maxWidth: 140 }}>
               <div style={{ position: "relative" }}>
                 <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--neutral-500)", fontWeight: 500 }}>$</span>
                 <input 
                   type="number" 
                   min="0" 
                   step="0.01"
                   className="form-input" 
                   style={{ paddingLeft: 22 }}
                   placeholder="Rate" 
                   value={item.rate === 0 ? "" : item.rate} 
                   onChange={(e) => updateLineItem(idx, "rate", Number(e.target.value))}
                   required
                 />
               </div>
            </div>
            <div style={{ padding: "9px 12px", minWidth: 100, textAlign: "right", fontWeight: 600, color: "var(--neutral-900)" }}>
              ${(item.quantity * item.rate).toFixed(2)}
            </div>
            {lineItems.length > 1 && (
              <button type="button" onClick={() => removeLineItem(idx)} style={{ background: "transparent", border: "none", color: "var(--danger)", padding: "10px", cursor: "pointer" }}>
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>

      <button type="button" className="btn btn-outline btn-sm" onClick={addLineItem} style={{ marginBottom: 24 }}>
        <Plus size={14} /> Add Line Item
      </button>

      <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--neutral-200)", paddingTop: 16, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--neutral-600)", textTransform: "uppercase" }}>Total</span>
          <span style={{ fontSize: 24, fontWeight: 700, color: "var(--neutral-900)" }}>${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: 24 }}>
        <label className="form-label" htmlFor="notes">Notes (Visible to client)</label>
        <textarea 
          id="notes" 
          className="form-textarea" 
          rows={3}
          value={notes} 
          onChange={(e) => setNotes(e.target.value)} 
          placeholder="Thank you for your business!" 
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <button type="button" className="btn btn-outline" onClick={() => router.back()}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : "Generate Invoice"}
        </button>
      </div>
    </form>
  );
}
