"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MessageSquare, Info, X, Plus, FolderOpen } from "lucide-react";
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
  messages: { createdAt: string; body?: string }[];
  unread?: number;
}

function Initials({ name, email, size = 36 }: { name: string | null; email: string; size?: number }) {
  const text = name
    ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : email[0].toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "var(--brand-mid)", color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, flexShrink: 0,
    }}>{text}</div>
  );
}

export default function ClientChatPage({
  threads: initialThreads,
  currentUserId,
}: {
  threads: Thread[];
  currentUserId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const threadIdFromUrl = searchParams.get("threadId");

  const [threads, setThreads] = useState<Thread[]>(initialThreads);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(() => {
    if (threadIdFromUrl && initialThreads.some((t) => t.id === threadIdFromUrl)) {
      return threadIdFromUrl;
    }
    const sorted = [...initialThreads].sort((a, b) => {
      const da = a.messages[0]?.createdAt ? new Date(a.messages[0].createdAt).getTime() : 0;
      const db = b.messages[0]?.createdAt ? new Date(b.messages[0].createdAt).getTime() : 0;
      return db - da;
    });
    return sorted[0]?.id ?? null;
  });

  const [showInfoSheet, setShowInfoSheet] = useState(false);

  // New Thread modal
  const [showNewThread, setShowNewThread] = useState(false);
  const [newThreadName, setNewThreadName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (threadIdFromUrl && threads.some((t) => t.id === threadIdFromUrl)) {
      setSelectedThreadId(threadIdFromUrl);
    }
  }, [threadIdFromUrl, threads]);

  const selectedThread = threads.find((t) => t.id === selectedThreadId);

  function handleSelectThread(id: string) {
    setSelectedThreadId(id);
    router.push(`/portal/client/messages?threadId=${id}`);
  }

  async function handleCreateThread(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!newThreadName.trim() || creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/portal/threads/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newThreadName.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setNewThreadName("");
        setShowNewThread(false);
        // Add new thread to list
        if (data.thread) {
          setThreads((prev) => [...prev, data.thread]);
        }
        router.push(`/portal/client/messages?threadId=${data.thread.id}`);
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <div className="admin-chat-shell">
        {/* Center: Chat area */}
        <div className="chat-center">
          {/* Chat topbar */}
          <div className="chat-topbar">
            <div className="chat-topbar-breadcrumb">
              {selectedThread ? (
                <>
                  <Initials name={selectedThread.name} email={selectedThread.name} size={36} />
                  <div className="breadcrumb-text">
                    <div className="breadcrumb-title">{selectedThread.name}</div>
                    <div className="breadcrumb-subtitle">
                      {selectedThread.members.length} member{selectedThread.members.length !== 1 ? "s" : ""} in this thread
                    </div>
                  </div>
                </>
              ) : (
                <div className="breadcrumb-title" style={{ color: "var(--neutral-400)" }}>
                  Your message threads appear here
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              {/* Thread switcher pills */}
              {threads.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {threads.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleSelectThread(t.id)}
                      style={{
                        padding: "5px 12px",
                        borderRadius: 8,
                        border: `1px solid ${t.id === selectedThreadId ? "var(--brand-dark)" : "var(--neutral-200)"}`,
                        background: t.id === selectedThreadId ? "var(--brand-dark)" : "#fff",
                        color: t.id === selectedThreadId ? "#fff" : "var(--neutral-700)",
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <a
                href="/portal/client/orders/new"
                className="btn btn-outline btn-sm"
                style={{ display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}
              >
                <FolderOpen size={14} /> + New Project
              </a>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowNewThread(true)}
                style={{ display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}
              >
                <Plus size={14} /> New Thread
              </button>

              {/* Info button — shown only on mobile via CSS */}
              {selectedThread && (
                <button
                  className="btn btn-outline btn-sm chat-info-mobile-btn"
                  title="Thread info"
                  onClick={() => setShowInfoSheet(true)}
                  id="client-thread-info-btn"
                >
                  <Info size={14} /> Info
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
            {!selectedThreadId ? (
              <div className="chat-empty-state">
                <MessageSquare size={40} color="var(--neutral-300)" />
                <div>Your message threads appear here</div>
              </div>
            ) : (
              <MessageThread
                key={selectedThreadId}
                threadId={selectedThreadId}
                currentUserId={currentUserId}
              />
            )}
          </div>
        </div>

        {/* Right: Info sidebar (desktop) — hidden on mobile via CSS */}
        {selectedThreadId && (
          <ThreadInfoSidebar
            threadId={selectedThreadId}
            currentUserId={currentUserId}
            userRole="CLIENT"
          />
        )}
      </div>

      {/* Mobile: Thread info bottom sheet */}
      {showInfoSheet && selectedThreadId && (
        <div
          className="thread-info-sheet-overlay open"
          onClick={() => setShowInfoSheet(false)}
        >
          <div className="thread-info-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="thread-info-sheet-handle">
              <div className="thread-info-sheet-handle-bar" />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px 12px", borderBottom: "1px solid var(--neutral-100)" }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--neutral-900)" }}>Thread Info</span>
              <button
                onClick={() => setShowInfoSheet(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--neutral-400)", display: "flex" }}
              >
                <X size={18} />
              </button>
            </div>
            {/* Scrollable content inside sheet */}
            <div style={{ overflowY: "auto", flex: 1, height: "calc(70vh - 80px)" }}>
              <ThreadInfoSidebar threadId={selectedThreadId} currentUserId={currentUserId} userRole="CLIENT" />
            </div>
          </div>
        </div>
      )}

      {/* New Thread Modal */}
      {showNewThread && (
        <div className="modal-overlay" onClick={() => setShowNewThread(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Thread</h3>
              <button onClick={() => setShowNewThread(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateThread}>
              <div className="modal-body">
                <label className="form-label">Thread Name <span style={{ color: "var(--neutral-400)", fontWeight: 400 }}>(max 30 chars)</span></label>
                <input
                  className="form-input"
                  value={newThreadName}
                  onChange={(e) => setNewThreadName(e.target.value.slice(0, 30))}
                  placeholder="e.g. Website Project, SEO Campaign"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleCreateThread()}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => { setShowNewThread(false); setNewThreadName(""); }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={creating || !newThreadName.trim()}
                >
                  {creating ? "Creating…" : "Create Thread"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
