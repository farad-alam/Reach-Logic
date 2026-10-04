// src/app/(portal)/portal/client/messages/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import ClientChatPage from "@/components/portal/ClientChatPage";

export const metadata = { title: "Messages" };

export default async function ClientMessagesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/portal/login");

  const userId = session.user.id;
  const isColleague = (session.user as { role?: string }).role === "CLIENT_COLLEAGUE";

  // Clients see threads they own; colleagues see only the threads they were added to.
  const threadWhere = isColleague ? { members: { some: { userId } } } : { clientId: userId };
  const threadInclude = {
    members: { include: { user: { select: { id: true, fullName: true, email: true, avatarUrl: true, role: true } } } },
    messages: { orderBy: { createdAt: "desc" as const }, take: 1, select: { createdAt: true, body: true } },
  };

  // Ensure at least one thread exists (General)
  let threads = await prisma.thread.findMany({
    where: threadWhere,
    include: threadInclude,
    orderBy: { createdAt: "asc" },
  });

  // Auto-create General thread if none exist (never for colleagues)
  if (threads.length === 0 && !isColleague) {
    const thread = await prisma.thread.create({ data: { clientId: userId, name: "General" } });
    const admins = await prisma.user.findMany({ where: { role: "SUPER_ADMIN", isActive: true }, select: { id: true } });
    for (const admin of admins) {
      await prisma.threadMember.create({ data: { threadId: thread.id, userId: admin.id } });
    }
    // Refetch
    threads = await prisma.thread.findMany({
      where: threadWhere,
      include: threadInclude,
      orderBy: { createdAt: "asc" },
    });
  }

  return (
    <ClientChatPage
      threads={threads.map((t) => ({
        id: t.id,
        name: t.name,
        clientId: t.clientId,
        members: t.members.map((m) => ({ user: m.user })),
        messages: t.messages.map((m) => ({ createdAt: m.createdAt.toISOString(), body: m.body })),
      }))}
      currentUserId={session.user.id}
      isColleague={isColleague}
    />
  );
}
