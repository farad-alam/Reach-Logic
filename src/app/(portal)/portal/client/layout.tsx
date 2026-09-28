// src/app/(portal)/portal/client/layout.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import PortalShell from "@/components/portal/PortalShell";

export default async function ClientLayout({
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

  if (!user || user.role !== "CLIENT") redirect("/portal/login");

  const unreadCount = await prisma.notification.count({
    where: { userId: session.user.id, isRead: false },
  });

  return (
    <PortalShell
      role="CLIENT"
      userName={user.fullName ?? ""}
      userEmail={user.email}
      avatarUrl={user.avatarUrl}
      unreadCount={unreadCount}
    >
      {children}
    </PortalShell>
  );
}
