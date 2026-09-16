"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserX, UserCheck } from "lucide-react";

export default function DeactivateClientButton({
  clientId,
  isActive,
}: {
  clientId: string;
  isActive: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleToggle() {
    if (!confirm(isActive ? "Deactivate this client? They will lose portal access." : "Reactivate this client?")) return;
    setLoading(true);
    setError("");
    const res = await fetch(`/api/portal/clients/${clientId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Failed."); return; }
    router.refresh();
  }

  return (
    <div>
      {error && <p style={{ color: "var(--danger)", fontSize: 12, margin: "0 0 4px" }}>{error}</p>}
      <button
        className="btn btn-outline btn-sm"
        onClick={handleToggle}
        disabled={loading}
        style={{ color: isActive ? "var(--danger)" : "var(--success)", borderColor: "currentColor" }}
      >
        {loading ? (
          <Loader2 size={12} className="animate-spin" />
        ) : isActive ? (
          <UserX size={12} />
        ) : (
          <UserCheck size={12} />
        )}
        {isActive ? "Deactivate" : "Reactivate"}
      </button>
    </div>
  );
}
