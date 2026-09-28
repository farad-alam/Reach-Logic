// src/app/(portal)/portal/team/messages/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { MessageSquare } from "lucide-react";
import MessageThread from "@/components/portal/MessageThread";
import ThreadInfoSidebar from "@/components/portal/ThreadInfoSidebar";

export const metadata = { title: "Messages — ReachLogic Portal" };

export default async function TeamMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string; threadId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/portal/login");

  const { client: clientId, threadId } = await searchParams;

  // Threads this team member is assigned to
  const memberships = await prisma.threadMember.findMany({
    where: { userId: session.user.id },
    include: {
      thread: {
        include: {
          client: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
          members: { select: { id: true } },
        },
      },
    },
    orderBy: { assignedAt: "desc" },
  });

  const threads = memberships.map((m) => m.thread);
  let activeThread = threadId
    ? threads.find((t) => t.id === threadId)
    : clientId
    ? threads.find((t) => t.clientId === clientId)
    : threads[0];

  if (!activeThread && threads.length > 0) {
    activeThread = threads[0];
  }

  return (
    <div className="admin-chat-shell" style={{ gridTemplateColumns: "1fr 280px", height: "100%" }}>
      {/* Center: chat */}
      <div className="chat-center">
        {activeThread ? (
          <>
            <div className="chat-topbar" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 16, color: "var(--neutral-900)" }}>
                <MessageSquare size={18} color="var(--brand-accent)" />
                {activeThread.name}
              </div>
              <div style={{ fontSize: 12, color: "var(--neutral-500)", paddingLeft: 26 }}>
                {activeThread.client.fullName ?? activeThread.client.email} · {activeThread.members.length} people in this thread
              </div>
            </div>

            <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
              <MessageThread
                threadId={activeThread.id}
                currentUserId={session.user.id!}
              />
            </div>
          </>
        ) : (
          <div className="chat-empty-state">
            <MessageSquare size={40} color="var(--neutral-300)" />
            <div>No threads assigned yet</div>
          </div>
        )}
      </div>

      {/* Right: Info Sidebar */}
      {activeThread && (
        <ThreadInfoSidebar threadId={activeThread.id} currentUserId={session.user.id!} isAdmin />
      )}
    </div>
  );
}
