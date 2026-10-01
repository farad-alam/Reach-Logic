"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MessageSquare, Info, X } from "lucide-react";
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

  return (
    <div className="admin-chat-shell" style={{ gridTemplateColumns: selectedThreadId ? "1fr 280px" : "1fr" }}>
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
                Select a thread from the sidebar
              </div>
            )}
          </div>

          {selectedThread && (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {/* Thread list dropdown — threads listed in topbar */}
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
              {/* Info button — visible on mobile only via CSS */}
              <button
                className="btn btn-outline btn-sm chat-info-mobile-btn"
                title="Thread info"
                onClick={() => setShowInfoSheet(true)}
                id="client-thread-info-btn"
              >
                <Info size={14} /> Info
              </button>
            </div>
          )}
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

      {/* Right: Info sidebar (desktop) */}
      {selectedThreadId && (
        <ThreadInfoSidebar
          threadId={selectedThreadId}
          currentUserId={currentUserId}
          userRole="CLIENT"
        />
      )}

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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px 12px" }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--neutral-900)" }}>Thread Info</span>
              <button
                onClick={() => setShowInfoSheet(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--neutral-400)", display: "flex" }}
              >
                <X size={18} />
              </button>
            </div>
            <ThreadInfoSidebar threadId={selectedThreadId} currentUserId={currentUserId} userRole="CLIENT" />
          </div>
        </div>
      )}
    </div>
  );
}
