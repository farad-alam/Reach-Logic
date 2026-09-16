"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, Send, XCircle, RotateCcw } from "lucide-react";

interface Props {
  invoiceId: string;
  isPaid: boolean;
  isLocked: boolean;
}

export default function InvoiceActions({ invoiceId, isPaid, isLocked }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  async function doAction(action: string) {
    setLoading(action);
    setError("");
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
      setLoading(null);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {error && <p style={{ fontSize: 13, color: "var(--danger)", margin: 0 }}>{error}</p>}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {!isPaid && !isLocked && (
          <>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => doAction("mark_sent")}
              disabled={!!loading}
              title="Log that this invoice was sent to the client"
            >
              {loading === "mark_sent" ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
              Mark Sent
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => doAction("mark_paid")}
              disabled={!!loading}
            >
              {loading === "mark_paid" ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
              Mark Paid
            </button>
            <button
              className="btn btn-outline btn-sm"
              style={{ color: "var(--danger)", borderColor: "currentColor" }}
              onClick={() => doAction("cancel")}
              disabled={!!loading}
            >
              {loading === "cancel" ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
              Cancel
            </button>
          </>
        )}
        {(isPaid || isLocked) && (
          <button
            className="btn btn-outline btn-sm"
            onClick={() => doAction("reopen")}
            disabled={!!loading}
          >
            {loading === "reopen" ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
            Reopen
          </button>
        )}
      </div>
    </div>
  );
}
