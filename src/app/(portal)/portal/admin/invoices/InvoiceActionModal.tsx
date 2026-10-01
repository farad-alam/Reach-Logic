"use client";
import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface InvoiceActionModalProps {
  invoiceId: string;
  invoiceNumber: string;
  amountPaid: number;
  action: "refund" | "void" | "system_glitch";
  onClose: () => void;
}

export default function InvoiceActionModal({ invoiceId, invoiceNumber, amountPaid, action, onClose }: InvoiceActionModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [refundType, setRefundType] = useState<"FULL" | "PARTIAL">("FULL");
  const [refundAmount, setRefundAmount] = useState(amountPaid.toString());
  const [refundMethod, setRefundMethod] = useState("Original Payment Method");
  const [reason, setReason] = useState("");
  const [actionDate, setActionDate] = useState(new Date().toISOString().split("T")[0]);
  const [emailClient, setEmailClient] = useState(true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload: any = { action, reason, emailClient };
      
      if (action === "refund") {
        if (refundType === "PARTIAL") {
          const amt = parseFloat(refundAmount);
          if (isNaN(amt) || amt <= 0) {
            setError("Enter a valid refund amount.");
            setLoading(false);
            return;
          }
          if (amt > amountPaid) {
            setError(`Cannot refund more than what was paid ($${amountPaid.toFixed(2)}).`);
            setLoading(false);
            return;
          }
          payload.refundAmount = amt;
        }
        payload.refundType = refundType;
        payload.refundMethod = refundMethod;
        payload.refundDate = actionDate;
      } else {
        payload.actionDate = actionDate;
      }

      const res = await fetch(`/api/portal/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to perform action");
      
      router.refresh();
      onClose();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  const title = action === "refund" ? "Issue Refund" : action === "void" ? "Void Invoice" : "Mark as System Glitch";

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: "24px 32px", width: 440, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", cursor: "pointer", color: "var(--neutral-400)" }}>
          <X size={20} />
        </button>
        <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px", color: "var(--neutral-900)" }}>{title}</h3>
        <p style={{ fontSize: 13, color: "var(--neutral-500)", marginBottom: 24 }}>Invoice {invoiceNumber}</p>

        <form onSubmit={handleSubmit}>
          {action === "refund" && (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Refund Type</label>
                <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                    <input type="radio" name="refundType" checked={refundType === "FULL"} onChange={() => setRefundType("FULL")} /> Full Refund
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                    <input type="radio" name="refundType" checked={refundType === "PARTIAL"} onChange={() => setRefundType("PARTIAL")} /> Partial Refund
                  </label>
                </div>
              </div>

              {refundType === "PARTIAL" && (
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Refund Amount (USD)</label>
                  <input type="number" min="0.01" step="0.01" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} required style={inputStyle} />
                  <p style={{ fontSize: 11, color: "var(--neutral-500)", marginTop: 4 }}>Max allowed: ${amountPaid.toFixed(2)}</p>
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Refund Method</label>
                <input type="text" value={refundMethod} onChange={(e) => setRefundMethod(e.target.value)} required style={inputStyle} placeholder="e.g. Original Payment Method, Bank Transfer" />
              </div>
            </>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Date</label>
            <input type="date" value={actionDate} onChange={(e) => setActionDate(e.target.value)} required style={inputStyle} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Reason (Required)</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} required rows={3} style={{ ...inputStyle, resize: "none" }} placeholder="Provide a reason for the audit log..." />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", color: "var(--neutral-700)" }}>
              <input type="checkbox" checked={emailClient} onChange={(e) => setEmailClient(e.target.checked)} />
              Email the updated invoice to the client
            </label>
          </div>

          {error && <p style={{ fontSize: 13, color: "#dc2626", marginBottom: 16 }}>{error}</p>}

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--neutral-200)", background: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "var(--brand-dark)", color: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
              {loading ? <Loader2 size={14} className="animate-spin" /> : null}
              Confirm Action
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "var(--neutral-600)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", border: "1px solid var(--neutral-200)", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", color: "#111827", background: "#fff", fontFamily: "inherit" };
