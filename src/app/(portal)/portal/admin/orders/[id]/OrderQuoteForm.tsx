"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function OrderQuoteForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/portal/orders/${orderId}/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount) }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit quote.");
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
      <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--warning)", marginBottom: 8 }}>Action Required: Quote Project</h3>
      <p style={{ fontSize: 13, color: "var(--neutral-600)", marginBottom: 16 }}>This order is awaiting a quote. Entering an amount will move it to Pending status.</p>
      
      {error && <div className="auth-error" style={{ padding: "8px 12px", marginBottom: 12 }}>{error}</div>}
      
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--neutral-500)", fontWeight: 500 }}>$</span>
          <input 
            type="number" 
            step="0.01" 
            min="0"
            className="form-input" 
            style={{ paddingLeft: 24, fontSize: 16, fontWeight: 600 }}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ background: "var(--warning)", color: "#fff" }}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : "Set Quote"}
        </button>
      </div>
    </form>
  );
}
