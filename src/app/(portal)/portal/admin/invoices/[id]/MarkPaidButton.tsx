"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";

export default function MarkPaidButton({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  async function handleMarkPaid() {
    if (!confirm("Are you sure you want to mark this invoice as paid?")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/portal/invoices/${invoiceId}/pay`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to mark invoice as paid.");
      setLoading(false); // only reset if error, otherwise let redirect handle it
    }
  }

  return (
    <button className="btn btn-primary" onClick={handleMarkPaid} disabled={loading} style={{ background: "var(--success)" }}>
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
      Mark as Paid
    </button>
  );
}
