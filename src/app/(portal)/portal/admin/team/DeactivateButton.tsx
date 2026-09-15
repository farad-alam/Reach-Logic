"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserX, Loader2 } from "lucide-react";

export default function DeactivateButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDeactivate() {
    if (!confirm("Deactivate this team member? They will no longer be able to log in.")) return;
    setLoading(true);
    await fetch(`/api/portal/team/${userId}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handleDeactivate}
      disabled={loading}
      title="Deactivate team member"
      style={{
        background: "transparent", border: "1px solid var(--neutral-200)",
        borderRadius: 6, padding: "5px 10px", cursor: "pointer",
        color: "var(--neutral-500)", fontSize: 12, display: "flex",
        alignItems: "center", gap: 5, transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "#ef4444";
        (e.currentTarget as HTMLButtonElement).style.color = "#ef4444";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--neutral-200)";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--neutral-500)";
      }}
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : <UserX size={12} />}
      Deactivate
    </button>
  );
}
