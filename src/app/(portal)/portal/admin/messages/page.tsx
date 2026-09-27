// src/app/(portal)/portal/admin/messages/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AdminChatPage from "@/components/portal/AdminChatPage";

export const metadata = { title: "Messages" };

export default async function AdminMessagesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/portal/login");

  // Fetch all clients with their thread summary
  const clients = await prisma.user.findMany({
    where: { role: "CLIENT", isActive: true },
    select: { id: true, fullName: true, email: true, avatarUrl: true },
    orderBy: { createdAt: "desc" },
  });

  // Get unread counts per client (based on unread notifications)
  const unreadNotifs = await prisma.notification.findMany({
    where: { userId: session.user.id, type: "NEW_MESSAGE", isRead: false },
    select: { link: true },
  });

  // Build unread map by clientId extracted from the link
  const unreadByClient: Record<string, number> = {};
  for (const n of unreadNotifs) {
    const match = n.link?.match(/\/messages\/([a-z0-9]+)/i);
    if (match?.[1]) {
      unreadByClient[match[1]] = (unreadByClient[match[1]] ?? 0) + 1;
    }
  }

  const clientsWithUnread = clients.map((c) => ({
    ...c,
    unread: unreadByClient[c.id] ?? 0,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1 }}>
      <AdminChatPage
        clients={clientsWithUnread}
        currentUserId={session.user.id}
      />
    </div>
  );
}
