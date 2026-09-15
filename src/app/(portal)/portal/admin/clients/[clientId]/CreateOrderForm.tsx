"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShoppingBag } from "lucide-react";

interface Props {
  clientId: string;
  clientName: string;
}

export default function CreateOrderForm({ clientId, clientName }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    serviceTitle: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (new Date(form.endDate) <= new Date(form.startDate)) {
      setError("End date must be after start date.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/portal/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, clientId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create order");
        return;
      }
      router.push(`/portal/admin/orders/${data.orderId}`);
    } finally {
      setLoading(false);
    }
  }

  // Get today's date in YYYY-MM-DD for min attribute
  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label" htmlFor="serviceTitle">Service / Project Title</label>
        <input
          id="serviceTitle"
          type="text"
          className="form-input"
          value={form.serviceTitle}
          onChange={set("serviceTitle")}
          placeholder="e.g. Brand Identity Design"
          required
          maxLength={150}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="description">Description</label>
        <textarea
          id="description"
          className="form-textarea"
          value={form.description}
          onChange={set("description")}
          placeholder="Describe the scope of work..."
          required
          rows={4}
          maxLength={3000}
          style={{ resize: "vertical" }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="form-group">
          <label className="form-label" htmlFor="startDate">Start Date</label>
          <input
            id="startDate"
            type="date"
            className="form-input"
            value={form.startDate}
            onChange={set("startDate")}
            min={today}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="endDate">End Date</label>
          <input
            id="endDate"
            type="date"
            className="form-input"
            value={form.endDate}
            onChange={set("endDate")}
            min={form.startDate || today}
            required
          />
        </div>
      </div>

      {error && (
        <div className="auth-error" style={{ marginBottom: 12 }}>{error}</div>
      )}

      <div style={{ fontSize: 12, color: "var(--neutral-400)", marginBottom: 14 }}>
        Order will be created with status <strong>Awaiting Quote</strong>. You can set the price from the order detail page.
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        style={{ width: "100%", justifyContent: "center" }}
        disabled={loading}
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <ShoppingBag size={14} />}
        Create Order for {clientName}
      </button>
    </form>
  );
}
