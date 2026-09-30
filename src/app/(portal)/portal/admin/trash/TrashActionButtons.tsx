"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCcw, Trash2 } from "lucide-react";

export default function TrashActionButtons({ type, id }: { type: "order" | "invoice" | "client", id: string }) {
  const router = useRouter();
  const [restoring, setRestoring] = useState(false);
  const [purging, setPurging] = useState(false);

  async function handleRestore() {
    if (!confirm(`Are you sure you want to restore this ${type}?`)) return;
    setRestoring(true);
    try {
      const res = await fetch(`/api/portal/${type}s/${id}/restore`, { method: "POST" });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to restore");
      }
    } finally {
      setRestoring(false);
    }
  }

  async function handlePurge() {
    if (!confirm(`WARNING: This will permanently delete this ${type}. This action cannot be undone. Are you sure?`)) return;
    setPurging(true);
    try {
      const res = await fetch(`/api/portal/${type}s/${id}/purge`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to delete permanently");
      }
    } finally {
      setPurging(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
      <button 
        onClick={handleRestore} 
        disabled={restoring || purging}
        className="btn btn-outline btn-sm"
        style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}
      >
        <RefreshCcw size={14} /> {restoring ? "Restoring..." : "Restore"}
      </button>
      <button 
        onClick={handlePurge} 
        disabled={restoring || purging}
        className="btn btn-primary btn-sm"
        style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, background: "var(--danger)", borderColor: "var(--danger)" }}
      >
        <Trash2 size={14} /> {purging ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}
