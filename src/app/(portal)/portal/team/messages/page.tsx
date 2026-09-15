// src/app/(portal)/portal/team/messages/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { MessageSquare, Clock } from "lucide-react";
import MessageThread from "@/components/portal/MessageThread";

export const metadata = { title: "Messages — ReachLogic Portal" };

function timeAgo(d: Date) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default async function TeamMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/portal/login");

  const { client: clientId } = await searchParams;

  // Threads this team member is assigned to
  const memberships = await prisma.threadMember.findMany({
    where: { userId: session.user.id },
    include: {
      thread: {
        include: {
          client: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { body: true, createdAt: true, type: true },
          },
        },
      },
    },
    orderBy: { assignedAt: "desc" },
  });

  const threads = memberships.map((m) => m.thread);
  const activeThread = clientId ? threads.find((t) => t.clientId === clientId) : threads[0];

  return (
    <div className="portal-page" style={{ padding: 0, height: "100%" }}>
      <div style={{ display: "flex", height: "calc(100vh - 0px)", minHeight: 0 }}>
        {/* Thread list */}
        <div style={{
          width: 280, flexShrink: 0,
          borderRight: "1px solid var(--neutral-100)",
          overflowY: "auto",
          display: "flex", flexDirection: "column",
        }}>
          <div style={{ padding: "18px 16px 12px", borderBottom: "1px solid var(--neutral-100)" }}>
            <h1 style={{ fontSize: 15, fontWeight: 700, color: "var(--neutral-900)" }}>Messages</h1>
            <p style={{ fontSize: 12, color: "var(--neutral-400)", marginTop: 2 }}>
              {threads.length} conversation{threads.length !== 1 ? "s" : ""}
            </p>
          </div>

          {threads.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center" }}>
              <MessageSquare size={28} color="var(--neutral-300)" style={{ margin: "0 auto 8px" }} />
              <p style={{ fontSize: 13, color: "var(--neutral-400)" }}>No threads assigned yet</p>
            </div>
          ) : (
            threads.map((thread) => {
              const lastMsg = thread.messages[0];
              const isActive = activeThread?.id === thread.id;
              return (
                <Link
                  key={thread.id}
                  href={`/portal/team/messages?client=${thread.clientId}`}
                  style={{
                    display: "block", padding: "12px 16px", textDecoration: "none",
                    background: isActive ? "rgba(18,196,148,0.07)" : "transparent",
                    borderLeft: isActive ? "3px solid var(--brand-accent)" : "3px solid transparent",
                    borderBottom: "1px solid var(--neutral-50)",
                    transition: "background 0.15s",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--neutral-900)" }}>
                    {thread.client.fullName ?? thread.client.email}
                  </div>
                  {lastMsg && (
                    <div style={{ fontSize: 12, color: "var(--neutral-400)", marginTop: 3, display: "flex", justifyContent: "space-between", gap: 6 }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                        {lastMsg.type === "SYSTEM" ? "📋 System update" : lastMsg.body}
                      </span>
                      <span style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 3 }}>
                        <Clock size={10} /> {timeAgo(lastMsg.createdAt)}
                      </span>
                    </div>
                  )}
                </Link>
              );
            })
          )}
        </div>

        {/* Active thread */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          {activeThread ? (
            <>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--neutral-100)", background: "#fff" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--neutral-900)" }}>
                  {activeThread.client.fullName ?? activeThread.client.email}
                </div>
                <div style={{ fontSize: 12, color: "var(--neutral-400)" }}>{activeThread.client.email}</div>
              </div>
              <div style={{ flex: 1, minHeight: 0 }}>
                <MessageThread
                  threadId={activeThread.id}
                  currentUserId={session.user.id!}
                />
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
              <MessageSquare size={36} color="var(--neutral-300)" />
              <p style={{ color: "var(--neutral-400)", fontSize: 14 }}>Select a conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
