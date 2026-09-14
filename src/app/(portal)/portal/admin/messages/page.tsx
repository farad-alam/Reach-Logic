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

  // Sort by latest message date (descending)
  threads.sort((a, b) => {
    const dateA = a.messages[0]?.createdAt.getTime() || a.createdAt.getTime();
    const dateB = b.messages[0]?.createdAt.getTime() || b.createdAt.getTime();
    return dateB - dateA;
  });

  return (
    <div className="portal-page" style={{ maxWidth: 700 }}>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Conversations</h1>
          <p className="page-header-sub">Communicate with your clients.</p>
        </div>
      </div>
      
      {threads.length === 0 ? (
        <div className="card">
           <div className="empty-state">
             <MessageSquare size={40} className="empty-state-icon" />
             <div className="empty-state-title">No conversations yet</div>
             <p className="empty-state-text">Message threads are created automatically when clients accept their invitation.</p>
           </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {threads.map((thread) => {
            const latestMsg = thread.messages[0];
            const hasMessages = !!latestMsg;
            
            return (
              <Link key={thread.id} href={`/portal/admin/messages/${thread.client.id}`}
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  padding: "16px 20px", 
                  gap: 16, 
                  textDecoration: "none", 
                  borderBottom: "1px solid var(--neutral-100)" 
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-50)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--brand-mid)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, flexShrink: 0 }}>
                  {thread.client.fullName ? thread.client.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : thread.client.email[0].toUpperCase()}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: "var(--neutral-900)" }}>{thread.client.fullName || thread.client.email}</span>
                    {hasMessages && (
                      <span style={{ fontSize: 11, color: "var(--neutral-500)" }}>
                        {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(latestMsg.createdAt)}
                      </span>
                    )}
                  </div>
                  
                  <div style={{ fontSize: 13, color: "var(--neutral-500)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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
