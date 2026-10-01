"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, PenLine, Users, X, MessageSquare, Trash2, Info } from "lucide-react";
import MessageThread from "@/components/portal/MessageThread";
import ThreadInfoSidebar from "@/components/portal/ThreadInfoSidebar";

interface ClientRow {
  id: string;
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
  unread?: number;
}

interface ThreadMemberUser {
  id: string;
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
  role: string;
}

interface Thread {
  id: string;
  name: string;
  clientId: string;
  members: { user: ThreadMemberUser }[];
  messages: { createdAt: string }[];
}

function Initials({ name, email, size = 36 }: { name: string | null; email: string; size?: number }) {
  const text = name
    ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : email[0].toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "var(--brand-mid)", color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, flexShrink: 0,
    }}>{text}</div>
  );
}

export default function AdminChatPage({
  clients,
  currentUserId,
  initialClientId,
  initialThreadId,
}: {
  clients: ClientRow[];
  currentUserId: string;
  initialClientId?: string;
  initialThreadId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedClientId = searchParams.get("clientId") ?? initialClientId ?? null;
  const selectedThreadId = searchParams.get("threadId") ?? initialThreadId ?? null;

  const [activeThreads, setActiveThreads] = useState<Thread[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(false);

  // Thread management modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showInfoSheet, setShowInfoSheet] = useState(false);
  const [newThreadName, setNewThreadName] = useState("");
  const [renameValue, setRenameValue] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  const navigate = useCallback((clientId: string | null, threadId: string | null) => {
    const params = new URLSearchParams();
    if (clientId) params.set("clientId", clientId);
    if (threadId) params.set("threadId", threadId);
    router.push(`/portal/admin/messages?${params.toString()}`);
  }, [router]);

  // Load threads when clientId changes
  useEffect(() => {
    if (!selectedClientId) { setActiveThreads([]); return; }
    setLoadingThreads(true);
    fetch(`/api/portal/threads?clientId=${selectedClientId}`)
      .then((r) => r.json())
      .then((data) => {
        const list: Thread[] = data.threads ?? [];
        setActiveThreads(list);
        // Auto-select most recent thread if none selected
        if (!selectedThreadId && list.length > 0) {
          const sorted = [...list].sort((a, b) => {
            const da = a.messages[0]?.createdAt ? new Date(a.messages[0].createdAt).getTime() : 0;
            const db = b.messages[0]?.createdAt ? new Date(b.messages[0].createdAt).getTime() : 0;
            return db - da;
          });
          navigate(selectedClientId, sorted[0].id);
        }
      })
      .finally(() => setLoadingThreads(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClientId]);

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const selectedThread = activeThreads.find((t) => t.id === selectedThreadId);

  async function createThread() {
    if (!newThreadName.trim() || !selectedClientId) return;
    setModalLoading(true);
    const res = await fetch("/api/portal/threads/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: selectedClientId, name: newThreadName.trim() }),
    });
    const data = await res.json();
    if (data.ok && data.thread) {
      setActiveThreads((prev) => [...prev, data.thread]);
      navigate(selectedClientId, data.thread.id);
    }
    setModalLoading(false);
    setShowCreateModal(false);
    setNewThreadName("");
  }

  async function renameThread() {
    if (!renameValue.trim() || !selectedThreadId) return;
    setModalLoading(true);
    const res = await fetch(`/api/portal/threads/${selectedThreadId}/rename`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: renameValue.trim() }),
    });
    const data = await res.json();
    if (data.ok) {
      setActiveThreads((prev) => prev.map((t) => t.id === selectedThreadId ? { ...t, name: data.thread.name } : t));
    }
    setModalLoading(false);
    setShowRenameModal(false);
    setRenameValue("");
  }

  async function deleteThread() {
    if (!selectedThreadId || !selectedClientId) return;
    setModalLoading(true);
    const res = await fetch(`/api/portal/threads/${selectedThreadId}/delete`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (data.ok) {
      const remaining = activeThreads.filter((t) => t.id !== selectedThreadId);
      setActiveThreads(remaining);
      navigate(selectedClientId, remaining.length > 0 ? remaining[0].id : null);
    }
    setModalLoading(false);
    setShowDeleteModal(false);
  }

  return (
    <div className="admin-chat-shell">
      {/* Center: Chat area */}
      <div className="chat-center">
        {/* Chat topbar */}
        <div className="chat-topbar">
          <div className="chat-topbar-breadcrumb">
            {selectedClient && selectedThread ? (
              <>
                <Initials name={selectedClient.fullName} email={selectedClient.email} size={36} />
                <div className="breadcrumb-text">
                  <div className="breadcrumb-title">
                    {selectedClient.fullName || selectedClient.email} / {selectedThread.name}
                  </div>
                  <div className="breadcrumb-subtitle">
                    {selectedThread.members.length} people in this thread
                  </div>
                </div>
              </>
            ) : selectedClient ? (
              <>
                <Initials name={selectedClient.fullName} email={selectedClient.email} size={36} />
                <div className="breadcrumb-text">
                  <div className="breadcrumb-title">{selectedClient.fullName || selectedClient.email}</div>
                  <div className="breadcrumb-subtitle">
                    {loadingThreads ? "Loading threads…" : "Select a thread from the sidebar"}
                  </div>
                </div>
              </>
            ) : (
              <div className="breadcrumb-title" style={{ color: "var(--neutral-400)" }}>Select a client from the sidebar</div>
            )}
          </div>

          {selectedClientId && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <button className="btn btn-outline btn-sm" onClick={() => { setShowCreateModal(true); }} disabled={!selectedClientId}>
                <Plus size={14} /> New Thread
              </button>
              {selectedThread && (
                <>
                  <button className="btn btn-outline btn-sm" title="Rename" onClick={() => { setRenameValue(selectedThread.name); setShowRenameModal(true); }}>
                    <PenLine size={14} />
                  </button>
                  <button className="btn btn-outline btn-sm" title="Manage members" onClick={() => setShowMembersModal(true)}>
                    <Users size={14} />
                  </button>
                  <button className="btn btn-outline btn-sm" title="Delete thread" onClick={() => setShowDeleteModal(true)} style={{ color: "#ef4444" }}>
                    <Trash2 size={14} />
                  </button>
                  {/* Info button — hidden on desktop, visible on mobile via CSS */}
                  <button
                    className="btn btn-outline btn-sm chat-info-mobile-btn"
                    title="Thread info"
                    onClick={() => setShowInfoSheet(true)}
                    id="admin-thread-info-btn"
                  >
                    <Info size={14} /> Info
                  </button>
                </>
              )}
              <a href={`/portal/admin/invoices/new?clientId=${selectedClientId}`} className="btn btn-outline btn-sm">Create Invoice</a>
              <a href={`/portal/admin/orders/new?clientId=${selectedClientId}`} className="btn btn-primary btn-sm">+ New Order</a>
            </div>
          )}
        </div>

        {/* Messages */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          {!selectedClientId ? (
            <div className="chat-empty-state">
              <MessageSquare size={40} color="var(--neutral-300)" />
              <div>Select a client from the sidebar to start messaging</div>
            </div>
          ) : !selectedThreadId ? (
            <div className="chat-empty-state">
              <MessageSquare size={40} color="var(--neutral-300)" />
              <div>{loadingThreads ? "Loading threads…" : "No threads yet — click '+ New Thread' above"}</div>
            </div>
          ) : (
            <MessageThread key={selectedThreadId} threadId={selectedThreadId} currentUserId={currentUserId} />
          )}
        </div>
      </div>

      {/* Right: Info sidebar (desktop) — hidden on mobile, replaced by bottom sheet */}
      {selectedThreadId && (
        <ThreadInfoSidebar threadId={selectedThreadId} currentUserId={currentUserId} userRole="SUPER_ADMIN" />
      )}

      {/* Mobile: Thread info bottom sheet */}
      {showInfoSheet && selectedThreadId && (
        <div
          className="thread-info-sheet-overlay open"
          onClick={() => setShowInfoSheet(false)}
        >
          <div className="thread-info-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="thread-info-sheet-handle">
              <div className="thread-info-sheet-handle-bar" />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px 12px" }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--neutral-900)" }}>Thread Info</span>
              <button
                onClick={() => setShowInfoSheet(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--neutral-400)", display: "flex" }}
              >
                <X size={18} />
              </button>
            </div>
            <ThreadInfoSidebar threadId={selectedThreadId} currentUserId={currentUserId} userRole="SUPER_ADMIN" />
          </div>
        </div>
      )}

      {/* Create Thread Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Thread</h3>
              <button onClick={() => setShowCreateModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <label className="form-label">Thread Name <span style={{ color: "var(--neutral-400)", fontWeight: 400 }}>(max 30 chars)</span></label>
              <input
                className="form-input"
                value={newThreadName}
                onChange={(e) => setNewThreadName(e.target.value.slice(0, 30))}
                placeholder="e.g. IG Growth, Web Development"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && createThread()}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline btn-sm" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={createThread} disabled={modalLoading || !newThreadName.trim()}>
                {modalLoading ? "Creating…" : "Create Thread"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {showRenameModal && (
        <div className="modal-overlay" onClick={() => setShowRenameModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Rename Thread</h3>
              <button onClick={() => setShowRenameModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <label className="form-label">New Name</label>
              <input
                className="form-input"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value.slice(0, 30))}
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && renameThread()}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline btn-sm" onClick={() => setShowRenameModal(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={renameThread} disabled={modalLoading || !renameValue.trim()}>
                {modalLoading ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Thread</h3>
              <button onClick={() => setShowDeleteModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 14, color: "var(--neutral-600)", lineHeight: 1.5 }}>
                Are you sure you want to delete <strong>{selectedThread?.name}</strong>? 
                This will permanently remove the thread and all associated messages. This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline btn-sm" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button 
                className="btn btn-sm" 
                onClick={deleteThread} 
                disabled={modalLoading}
                style={{ background: "#ef4444", color: "white", border: "none" }}
              >
                {modalLoading ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Members Modal */}
      {showMembersModal && selectedThreadId && (
        <ManageMembersModal
          threadId={selectedThreadId}
          thread={selectedThread!}
          onClose={() => setShowMembersModal(false)}
          onUpdate={(updated) => setActiveThreads((prev) => prev.map((t) => t.id === updated.id ? updated : t))}
        />
      )}
    </div>
  );
}

