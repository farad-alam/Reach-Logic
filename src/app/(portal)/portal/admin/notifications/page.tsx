// src/app/(portal)/portal/admin/notifications/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import NotificationList from "@/components/portal/NotificationList";

export const metadata = { title: "Notifications" };


export default async function AdminNotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/portal/login");

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true, type: true, title: true, body: true, isRead: true, link: true, createdAt: true },
  });

  // Serialize dates
  const serialized = notifications.map((n) => ({
    ...n,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <div className="portal-page">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Notifications</h1>
          <p className="page-header-sub">Your activity feed</p>
        </div>
      </div>
      <div style={{ maxWidth: 680 }}>
        <NotificationList initialNotifications={serialized} />
      </div>
    </div>
  );
}
