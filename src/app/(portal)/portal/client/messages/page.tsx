// src/app/(portal)/portal/client/messages/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import MessageThread from "@/components/portal/MessageThread";

export const metadata = { title: "Messages" };

export default async function ClientMessagesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/portal/login");

  const thread = await prisma.thread.findUnique({
    where: { clientId: session.user.id },
  });

  // Since threads are auto-created when clients accept invites, 
  // this should always exist. But just in case:
  let threadId = thread?.id;
  
  if (!thread) {
    const newThread = await prisma.thread.create({
      data: { clientId: session.user.id },
    });
    
    const admins = await prisma.user.findMany({
      where: { role: "SUPER_ADMIN", isActive: true },
      select: { id: true },
    });

    await prisma.threadMember.createMany({
      data: admins.map((a) => ({ threadId: newThread.id, userId: a.id })),
    });
    
    threadId = newThread.id;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="portal-topbar">
        <h1 className="portal-topbar-title">Messages</h1>
      </div>
      <div style={{ flex: 1, position: "relative" }}>
        <MessageThread threadId={threadId!} currentUserId={session.user.id} />
      </div>
    </div>
  );
}
