"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ChevronDown, Plus, Pencil, CircleDollarSign, Mail, RotateCcw, Ban, Activity } from "lucide-react";
import InvoiceActionModal from "./InvoiceActionModal";

interface Props {
  invoiceId: string;
  isPaid: boolean;
  isLocked: boolean;
  invoiceNumber: string;
  amountPaid: number;
}

export default function InvoiceManageDropdown({ invoiceId, isPaid, isLocked, invoiceNumber, amountPaid }: Props) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number, right: number } | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [showActionModal, setShowActionModal] = useState<"refund" | "void" | "system_glitch" | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click and calculate coords
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    
    function onScroll() {
      if (open) setOpen(false);
    }

    if (open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
      
      window.addEventListener("scroll", onScroll, { capture: true, passive: true });
      window.addEventListener("resize", onScroll);
    }
    
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  async function doAction(action: string, extra?: Record<string, unknown>) {
    setLoading(action);
    setError("");
    setOpen(false);
    try {
      const res = await fetch(`/api/portal/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Action failed."); return; }
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function handleRecordPayment() {
    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) { setError("Enter a valid payment amount."); return; }
    await doAction("record_payment", { amount: amt });
    setShowRecordPayment(false);
    setPaymentAmount("");
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }} ref={ref}>
      {error && <p style={{ fontSize: 12, color: "#dc2626", margin: "0 0 4px", textAlign: "right" }}>{error}</p>}

      {/* Record Payment Modal */}
      {showRecordPayment && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowRecordPayment(false); }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 32, width: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: "var(--neutral-900)" }}>Record Payment</h3>
            <p style={{ fontSize: 13, color: "var(--neutral-500)", marginBottom: 20 }}>Invoice {invoiceNumber}</p>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--neutral-600)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Amount Paid (USD)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="e.g. 150.00"
              style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--neutral-200)", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 20, color: "#111827", background: "#fff" }}
              autoFocus
            />
            {error && <p style={{ fontSize: 12, color: "#dc2626", marginBottom: 12 }}>{error}</p>}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => { setShowRecordPayment(false); setPaymentAmount(""); setError(""); }}
                style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--neutral-200)", background: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>
                Cancel
              </button>
              <button
                onClick={handleRecordPayment}
                disabled={!!loading}
                style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "var(--brand-dark)", color: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
                {loading === "record_payment" ? <Loader2 size={13} className="animate-spin" /> : null}
                Save Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Button */}
      <button
        onClick={() => setOpen(!open)}
        disabled={!!loading}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "7px 14px", borderRadius: 8,
          background: "var(--brand-dark)", color: "#fff",
          border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
          opacity: loading ? 0.7 : 1,
        }}>
        {loading ? <Loader2 size={13} className="animate-spin" /> : <Pencil size={13} />}
        Manage
        <ChevronDown size={13} style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0)" }} />
      </button>

      {/* Dropdown */}
      {open && coords && (
        <div style={{
          position: "fixed", right: coords.right, top: coords.top, zIndex: 9999,
          background: "#fff", borderRadius: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.06)",
          border: "1px solid var(--neutral-100)", minWidth: 240, overflow: "hidden",
        }}>
          {!isLocked && (
            <>
              <button
                onClick={() => { setOpen(false); setShowRecordPayment(true); }}
                style={dropItemStyle}>
                <Plus size={14} color="#16a34a" />
                <span>Record Payment</span>
              </button>
              <a
                href={`/portal/admin/invoices/${invoiceId}`}
                style={dropItemStyle as React.CSSProperties}>
                <Pencil size={14} color="var(--neutral-500)" />
                <span>Edit Invoice (amount, dates, items)</span>
              </a>
            </>
          )}
          <button
            onClick={() => doAction("resend_email")}
            style={dropItemStyle}>
            <Mail size={14} color="var(--neutral-500)" />
            <span>Resend Invoice Email</span>
          </button>
          
          <div style={{ padding: "10px 16px 4px", fontSize: 10, fontWeight: 700, color: "var(--neutral-400)", textTransform: "uppercase", letterSpacing: "0.06em", background: "#fafafa" }}>
            Payment received but…
          </div>

          <button
            onClick={() => { setOpen(false); setShowActionModal("refund"); }}
            style={{ ...dropItemStyle, color: "#dc2626" }}>
            <RotateCcw size={14} color="#dc2626" />
            <span>Refund (full or partial)</span>
          </button>
          <button
            onClick={() => { setOpen(false); setShowActionModal("void"); }}
            style={dropItemStyle}>
            <Ban size={14} color="var(--neutral-500)" />
            <span>Void</span>
          </button>
          <button
            onClick={() => { setOpen(false); setShowActionModal("system_glitch"); }}
            style={{ ...dropItemStyle, borderBottom: "none", color: "#6d28d9" }}>
            <Activity size={14} color="#6d28d9" />
            <span>System Glitch</span>
          </button>
        </div>
      )}

      {showActionModal && (
        <InvoiceActionModal
          invoiceId={invoiceId}
          invoiceNumber={invoiceNumber}
          amountPaid={amountPaid}
          action={showActionModal}
          onClose={() => setShowActionModal(null)}
        />
      )}
    </div>
  );
}

const dropItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "11px 16px",
  background: "transparent",
  border: "none",
  width: "100%",
  textAlign: "left",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  color: "var(--neutral-700)",
  textDecoration: "none",
  borderBottom: "1px solid var(--neutral-50)",
  transition: "background 0.1s",
};
