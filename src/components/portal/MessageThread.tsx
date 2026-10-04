"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { Send, Loader2, Paperclip, X, FileText, Download, Pencil, Ban, AlertCircle, Trash2 } from "lucide-react";
import MessageActions from "@/components/portal/MessageActions";
import { canEditMessage, canDeleteMessage, ATTACHMENT_ONLY_BODY } from "@/lib/message-rules";

// Converts plain-text URLs in a string into clickable <a> elements
function linkify(text: string): React.ReactNode[] {
  const URL_REGEX = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/gi;
  const parts = text.split(URL_REGEX);
  return parts.map((part, i) =>
    URL_REGEX.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "var(--brand-accent)", wordBreak: "break-all", textDecoration: "underline" }}
      >
        {part}
      </a>
    ) : (
      part
    )
  );
}

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
  editedAt?: string | null;
  deletedAt?: string | null;
  deletedById?: string | null;
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

// Time shown inside each bubble (viewer's local timezone), e.g. "12:16 PM"
function fmt(d: string) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "numeric", hour12: true }).format(new Date(d));
}
// Full date-time for tooltips, e.g. "Sun, Oct 4, 2026, 12:16 PM"
function fmtFull(d: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric", hour12: true,
  }).format(new Date(d));
}
// Date separator: Today / Yesterday / Mon / Oct 2 / Oct 2, 2025
function fmtDateSep(d: string) {
  const date = new Date(d);
  const now = new Date();
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOf(now) - startOf(date)) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays > 1 && diffDays < 7) return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
  if (date.getFullYear() === now.getFullYear()) {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
  }
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}
function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Latest "something happened" timestamp of a message — used as the polling cursor
function latestStamp(m: Message) {
  return [m.createdAt, m.editedAt, m.deletedAt]
    .filter(Boolean)
    .reduce((a, b) => (new Date(b as string) > new Date(a as string) ? b : a)) as string;
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
  const [viewerRole, setViewerRole] = useState<string | undefined>(undefined);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [, setTick] = useState(0); // re-render periodically so edit/delete windows expire in the UI
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<Message[]>([]);
  const lastMessageDate = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!actionError) return;
    const t = setTimeout(() => setActionError(null), 4500);
    return () => clearTimeout(t);
  }, [actionError]);

  const fetchMessages = async (since?: string) => {
    try {
      const url = since
        ? `/api/portal/messages/list?threadId=${threadId}&since=${encodeURIComponent(since)}`
        : `/api/portal/messages/list?threadId=${threadId}`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      if (data.viewerRole) setViewerRole(data.viewerRole);
      if (data.messages && data.messages.length > 0) {
        const incoming: Message[] = data.messages;
        const known = new Set(messagesRef.current.map((m) => m.id));
        const hasNew = incoming.some((m) => !known.has(m.id));

        // Upsert by id: replace changed (edited/deleted) messages, append new ones
        setMessages((prev) => {
          const byId = new Map(incoming.map((m) => [m.id, m]));
          const merged = prev.map((p) => byId.get(p.id) ?? p);
          const prevIds = new Set(prev.map((p) => p.id));
          const added = incoming.filter((m) => !prevIds.has(m.id));
          return [...merged, ...added];
        });

        // Move the cursor to the newest create/edit/delete timestamp we've seen
        const newest = incoming.map(latestStamp).reduce((a, b) => (new Date(b) > new Date(a) ? b : a));
        if (!lastMessageDate.current || new Date(newest) > new Date(lastMessageDate.current)) {
          lastMessageDate.current = newest;
        }
        if (hasNew) setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
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
    setEditingId(null);
    setBody("");
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

  // ── Edit ──────────────────────────────────────────────────────────────
  const startEdit = (msg: Message) => {
    setEditingId(msg.id);
    setBody(msg.body);
    setTimeout(() => {
      const el = textareaRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
    }, 0);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setBody("");
  };

  async function saveEdit() {
    const msg = messagesRef.current.find((m) => m.id === editingId);
    const trimmed = body.trim();
    if (!msg || !trimmed) return;
    if (trimmed === msg.body) {
      cancelEdit();
      return;
    }

    const snapshot = msg;
    const optimisticEditedAt = new Date().toISOString();
    setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, body: trimmed, editedAt: optimisticEditedAt } : m)));
    setEditingId(null);
    setBody("");
    setSending(true);
    try {
      const res = await fetch(`/api/portal/messages/${msg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to edit message.");
      if (data.message?.editedAt) {
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, editedAt: data.message.editedAt } : m)));
        if (!lastMessageDate.current || new Date(data.message.editedAt) > new Date(lastMessageDate.current)) {
          lastMessageDate.current = data.message.editedAt;
        }
      }
    } catch (err) {
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? snapshot : m))); // rollback
      setActionError(err instanceof Error ? err.message : "Failed to edit message.");
    } finally {
      setSending(false);
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────
  async function confirmDelete() {
    const msg = messagesRef.current.find((m) => m.id === confirmDeleteId);
    if (!msg) {
      setConfirmDeleteId(null);
      return;
    }
    setDeleting(true);
    const snapshot = msg;
    const now = new Date().toISOString();
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, body: "", attachments: [], deletedAt: now, deletedById: currentUserId } : m))
    );
    setConfirmDeleteId(null);
    if (editingId === msg.id) cancelEdit();
    try {
      const res = await fetch(`/api/portal/messages/${msg.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to delete message.");
      if (data.deletedAt && (!lastMessageDate.current || new Date(data.deletedAt) > new Date(lastMessageDate.current))) {
        lastMessageDate.current = data.deletedAt;
      }
    } catch (err) {
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? snapshot : m))); // rollback
      setActionError(err instanceof Error ? err.message : "Failed to delete message.");
    } finally {
      setDeleting(false);
    }
  }

  async function copyMessage(msg: Message) {
    try {
      await navigator.clipboard.writeText(msg.body);
    } catch {
      setActionError("Couldn't copy the message.");
    }
  }

  async function handleSend(e: FormEvent | React.KeyboardEvent) {
    e.preventDefault();
    if (editingId) {
      await saveEdit();
      return;
    }
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
          body: trimmed || ATTACHMENT_ONLY_BODY,
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

  const editingMsg = editingId ? messages.find((m) => m.id === editingId) : null;
  const hasContent = !!body.trim() || (!editingId && pendingFiles.some((pf) => pf.result));

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
                  {showDate && <div className="chat-date-sep">{fmtDateSep(msg.createdAt)}</div>}
                  <div className="message-system">
                    {msg.body}
                    <span className="message-system-time" title={fmtFull(msg.createdAt)}>{fmt(msg.createdAt)}</span>
                  </div>
                </div>
              );
            }

            const isDeleted = !!msg.deletedAt;
            const isAttachmentOnly = msg.body === ATTACHMENT_ONLY_BODY;
            const canEdit = canEditMessage(msg, currentUserId);
            const canDelete = canDeleteMessage(msg, currentUserId, viewerRole);
            const canCopy = !isDeleted && !!msg.body && !isAttachmentOnly;

            return (
              <div key={msg.id} style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 4 }}>
                {showDate && <div className="chat-date-sep">{fmtDateSep(msg.createdAt)}</div>}
                <div className={`message-bubble ${isOwn ? "own" : ""} ${editingId === msg.id ? "editing" : ""}`}>
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
                            ((msg.sender?.role === "SUPER_ADMIN" || msg.sender?.role === "TEAM_MEMBER") ? "" : 
                            (msg.sender?.role === "CLIENT" ? "Client" : "Client Colleague"))}
                        </span>
                      </div>
                    )}
                    <div className={`message-content ${isDeleted ? "deleted" : ""}`}>
                      {isDeleted ? (
                        <span className="message-deleted-text">
                          <Ban size={14} />
                          {msg.deletedById === currentUserId ? "You deleted this message" : "This message was deleted"}
                        </span>
                      ) : (
                        <>
                          <MessageActions
                            isOwn={isOwn}
                            canCopy={canCopy}
                            canEdit={canEdit}
                            canDelete={canDelete}
                            onCopy={() => copyMessage(msg)}
                            onEdit={() => startEdit(msg)}
                            onDelete={() => setConfirmDeleteId(msg.id)}
                          />
                          {!isAttachmentOnly && msg.body && <span className="message-text">{linkify(msg.body)}</span>}
                          {/* Attachments */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div style={{ marginTop: !isAttachmentOnly ? 8 : 0, display: "flex", flexDirection: "column", gap: 6 }}>
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
                        </>
                      )}
                      {/* WhatsApp-style footer: "Edited" + time */}
                      <span className="message-footer" title={fmtFull(msg.createdAt)}>
                        {!isDeleted && msg.editedAt && <span className="message-edited">Edited</span>}
                        <span className="message-time">{fmt(msg.createdAt)}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Action error toast */}
      {actionError && (
        <div className="chat-action-error" role="alert">
          <AlertCircle size={15} /> {actionError}
        </div>
      )}

      {/* Pending file previews */}
      {!editingId && pendingFiles.length > 0 && (
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

      {/* Editing banner (WhatsApp style) */}
      {editingMsg && (
        <div className="composer-edit-banner">
          <Pencil size={16} className="composer-edit-icon" />
          <div className="composer-edit-text">
            <div className="composer-edit-title">Editing message</div>
            <div className="composer-edit-original">{editingMsg.body}</div>
          </div>
          <button type="button" className="composer-edit-cancel" onClick={cancelEdit} aria-label="Cancel editing">
            <X size={16} />
          </button>
        </div>
      )}

      <form className="thread-composer" onSubmit={handleSend}>
        <input ref={fileInputRef} type="file" multiple style={{ display: "none" }} onChange={handleFileSelect} />
        {!editingId && (
          <button type="button" className="attach-btn" onClick={() => fileInputRef.current?.click()} title="Attach file">
            <Paperclip size={18} />
          </button>
        )}
        <textarea
          ref={textareaRef}
          placeholder={editingId ? "Edit your message…" : "Type a message…"}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape" && editingId) { e.preventDefault(); cancelEdit(); return; }
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e); }
          }}
          rows={1}
        />
        <button
          type="submit"
          disabled={sending || (!editingId && pendingFiles.some((pf) => pf.uploading))}
          className="send-btn"
          style={{
            background: hasContent ? "var(--brand-dark)" : "var(--neutral-200)",
            color: hasContent ? "#fff" : "var(--neutral-500)",
          }}
        >
          {sending ? <Loader2 size={18} className="animate-spin" /> : editingId ? <Pencil size={18} /> : <Send size={18} />}
        </button>
      </form>

      {/* Delete confirmation */}
      {confirmDeleteId && (
        <div className="chat-confirm-overlay" onClick={() => !deleting && setConfirmDeleteId(null)}>
          <div className="chat-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-msg-title" onClick={(e) => e.stopPropagation()}>
            <div className="chat-confirm-icon"><Trash2 size={20} /></div>
            <h3 id="delete-msg-title">Delete message?</h3>
            <p>This message will be removed for everyone in this conversation.</p>
            <div className="chat-confirm-actions">
              <button type="button" className="chat-confirm-cancel" onClick={() => setConfirmDeleteId(null)} disabled={deleting}>
                Cancel
              </button>
              <button type="button" className="chat-confirm-delete" onClick={confirmDelete} disabled={deleting}>
                {deleting ? "Deleting…" : "Delete for everyone"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
