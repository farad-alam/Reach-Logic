// src/app/(portal)/portal/admin/layout.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import PortalSidebar from "@/components/portal/PortalSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/portal/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, fullName: true, email: true, avatarUrl: true },
  });

  if (!user || user.role !== "SUPER_ADMIN") redirect("/portal/login");

  const unreadCount = await prisma.notification.count({
    where: { userId: session.user.id, isRead: false },
  });

  return (
    <div className="portal-shell">
      <PortalSidebar
        role="SUPER_ADMIN"
        userName={user.fullName ?? ""}
        userEmail={user.email}
        avatarUrl={user.avatarUrl}
        unreadCount={unreadCount}
      />
      <main className="portal-main">{children}</main>
    </div>
  );
}