// ─── Manage Members Modal ─────────────────────────────────────────────────────
function ManageMembersModal({
  threadId,
  thread,
  onClose,
  onUpdate,
}: {
  threadId: string;
  thread: Thread;
  onClose: () => void;
  onUpdate: (updated: Thread) => void;
}) {
  const [teamMembers, setTeamMembers] = useState<ThreadMemberUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState<string | null>(null);
  const memberIds = new Set(thread.members.map((m) => m.user.id));

  useEffect(() => {
    fetch("/api/portal/team")
      .then((r) => r.json())
      .then((d) => setTeamMembers(d.members ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function addMember(userId: string) {
    setWorking(userId);
    try {
      const res = await fetch(`/api/portal/threads/${threadId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.ok) {
        onUpdate({
          ...thread,
          members: [...thread.members, { user: data.member }],
        });
      } else {
        alert(data.error || "Failed to add member");
      }
    } catch (err: any) {
      alert("Network error: " + err.message);
    }
    setWorking(null);
  }

  async function removeMember(userId: string) {
    setWorking(userId);
    try {
      const res = await fetch(`/api/portal/threads/${threadId}/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok) {
        onUpdate({
          ...thread,
          members: thread.members.filter((m) => m.user.id !== userId),
        });
      } else {
        alert(data.error || "Failed to remove member");
      }
    } catch (err: any) {
      alert("Network error: " + err.message);
    }
    setWorking(null);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Manage Members — {thread.name}</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          {loading ? (
            <div style={{ textAlign: "center", color: "var(--neutral-400)", padding: 24 }}>Loading team…</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {teamMembers.length === 0 && (
                <div style={{ fontSize: 13, color: "var(--neutral-400)" }}>No team members found.</div>
              )}
              {teamMembers.map((member) => {
                const inThread = memberIds.has(member.id);
                const isWorking = working === member.id;
                return (
                  <div key={member.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--brand-mid)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600 }}>
                      {member.fullName?.[0] ?? member.email[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{member.fullName ?? member.email}</div>
                      <div style={{ fontSize: 12, color: "var(--neutral-500)" }}>{member.email}</div>
                    </div>
                    <button
                      className={`btn btn-sm ${inThread ? "btn-outline" : "btn-primary"}`}
                      onClick={() => inThread ? removeMember(member.id) : addMember(member.id)}
                      disabled={isWorking}
                    >
                      {isWorking ? "…" : inThread ? "Remove" : "Add"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline btn-sm" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}
