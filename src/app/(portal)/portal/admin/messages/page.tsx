// src/app/(portal)/portal/admin/messages/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { MessageSquare, ChevronRight } from "lucide-react";

export const metadata = { title: "Messages" };

export default async function AdminMessagesIndex() {
  const session = await auth();
  if (!session?.user?.id) redirect("/portal/login");

  // Fetch all threads with their latest message
  const threads = await prisma.thread.findMany({
    include: {
      client: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
      messages: { 
        orderBy: { createdAt: "desc" }, 
        take: 1,
        select: { body: true, createdAt: true, senderId: true, type: true }
      }
    },
  });

  // Filter out any threads whose client was deleted (data integrity guard)
  const validThreads = threads.filter((t) => t.client != null);

  // Sort by latest message date (descending)
  validThreads.sort((a, b) => {
    const dateA = a.messages[0]?.createdAt.getTime() || a.createdAt.getTime();
    const dateB = b.messages[0]?.createdAt.getTime() || b.createdAt.getTime();
    return dateB - dateA;
  });

  // Unread NEW_MESSAGE notifications for admin — keyed by clientId extracted from link
  const unreadNotifs = await prisma.notification.findMany({
    where: { userId: session.user.id, type: "NEW_MESSAGE", isRead: false },
    select: { link: true },
  });

  // Build a map: clientId -> unread count
  const unreadByClient: Record<string, number> = {};
  for (const n of unreadNotifs) {
    // link format: /portal/admin/messages/<clientId>
    const match = n.link?.match(/\/messages\/([a-z0-9]+)$/i);
    if (match?.[1]) {
      unreadByClient[match[1]] = (unreadByClient[match[1]] ?? 0) + 1;
    }
  }

  return (
    <div className="portal-page" style={{ maxWidth: 700 }}>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Conversations</h1>
          <p className="page-header-sub">Communicate with your clients.</p>
        </div>
      </div>
      
      {validThreads.length === 0 ? (
        <div className="card">
           <div className="empty-state">
             <MessageSquare size={40} className="empty-state-icon" />
             <div className="empty-state-title">No conversations yet</div>
             <p className="empty-state-text">Message threads are created automatically when clients accept their invitation.</p>
           </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {validThreads.map((thread) => {
            const latestMsg = thread.messages[0];
            const hasMessages = !!latestMsg;
            const unread = unreadByClient[thread.client.id] ?? 0;
            
            return (
              <Link key={thread.id} href={`/portal/admin/messages/${thread.client.id}`}
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  padding: "16px 20px", 
                  gap: 16, 
                  textDecoration: "none", 
                  borderBottom: "1px solid var(--neutral-100)",
                  background: unread > 0 ? "var(--neutral-50)" : "transparent",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-50)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = unread > 0 ? "var(--neutral-50)" : "transparent")}
              >
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--brand-mid)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600 }}>
                    {thread.client.fullName ? thread.client.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : thread.client.email[0].toUpperCase()}
                  </div>
                  {unread > 0 && (
                    <span style={{
                      position: "absolute",
                      top: -3,
                      right: -3,
                      background: "var(--danger)",
                      color: "#fff",
                      borderRadius: "50%",
                      width: 18,
                      height: 18,
                      fontSize: 10,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      lineHeight: 1,
                    }}>{unread > 9 ? "9+" : unread}</span>
                  )}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
                    <span style={{ fontSize: 15, fontWeight: unread > 0 ? 700 : 600, color: "var(--neutral-900)" }}>{thread.client.fullName || thread.client.email}</span>
                    {hasMessages && (
                      <span style={{ fontSize: 11, color: "var(--neutral-500)" }}>
                        {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(latestMsg.createdAt)}
                      </span>
                    )}
                  </div>
                  
                  <div style={{ fontSize: 13, color: unread > 0 ? "var(--neutral-700)" : "var(--neutral-500)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: unread > 0 ? 500 : 400 }}>
                    {hasMessages ? (latestMsg.type === "SYSTEM" ? `System: ${latestMsg.body}` : latestMsg.body) : "No messages yet"}
                  </div>
                </div>
                <ChevronRight size={16} color="var(--neutral-300)" />
              </Link>
            );
          })}
        </div>
      )}

    </div>
  );
}
