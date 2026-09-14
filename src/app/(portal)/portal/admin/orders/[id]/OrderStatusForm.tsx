"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const statuses = [
  { value: "PENDING", label: "Pending Start" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function OrderStatusForm({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === currentStatus) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/portal/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update status.");
        return;
      }

      router.refresh();
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--neutral-900)" }}>Project Status</h3>
        {status !== currentStatus && !loading && (
          <button type="submit" className="btn btn-primary btn-sm">Update Status</button>
        )}
        {loading && <Loader2 size={16} className="animate-spin" color="var(--brand-accent)" />}
      </div>
      
      {error && <div className="auth-error" style={{ padding: "8px 12px", marginBottom: 12 }}>{error}</div>}
      
      <select 
        className="form-select" 
        value={status} 
        onChange={(e) => setStatus(e.target.value)}
        disabled={currentStatus === "AWAITING_QUOTE" || loading}
      >
        {currentStatus === "AWAITING_QUOTE" && <option value="AWAITING_QUOTE">Awaiting Quote</option>}
        {statuses.map(s => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      {currentStatus === "AWAITING_QUOTE" && (
        <p style={{ fontSize: 12, color: "var(--neutral-500)", marginTop: 6 }}>
          Status cannot be changed until a quote is set.
        </p>
      )}
    </form>
  );
}
