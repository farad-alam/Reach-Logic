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

  const selectedThread = threads.find((t) => t.id === selectedThreadId);
  const memberSummary = selectedThread?.members.map((m) => m.user.fullName?.split(" ")[0] ?? m.user.email).join(", ");

  return (
    <div className="admin-chat-shell" style={{ gridTemplateColumns: "1fr 280px" }}>
      {/* Center: chat */}
      <div className="chat-center">
        <div className="chat-topbar">
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}>
            {/* Thread dropdown */}
            {threads.length > 1 ? (
              <div style={{ position: "relative" }}>
                <button className="thread-drop-btn" onClick={() => setDropOpen((v) => !v)}>
                  <MessageSquare size={14} />
                  <span>{selectedThread?.name ?? "Select thread"}</span>
                  <ChevronDown size={14} />
                </button>
                {dropOpen && (
                  <div className="thread-dropdown">
                    <div className="thread-drop-label">YOUR THREADS</div>
                    {threads.map((t) => (
                      <button
                        key={t.id}
                        className={`thread-drop-item ${t.id === selectedThreadId ? "active" : ""}`}
                        onClick={() => { setSelectedThreadId(t.id); setDropOpen(false); }}
                      >
                        <MessageSquare size={13} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 500, fontSize: 13 }}>{t.name}</div>
                          <div style={{ fontSize: 11, color: "var(--neutral-400)" }}>
                            {t.members.map((m) => m.user.fullName?.split(" ")[0] ?? m.user.email).join(", ")}
                          </div>
                        </div>
                        {t.id === selectedThreadId && <Check size={13} color="var(--brand-accent)" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 15, color: "var(--neutral-900)" }}>
                <MessageSquare size={16} color="var(--brand-accent)" />
                {selectedThread?.name ?? "Messages"}
              </div>
            )}
            {memberSummary && (
              <span style={{ fontSize: 12, color: "var(--neutral-500)" }}>{selectedThread?.members.length} members</span>
            )}
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
