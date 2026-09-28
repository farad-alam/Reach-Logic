"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MessageSquare } from "lucide-react";
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
  threads,
  currentUserId,
}: {
  threads: Thread[];
  currentUserId: string;
}) {
  const searchParams = useSearchParams();
  const threadIdFromUrl = searchParams.get("threadId");

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

  useEffect(() => {
    if (threadIdFromUrl && threads.some((t) => t.id === threadIdFromUrl)) {
      setSelectedThreadId(threadIdFromUrl);
    }
  }, [threadIdFromUrl, threads]);

  const selectedThread = threads.find((t) => t.id === selectedThreadId);

  return (
    <div className="admin-chat-shell" style={{ gridTemplateColumns: "1fr 280px", height: "100%" }}>
      {/* Center: chat */}
      <div className="chat-center">
        <div className="chat-topbar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 16, color: "var(--neutral-900)" }}>
            <MessageSquare size={18} color="var(--brand-accent)" />
            {selectedThread?.name ?? "Messages"}
          </div>
          <Link href="/portal/client/orders/new" className="btn btn-primary btn-sm" style={{ padding: "6px 14px", fontSize: 13, borderRadius: 6 }}>
            + New Order
          </Link>
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
