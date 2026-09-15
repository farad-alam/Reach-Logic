"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquare } from "lucide-react";

export default function StartThreadButton({ clientId }: { clientId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleStart() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/portal/threads/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create thread");
        return;
      }
      // Refresh the page — thread now exists
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <button
        onClick={handleStart}
        disabled={loading}
        className="btn btn-primary"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14} />}
        Start Conversation
      </button>
      {error && <p style={{ fontSize: 13, color: "var(--danger)" }}>{error}</p>}
    </div>
  );
}
