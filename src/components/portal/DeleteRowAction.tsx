"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteRowAction({ type, id }: { type: "order" | "invoice" | "client", id: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/portal/${type}s/${id}/delete`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        alert(`Failed to delete ${type}`);
        setDeleting(false);
      }
    } catch (e) {
      alert(`Error deleting ${type}`);
      setDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="btn btn-outline btn-sm"
      title={`Delete ${type}`}
      style={{ padding: "0 8px", color: "var(--danger)", borderColor: "var(--danger)" }}
    >
      <Trash2 size={13} />
    </button>
  );
}
