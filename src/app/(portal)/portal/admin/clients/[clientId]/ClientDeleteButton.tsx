"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function ClientDeleteButton({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this client? They will not be able to log in, and their records will be permanently removed after 30 days.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/portal/clients/${clientId}/delete`, { method: "DELETE" });
      if (res.ok) {
        router.push("/portal/admin/clients");
      } else {
        alert("Failed to delete client");
        setDeleting(false);
      }
    } catch (e) {
      alert("Error deleting client");
      setDeleting(false);
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={deleting}
      className="btn btn-outline"
      style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--danger)", borderColor: "var(--danger)", fontSize: 13 }}
    >
      <Trash2 size={14} /> {deleting ? "Deleting..." : "Delete Client"}
    </button>
  );
}
