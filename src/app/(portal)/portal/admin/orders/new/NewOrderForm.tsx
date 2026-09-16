"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface Client {
  id: string;
  fullName: string | null;
  email: string;
}

export default function NewOrderForm({ clients }: { clients: Client[] }) {
  const router = useRouter();
  const [clientId, setClientId] = useState("");
  const [serviceTitle, setServiceTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!clientId) { setError("Please select a client."); return; }
    if (endDate && startDate && endDate < startDate) {
      setError("End date must be on or after start date.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/portal/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, serviceTitle, description, startDate, endDate }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to create order."); return; }
      router.push(`/portal/admin/orders/${data.orderId}`);
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="form-group">
        <label className="form-label" htmlFor="order-client">Client *</label>
        <select
          id="order-client"
          className="form-select"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          required
        >
          <option value="">Select a client…</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.fullName ?? c.email}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="order-title">Service Title *</label>
        <input
          id="order-title"
          type="text"
          className="form-input"
          value={serviceTitle}
          onChange={(e) => setServiceTitle(e.target.value)}
          placeholder="e.g. SEO Strategy & Content Plan"
          required
          maxLength={150}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="order-desc">Description / Requirements *</label>
        <textarea
          id="order-desc"
          className="form-textarea"
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the scope of work…"
          required
          maxLength={3000}
        />
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label className="form-label" htmlFor="order-start">Start Date *</label>
          <input
            id="order-start"
            type="date"
            className="form-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="order-end">End Date *</label>
          <input
            id="order-end"
            type="date"
            className="form-input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
        <button type="button" className="btn btn-outline" onClick={() => router.back()}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <Loader2 size={14} className="animate-spin" /> : null}
          Create Order
        </button>
      </div>
    </form>
  );
}
