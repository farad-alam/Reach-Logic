// src/app/(portal)/portal/admin/messages/[clientId]/page.tsx
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import MessageThread from "@/components/portal/MessageThread";
import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";
import StartThreadButton from "./StartThreadButton";

export const metadata = { title: "Conversation" };

export default async function AdminMessageThreadPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/portal/login");
  const { clientId } = await params;

  const client = await prisma.user.findUnique({
    where: { id: clientId, role: "CLIENT" },
    select: { id: true, fullName: true, email: true },
  });

  if (!client) notFound();

  const thread = await prisma.thread.findUnique({ where: { clientId } });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: "calc(100vh - 60px)" }}>
      {/* Topbar */}
      <div className="portal-topbar" style={{ gap: 16 }}>
        <Link
          href="/portal/admin/messages"
          style={{ display: "flex", alignItems: "center", color: "var(--neutral-500)", textDecoration: "none" }}
        >
          <ArrowLeft size={18} />
        </Link>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--neutral-900)", lineHeight: 1.2 }}>
            {client.fullName || client.email}
          </div>
          <div style={{ fontSize: 12, color: "var(--neutral-500)" }}>Client Conversation</div>
        </div>
        <Link href={`/portal/admin/clients/${clientId}`} style={{ fontSize: 12, color: "var(--brand-accent)", textDecoration: "none" }}>
          View client profile →
        </Link>
      </div>

      {/* Thread or empty state */}
      {thread ? (
        <div style={{ flex: 1, position: "relative" }}>
          <MessageThread threadId={thread.id} currentUserId={session.user.id!} />
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 40 }}>
          <MessageSquare size={40} color="var(--neutral-300)" />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--neutral-700)", marginBottom: 6 }}>
              No conversation yet
            </div>
            <p style={{ fontSize: 14, color: "var(--neutral-400)", maxWidth: 360 }}>
              {client.fullName ?? client.email} hasn&apos;t accepted their invitation yet, so no message thread exists.
              You can create one now to start the conversation.
            </p>
          </div>
          <StartThreadButton clientId={clientId} />
        </div>
      )}
    </div>
  );
}
