"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { Send, Loader2, Paperclip, X, FileText, Image as ImageIcon, Download } from "lucide-react";

interface Attachment {
  id?: string;
  fileName: string;
  fileSize: number;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
}

interface Message {
  id: string;
  body: string;
  type: "USER" | "SYSTEM";
  createdAt: string;
  senderId: string | null;
  metadata?: Record<string, unknown>;
  sender?: {
    id: string;
    fullName: string | null;
    email: string;
    avatarUrl: string | null;
    role?: string;
    designation?: string | null;
  } | null;
  attachments?: Attachment[];
}

interface PendingFile {
  file: File;
  preview?: string; // data URL for images
  uploading: boolean;
  error?: string;
  result?: { publicId: string; url: string };
}

function initials(name: string | null | undefined, email: string) {
  if (name) return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return email[0].toUpperCase();
}

function fmt(d: string) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "numeric", hour12: true }).format(new Date(d));
}
function fmtDate(d: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(d));
}
function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MessageThread({
  threadId,
  currentUserId,
}: {
  threadId: string;
  currentUserId: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageDate = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMessages = async (since?: string) => {
    try {
      const url = since
        ? `/api/portal/messages/list?threadId=${threadId}&since=${since}`
        : `/api/portal/messages/list?threadId=${threadId}`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      if (data.messages && data.messages.length > 0) {
        setMessages((prev) => {
          const newMsgs = data.messages.filter((m: Message) => !prev.some((p) => p.id === m.id));
          return [...prev, ...newMsgs];
        });
        lastMessageDate.current = data.messages[data.messages.length - 1].createdAt;
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (!since) setLoading(false);
    }
  };

  useEffect(() => {
    setMessages([]);
    setLoading(true);
    lastMessageDate.current = null;
    fetchMessages();
    const interval = setInterval(() => {
      fetchMessages(lastMessageDate.current || undefined);
    }, 5000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    e.target.value = "";

    const newPending: PendingFile[] = files.map((file) => ({
      file,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      uploading: true,
    }));
    setPendingFiles((prev) => [...prev, ...newPending]);

    // Upload each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/portal/upload", { method: "POST", body: formData });
        const data = await res.json();
        setPendingFiles((prev) =>
          prev.map((pf) =>
            pf.file === file
              ? { ...pf, uploading: false, result: data.ok ? { publicId: data.publicId, url: data.url } : undefined, error: data.ok ? undefined : (data.error ?? "Upload failed") }
              : pf
          )
        );
      } catch {
        setPendingFiles((prev) =>
          prev.map((pf) => (pf.file === file ? { ...pf, uploading: false, error: "Upload failed" } : pf))
        );
      }
    }
  };

  const removePending = (idx: number) => {
    setPendingFiles((prev) => {
      const copy = [...prev];
      if (copy[idx].preview) URL.revokeObjectURL(copy[idx].preview!);
      copy.splice(idx, 1);
      return copy;
    });
  };

  async function handleSend(e: FormEvent | React.KeyboardEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    const readyAttachments = pendingFiles.filter((pf) => pf.result && !pf.error);
    if (!trimmed && readyAttachments.length === 0) return;
    if (pendingFiles.some((pf) => pf.uploading)) return; // wait for uploads

    setSending(true);
    try {
      const res = await fetch("/api/portal/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId,
          body: trimmed || "📎 Attachment",
          attachments: readyAttachments.map((pf) => ({
            fileName: pf.file.name,
            fileSize: pf.file.size,
            cloudinaryPublicId: pf.result!.publicId,
            cloudinaryUrl: pf.result!.url,
          })),
        }),
      });
      if (res.ok) {
        setBody("");
        setPendingFiles([]);
        fetchMessages(lastMessageDate.current || undefined);
      }
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: "var(--neutral-400)" }}>
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="thread-container">
      <div className="thread-messages">
        {messages.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--neutral-400)", marginTop: 60, fontSize: 14 }}>
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isOwn = msg.senderId === currentUserId;
            let showDate = idx === 0;
            if (idx > 0) {
              const prev = new Date(messages[idx - 1].createdAt).toDateString();
              const curr = new Date(msg.createdAt).toDateString();
              if (prev !== curr) showDate = true;
            }

            if (msg.type === "SYSTEM") {
              return (
                <div key={msg.id} style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 4 }}>
                  {showDate && <div className="chat-date-sep">{fmtDate(msg.createdAt)}</div>}
                  <div className="message-system">{msg.body}</div>
                </div>
              );
            }

            return (
              <div key={msg.id} style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 4 }}>
                {showDate && <div className="chat-date-sep">{fmtDate(msg.createdAt)}</div>}
                <div className={`message-bubble ${isOwn ? "own" : ""}`}>
                  {!isOwn && (
                    <div className="message-avatar">
                      {msg.sender?.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={msg.sender.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                      ) : (
                        initials(msg.sender?.fullName, msg.sender?.email ?? "?")
                      )}
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", maxWidth: "100%", gap: 4 }}>
                    {!isOwn && (
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--neutral-600)", paddingLeft: 4 }}>
                        {msg.sender?.fullName?.split(" ")[0] ?? msg.sender?.email}
                        <span style={{ fontWeight: 400, color: "var(--neutral-400)", marginLeft: 6 }}>
                          {msg.sender?.designation ? msg.sender.designation : 
                            ((msg.sender?.role === "SUPER_ADMIN" || msg.sender?.role === "TEAM_MEMBER") ? "ReachLogic Team" : 
                            (msg.sender?.role === "CLIENT" ? "Client" : "Colleague"))}
                        </span>
                      </div>
                    )}
                    <div className="message-content">
                      {msg.body !== "📎 Attachment" && msg.body}
                      {/* Attachments */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div style={{ marginTop: msg.body !== "📎 Attachment" ? 8 : 0, display: "flex", flexDirection: "column", gap: 6 }}>
                          {msg.attachments.map((att) => {
                            const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(att.fileName);
                            return isImg ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img key={att.id} src={att.cloudinaryUrl} alt={att.fileName} style={{ maxWidth: 240, borderRadius: 8, display: "block" }} />
                            ) : (
                              <a key={att.id} href={att.cloudinaryUrl} target="_blank" rel="noreferrer" className="attachment-chip">
                                <FileText size={16} />
                                <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{att.fileName}</span>
                                <span style={{ fontSize: 11, color: "var(--neutral-400)", flexShrink: 0 }}>{fmtSize(att.fileSize)}</span>
                                <Download size={14} />
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Pending file previews */}
      {pendingFiles.length > 0 && (
        <div className="pending-files">
          {pendingFiles.map((pf, i) => (
            <div key={i} className="pending-file-chip">
              {pf.preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pf.preview} alt="" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
              ) : (
                <FileText size={20} color="var(--neutral-500)" />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pf.file.name}</div>
                <div style={{ fontSize: 11, color: pf.error ? "var(--danger)" : "var(--neutral-400)" }}>
                  {pf.uploading ? "Uploading…" : pf.error ?? fmtSize(pf.file.size)}
                </div>
              </div>
              <button onClick={() => removePending(i)} className="pending-file-remove">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <form className="thread-composer" onSubmit={handleSend}>
        <input ref={fileInputRef} type="file" multiple style={{ display: "none" }} onChange={handleFileSelect} />
        <button type="button" className="attach-btn" onClick={() => fileInputRef.current?.click()} title="Attach file">
          <Paperclip size={18} />
        </button>
        <textarea
          placeholder="Type a message…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e); }
          }}
          rows={1}
        />
        <button
          type="submit"
          disabled={sending || (pendingFiles.some((pf) => pf.uploading))}
          className="send-btn"
          style={{
            background: (body.trim() || pendingFiles.some((pf) => pf.result)) ? "var(--brand-dark)" : "var(--neutral-200)",
            color: (body.trim() || pendingFiles.some((pf) => pf.result)) ? "#fff" : "var(--neutral-500)",
          }}
        >
          {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </form>
    </div>
  );
}
