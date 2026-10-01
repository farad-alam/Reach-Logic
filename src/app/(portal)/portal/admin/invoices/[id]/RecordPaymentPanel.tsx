"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DollarSign, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface Props {
  invoiceId: string;
  invoiceNumber: string;
  total: number;
  amountPaid: number;
  isPaid: boolean;
  isLocked: boolean;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default function RecordPaymentPanel({
  invoiceId, invoiceNumber, total, amountPaid, isPaid, isLocked
}: Props) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const balanceDue = Math.max(0, total - amountPaid);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError("Please enter a valid payment amount.");
      return;
    }
    if (numAmount > balanceDue + 0.01) {
      setError(`Amount cannot exceed the balance due of ${fmt(balanceDue)}.`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/portal/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "record_payment", amount: numAmount, method, paidAt, notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to record payment.");
        return;
      }
      setSuccess(`Payment of ${fmt(numAmount)} recorded. Email sent to client.`);
      setAmount("");
      setMethod("");
      setNotes("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function doAction(action: string) {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch(`/api/portal/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Action failed."); return; }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid var(--neutral-200)",
        borderRadius: 12,
        overflow: "hidden",
        marginTop: 24,
      }}
      data-html2canvas-ignore="true"
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 24px",
          background: "var(--neutral-50)",
          borderBottom: "1px solid var(--neutral-200)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <DollarSign size={16} color="var(--brand-accent)" />
        <span style={{ fontWeight: 700, fontSize: 14, color: "var(--neutral-900)" }}>
          Manage Payments
        </span>
      </div>

      <div style={{ padding: 24 }}>
        {/* Summary row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              background: "var(--neutral-50)",
              borderRadius: 8,
              padding: "14px 16px",
              border: "1px solid var(--neutral-200)",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--neutral-500)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
              Total Invoice
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--neutral-900)" }}>
              {fmt(total)}
            </div>
          </div>
          <div
            style={{
              background: "#f0fdf4",
              borderRadius: 8,
              padding: "14px 16px",
              border: "1px solid #bbf7d0",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 600, color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
              Total Paid
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#16a34a" }}>
              {fmt(amountPaid)}
            </div>
          </div>
          <div
            style={{
              background: balanceDue === 0 ? "#f0fdf4" : "#fff7ed",
              borderRadius: 8,
              padding: "14px 16px",
              border: `1px solid ${balanceDue === 0 ? "#bbf7d0" : "#fed7aa"}`,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 600, color: balanceDue === 0 ? "#16a34a" : "#ea580c", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
              Balance Due
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: balanceDue === 0 ? "#16a34a" : "#ea580c" }}>
              {balanceDue === 0 ? "PAID ✓" : fmt(balanceDue)}
            </div>
          </div>
        </div>

        {/* Messages */}
        {success && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#15803d" }}>
            <CheckCircle2 size={15} />
            {success}
          </div>
        )}
        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#dc2626" }}>
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        {/* Record Payment Form */}
        {!isPaid && !isLocked && (
          <form onSubmit={handleSubmit}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "var(--neutral-900)", marginBottom: 12 }}>
              Record a Payment Received
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 12 }}>
                  Amount Received <span style={{ color: "var(--brand-accent)" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--neutral-500)", fontSize: 14, fontWeight: 600 }}>$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={balanceDue}
                    className="form-input"
                    style={{ paddingLeft: 28 }}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`Max ${fmt(balanceDue)}`}
                    required
                  />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 12 }}>
                  Payment Method <span style={{ color: "var(--neutral-400)", fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Payoneer, Wise, PayPal"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 12 }}>
                  Payment Date <span style={{ color: "var(--brand-accent)" }}>*</span>
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={paidAt}
                  onChange={(e) => setPaidAt(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 12 }}>Notes <span style={{ color: "var(--neutral-400)", fontWeight: 400 }}>(optional)</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Any internal notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 16 }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ background: "var(--brand-dark)", borderColor: "var(--brand-dark)", height: 40, paddingInline: 24 }}
                disabled={loading}
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : "Save Payment & Email Client"}
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                disabled={loading}
                onClick={() => doAction("mark_paid")}
                style={{ height: 40, paddingInline: 20 }}
              >
                Mark as Fully Paid
              </button>
            </div>
            <p style={{ fontSize: 11, color: "var(--neutral-400)", marginTop: 10, margin: "10px 0 0" }}>
              💡 An email will automatically be sent to the client with the updated Total / Paid / Balance Due.
            </p>
          </form>
        )}

        {/* Reopen option */}
        {(isPaid || isLocked) && (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, color: "var(--neutral-600)" }}>
              {isPaid ? "This invoice is fully paid." : "This invoice is locked/cancelled."}
            </span>
            <button
              className="btn btn-outline btn-sm"
              disabled={loading}
              onClick={() => doAction("reopen")}
            >
              {loading ? <Loader2 size={13} className="animate-spin" /> : "Reopen Invoice"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
