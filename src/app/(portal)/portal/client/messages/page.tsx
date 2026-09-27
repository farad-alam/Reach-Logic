// src/app/(portal)/portal/client/messages/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import ClientChatPage from "@/components/portal/ClientChatPage";

export const metadata = { title: "Messages" };

export default async function ClientMessagesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/portal/login");

  // Ensure at least one thread exists (General)
  let threads = await prisma.thread.findMany({
    where: { clientId: session.user.id },
    include: {
      members: { include: { user: { select: { id: true, fullName: true, email: true, avatarUrl: true, role: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  // Auto-create General thread if none exist
  if (threads.length === 0) {
    const thread = await prisma.thread.create({ data: { clientId: session.user.id, name: "General" } });
    const admins = await prisma.user.findMany({ where: { role: "SUPER_ADMIN", isActive: true }, select: { id: true } });
    for (const admin of admins) {
      await prisma.threadMember.create({ data: { threadId: thread.id, userId: admin.id } });
    }
    // Refetch
    threads = await prisma.thread.findMany({
      where: { clientId: session.user.id },
      include: {
        members: { include: { user: { select: { id: true, fullName: true, email: true, avatarUrl: true, role: true } } } },
        messages: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1 }}>
      <ClientChatPage
        threads={threads.map((t) => ({
          id: t.id,
          name: t.name,
          clientId: t.clientId,
          members: t.members.map((m) => ({ user: m.user })),
          messages: t.messages.map((m) => ({ createdAt: m.createdAt.toISOString() })),
        }))}
        currentUserId={session.user.id}
      />
    </div>
  );
}
