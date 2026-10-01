"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MessageSquare, ArrowLeft, Info, Plus, X } from "lucide-react";
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

function threadInitials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function fmtTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(d);
}

export default function ClientChatPage({
  threads,
  currentUserId,
}: {
  threads: Thread[];
  currentUserId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const threadIdFromUrl = searchParams.get("threadId");

  // Which thread is selected
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(() => {
    if (threadIdFromUrl && threads.some((t) => t.id === threadIdFromUrl)) {
      return threadIdFromUrl;
    }
    const sorted = [...threads].sort((a, b) => {
      const da = a.messages[0]?.createdAt ? new Date(a.messages[0].createdAt).getTime() : 0;
      const db = b.messages[0]?.createdAt ? new Date(b.messages[0].createdAt).getTime() : 0;
      return db - da;
    });
    return sorted[0]?.id ?? null;
  });

  // Mobile view state: "list" = thread list, "chat" = messages
  const [mobileView, setMobileView] = useState<"list" | "chat">(() => {
    // If a threadId is in URL, go straight to chat on mobile
    if (threadIdFromUrl && threads.some((t) => t.id === threadIdFromUrl)) return "chat";
    return "list";
  });

  // Info panel (right sidebar) state
  const [showInfo, setShowInfo] = useState(false);

  // New thread modal
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
    setMobileView("chat");
    router.push(`/portal/client/messages?threadId=${id}`);
  }

  function handleBackToList() {
    setMobileView("list");
    setShowInfo(false);
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
        router.push(`/portal/client/messages?threadId=${data.thread.id}`);
      }
    } finally {
      setCreating(false);
    }
  }

  // Whether we're on mobile (used for class names only; CSS controls display)
  // We derive mobile vs desktop via CSS classes — no JS needed.

  return (
    <>
      <div className="client-chat-shell">
        {/* ── Left: Thread List Panel ── */}
        <div className={`client-thread-panel ${mobileView === "list" ? "mobile-visible" : "mobile-hidden"}`}>
          <div className="client-thread-panel-header">
            <h2>Messages</h2>
            <button
              className="wa-action-btn"
              onClick={() => setShowNewThread(true)}
              style={{ padding: "6px 12px", fontSize: 13 }}
            >
              <Plus size={14} />
              New Thread
            </button>
          </div>

          <div className="client-thread-list">
            {threads.length === 0 ? (
              <div className="empty-state" style={{ paddingTop: 48 }}>
                <MessageSquare size={36} color="var(--neutral-300)" />
                <div className="empty-state-title">No messages yet</div>
                <div className="empty-state-text">
                  Your team will start a conversation with you here.
                </div>
              </div>
            ) : (
              threads.map((thread) => {
                const lastMsg = thread.messages[0];
                const isActive = thread.id === selectedThreadId;
                const initials = threadInitials(thread.name);

                return (
                  <button
                    key={thread.id}
                    className={`wa-thread-row ${isActive ? "active" : ""}`}
                    onClick={() => handleSelectThread(thread.id)}
                  >
                    <div className="wa-thread-avatar">{initials}</div>
                    <div className="wa-thread-body">
                      <div className="wa-thread-name-row">
                        <span className="wa-thread-name">{thread.name}</span>
                        {lastMsg?.createdAt && (
                          <span className="wa-thread-time">{fmtTime(lastMsg.createdAt)}</span>
                        )}
                      </div>
                      <div className="wa-thread-preview">
                        {lastMsg?.body && lastMsg.body !== "📎 Attachment"
                          ? lastMsg.body
                          : lastMsg?.body === "📎 Attachment"
                          ? "📎 Attachment"
                          : "No messages yet"}
                        {(thread.unread ?? 0) > 0 && (
                          <span className="wa-unread-badge" style={{ marginLeft: "auto" }}>
                            {thread.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Center/Right: Chat Panel ── */}
        <div className={`client-chat-panel ${mobileView === "chat" ? "mobile-visible" : "mobile-hidden"}`}>
          {/* WhatsApp-style topbar */}
          <div className="wa-chat-topbar">
            {/* Back button — shown only on mobile via CSS */}
            <button className="wa-back-btn" onClick={handleBackToList} aria-label="Back to messages">
              <ArrowLeft size={18} />
              Back
            </button>

            {selectedThread ? (
              <>
                <div className="wa-contact-avatar">
                  {threadInitials(selectedThread.name)}
                </div>
                <div className="wa-chat-contact">
                  <div className="wa-contact-name">{selectedThread.name}</div>
                  <div className="wa-contact-sub">
                    {selectedThread.members.length} member{selectedThread.members.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </>
            ) : (
              <div className="wa-chat-contact">
                <div className="wa-contact-name" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Select a conversation
                </div>
              </div>
            )}

            <div className="wa-chat-actions">
              <a
                href="/portal/client/orders/new"
                className="wa-action-btn"
                style={{ display: "none" }}
                id="wa-new-project-btn"
              >
                + New Project
              </a>
              {selectedThread && (
                <button
                  className="wa-action-btn"
                  onClick={() => setShowInfo(!showInfo)}
                  aria-label="Thread info"
                  title="Thread info"
                >
                  <Info size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Message area */}
          <div style={{ flex: 1, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {!selectedThreadId ? (
              <div className="chat-empty-state">
                <MessageSquare size={40} color="var(--neutral-300)" />
                <div>Select a conversation to start messaging</div>
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

        {/* ── Right: Thread Info Sidebar (desktop) ── */}
        {selectedThreadId && showInfo && (
          <ThreadInfoSidebar
            threadId={selectedThreadId}
            currentUserId={currentUserId}
            userRole="CLIENT"
          />
        )}
      </div>

      {/* ── New Thread Modal ── */}
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
                <label className="form-label">Thread Name</label>
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
                  onClick={() => setShowNewThread(false)}
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
