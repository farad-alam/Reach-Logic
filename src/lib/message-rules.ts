// src/lib/message-rules.ts
// Shared (client + server) rules for editing / deleting chat messages.
// The server is always the source of truth; the UI only uses these to show/hide actions.

export const EDIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const DELETE_WINDOW_MS = 48 * 60 * 60 * 1000; // 48 hours
export const ATTACHMENT_ONLY_BODY = "📎 Attachment";

interface RuleMessage {
  type: string;
  body: string;
  createdAt: string | Date;
  senderId: string | null;
  deletedAt?: string | Date | null;
}

const age = (m: RuleMessage) => Date.now() - new Date(m.createdAt).getTime();

export function canEditMessage(m: RuleMessage, userId: string): boolean {
  return (
    m.type === "USER" &&
    !m.deletedAt &&
    m.senderId === userId &&
    m.body !== ATTACHMENT_ONLY_BODY &&
    age(m) <= EDIT_WINDOW_MS
  );
}

export function canDeleteMessage(m: RuleMessage, userId: string, role?: string): boolean {
  if (m.type !== "USER" || m.deletedAt) return false;
  if (role === "SUPER_ADMIN") return true;
  return m.senderId === userId && age(m) <= DELETE_WINDOW_MS;
}
