"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Check, MessageSquare } from "lucide-react";
import MessageThread from "@/components/portal/MessageThread";
import ThreadInfoSidebar from "@/components/portal/ThreadInfoSidebar";

interface ThreadMemberUser {
  id: string;
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
  role: string;
}

interface Thread {
  id: string;
  name: string;
  clientId: string;
  members: { user: ThreadMemberUser }[];
  messages: { createdAt: string }[];
}

export default function ClientChatPage({
  threads: initialThreads,
  currentUserId,
}: {
  threads: Thread[];
  currentUserId: string;
}) {
  const [threads, setThreads] = useState<Thread[]>(initialThreads);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(() => {
    // Open thread with most recent activity
    const sorted = [...initialThreads].sort((a, b) => {
      const da = a.messages[0]?.createdAt ? new Date(a.messages[0].createdAt).getTime() : 0;
      const db = b.messages[0]?.createdAt ? new Date(b.messages[0].createdAt).getTime() : 0;
      return db - da;
    });
    return sorted[0]?.id ?? null;
  });
  const [dropOpen, setDropOpen] = useState(false);

  const [newThreadName, setNewThreadName] = useState("");
  const [creating, setCreating] = useState(false);

  const selectedThread = threads.find((t) => t.id === selectedThreadId);

  async function handleCreateThread() {
    if (!newThreadName.trim() || creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/portal/threads/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: currentUserId, name: newThreadName.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        const newThread = {
          id: data.thread.id,
          name: data.thread.name,
          clientId: currentUserId,
          members: [{ user: { id: currentUserId, fullName: null, email: "", avatarUrl: null, role: "CLIENT" } }],
          messages: [],
        };
        setThreads((prev) => [...prev, newThread]);
        setSelectedThreadId(newThread.id);
        setNewThreadName("");
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="admin-chat-shell" style={{ gridTemplateColumns: "240px 1fr 280px" }}>
      {/* Left: Sidebar */}
      <div className="chat-thread-sidebar">
        <div className="chat-thread-sidebar-header">
          <div className="chat-sidebar-label">YOUR THREADS</div>
        </div>
        <div className="chat-thread-list">
          {threads.map((t) => (
            <button
              key={t.id}
              className={`thread-sidebar-item ${t.id === selectedThreadId ? "active" : ""}`}
              onClick={() => setSelectedThreadId(t.id)}
            >
              <MessageSquare size={14} color={t.id === selectedThreadId ? "var(--brand-dark)" : "var(--neutral-500)"} />
              <div style={{ flex: 1, minWidth: 0, fontWeight: 500, fontSize: 13, color: t.id === selectedThreadId ? "var(--brand-dark)" : "var(--neutral-700)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {t.name}
              </div>
              {t.id === selectedThreadId && <Check size={13} color="var(--brand-accent)" />}
            </button>
          ))}
          {/* New Thread Input */}
          <div style={{ padding: "8px 12px", marginTop: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--neutral-400)", marginBottom: 6, textTransform: "uppercase" }}>New Thread</div>
            <div style={{ display: "flex", gap: 6 }}>
              <input
                type="text"
                placeholder="Thread name..."
                value={newThreadName}
                onChange={(e) => setNewThreadName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleCreateThread(); }}
                style={{ flex: 1, minWidth: 0, padding: "6px 8px", fontSize: 12, borderRadius: 6, border: "1px solid var(--neutral-200)", outline: "none" }}
              />
              <button
                onClick={handleCreateThread}
                disabled={creating || !newThreadName.trim()}
                style={{ background: "var(--brand-dark)", color: "#fff", border: "none", borderRadius: 6, padding: "0 10px", fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: (!newThreadName.trim() || creating) ? 0.5 : 1 }}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Center: chat */}
      <div className="chat-center">
        <div className="chat-topbar">
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 15, color: "var(--neutral-900)" }}>
            <MessageSquare size={16} color="var(--brand-accent)" />
            {selectedThread?.name ?? "Messages"}
          </div>
        </div>

        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          {selectedThreadId ? (
            <MessageThread key={selectedThreadId} threadId={selectedThreadId} currentUserId={currentUserId} />
          ) : (
            <div className="chat-empty-state">
              <MessageSquare size={40} color="var(--neutral-300)" />
              <div>No threads yet</div>
            </div>
          )}
        </div>
      </div>

      {/* Right: info sidebar */}
      {selectedThreadId && (
        <ThreadInfoSidebar threadId={selectedThreadId} currentUserId={currentUserId} isAdmin={false} />
      )}
    </div>
  );
}
