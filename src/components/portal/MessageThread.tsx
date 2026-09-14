"use client";
import { useState, useEffect, useRef, FormEvent } from "react";
import { Send, Loader2 } from "lucide-react";

interface Message {
  id: string;
  body: string;
  type: "USER" | "SYSTEM";
  createdAt: string;
  senderId: string | null;
  metadata?: any;
  sender?: {
    id: string;
    fullName: string | null;
    email: string;
    avatarUrl: string | null;
  } | null;
}

export default function MessageThread({ threadId, currentUserId }: { threadId: string; currentUserId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Track the latest message date for polling
  const lastMessageDate = useRef<string | null>(null);

  const fetchMessages = async (since?: string) => {
    try {
      const url = since 
        ? `/api/portal/messages/list?threadId=${threadId}&since=${since}`
        : `/api/portal/messages/list?threadId=${threadId}`;
        
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      
      if (data.messages && data.messages.length > 0) {
        setMessages(prev => {
          // avoid duplicates if polling overlapped
          const newMessages = data.messages.filter((m: Message) => !prev.some(p => p.id === m.id));
          return [...prev, ...newMessages];
        });
        
        lastMessageDate.current = data.messages[data.messages.length - 1].createdAt;
        setTimeout(scrollToBottom, 100);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (!since) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Start polling every 5 seconds
    const interval = setInterval(() => {
      if (lastMessageDate.current) {
        fetchMessages(lastMessageDate.current);
      } else {
        fetchMessages(); // if no messages yet
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [threadId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    
    setSending(true);
    try {
      const res = await fetch("/api/portal/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId, body }),
      });
      if (res.ok) {
        setBody("");
        fetchMessages(lastMessageDate.current || undefined);
      }
    } finally {
      setSending(false);
    }
  }

  function formatTime(d: string) {
    return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "numeric", hour12: true }).format(new Date(d));
  }
  function formatDate(d: string) {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(d));
  }

  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: "var(--neutral-400)" }}><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="thread-container">
      <div className="thread-messages">
        {messages.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--neutral-400)", marginTop: 40, fontSize: 14 }}>
            No messages yet. Send a message to start the conversation.
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isOwn = msg.senderId === currentUserId;
            
            // Show date separator if day changed
            let showDate = false;
            if (idx === 0) showDate = true;
            else {
              const prevDate = new Date(messages[idx-1].createdAt).toDateString();
              const currDate = new Date(msg.createdAt).toDateString();
              if (prevDate !== currDate) showDate = true;
            }

            if (msg.type === "SYSTEM") {
              return (
                <div key={msg.id} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {showDate && <div style={{ textAlign: "center", fontSize: 11, color: "var(--neutral-400)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{formatDate(msg.createdAt)}</div>}
                  <div className="message-system">{msg.body}</div>
                </div>
              );
            }

            return (
              <div key={msg.id} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {showDate && <div style={{ textAlign: "center", fontSize: 11, color: "var(--neutral-400)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{formatDate(msg.createdAt)}</div>}
                <div className={`message-bubble ${isOwn ? "own" : ""}`}>
                  {!isOwn && (
                    <div className="message-avatar">
                      {msg.sender?.avatarUrl ? (
                         // eslint-disable-next-line @next/next/no-img-element
                        <img src={msg.sender.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        (msg.sender?.fullName || msg.sender?.email || "?")[0].toUpperCase()
                      )}
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", maxWidth: "100%" }}>
                    <div className="message-content">{msg.body}</div>
                    <div className="message-meta" style={{ alignSelf: isOwn ? "flex-end" : "flex-start" }}>
                      {!isOwn && <span style={{ fontWeight: 500, marginRight: 6 }}>{msg.sender?.fullName?.split(" ")[0]}</span>}
                      {formatTime(msg.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="thread-composer" onSubmit={handleSend}>
        <textarea 
          placeholder="Type a message..." 
          value={body}
          onChange={e => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
        />
        <button 
          type="submit" 
          disabled={sending || !body.trim()}
          style={{ 
            background: body.trim() ? "var(--brand-dark)" : "var(--neutral-200)", 
            color: body.trim() ? "#fff" : "var(--neutral-500)",
            border: "none", 
            borderRadius: "50%", 
            width: 40, 
            height: 40, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            cursor: body.trim() ? "pointer" : "not-allowed",
            transition: "all 0.2s"
          }}
        >
          {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} style={{ marginLeft: -2, marginTop: 2 }} />}
        </button>
      </form>
    </div>
  );
}
