"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserCheck } from "lucide-react";

export default function ReactivateButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleReactivate() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/portal/team/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: true }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Failed to reactivate."); return; }
    router.refresh();
  }

  return (
    <div>
      {error && <p style={{ color: "var(--danger)", fontSize: 12, margin: "0 0 4px" }}>{error}</p>}
      <button className="btn btn-outline btn-sm" onClick={handleReactivate} disabled={loading} style={{ color: "var(--success)", borderColor: "var(--success)" }}>
        {loading ? <Loader2 size={12} className="animate-spin" /> : <UserCheck size={12} />}
        Reactivate
      </button>
    </div>
  );
}
