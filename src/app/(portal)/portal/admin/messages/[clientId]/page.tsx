// src/app/(portal)/portal/admin/messages/[clientId]/page.tsx
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import MessageThread from "@/components/portal/MessageThread";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Conversation" };

export default async function AdminMessageThreadPage({ params }: { params: Promise<{ clientId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/portal/login");
  const { clientId } = await params;

  const client = await prisma.user.findUnique({
    where: { id: clientId, role: "CLIENT" },
    select: { fullName: true, email: true },
  });

  if (!client) notFound();

  const thread = await prisma.thread.findUnique({
    where: { clientId },
  });

  if (!thread) notFound(); // Should exist if client exists

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="portal-topbar" style={{ gap: 20 }}>
        <Link href="/portal/admin/messages" style={{ display: "flex", alignItems: "center", color: "var(--neutral-500)" }}>
          <ArrowLeft size={18} />
        </Link>
        <div>
           <div style={{ fontSize: 15, fontWeight: 600, color: "var(--neutral-900)", lineHeight: 1.2 }}>{client.fullName || client.email}</div>
           <div style={{ fontSize: 12, color: "var(--neutral-500)" }}>Client Conversation</div>
        </div>
      </div>
      <div style={{ flex: 1, position: "relative" }}>
        <MessageThread threadId={thread.id} currentUserId={session.user.id} />
      </div>
    </div>
  );
}
