"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Plus, PenLine, Users, Check, ChevronLeft, ChevronRight, MessageSquare, X, FileText } from "lucide-react";
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
}: {
  clients: ClientRow[];
  currentUserId: string;
  initialClientId?: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(initialClientId ?? clients[0]?.id ?? null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [threadDropOpen, setThreadDropOpen] = useState(false);
  const [loadingThreads, setLoadingThreads] = useState(false);

  // Thread management modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [newThreadName, setNewThreadName] = useState("");
  const [renameValue, setRenameValue] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  const dropRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setThreadDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Load threads when client changes
  useEffect(() => {
    if (!selectedClientId) return;
    setLoadingThreads(true);
    setSelectedThreadId(null);
    fetch(`/api/portal/threads?clientId=${selectedClientId}`)
      .then((r) => r.json())
      .then((data) => {
        const list: Thread[] = data.threads ?? [];
        setThreads(list);
        // Select thread with most recent activity
        const sorted = [...list].sort((a, b) => {
          const da = a.messages[0]?.createdAt ? new Date(a.messages[0].createdAt).getTime() : 0;
          const db = b.messages[0]?.createdAt ? new Date(b.messages[0].createdAt).getTime() : 0;
          return db - da;
        });
        setSelectedThreadId(sorted[0]?.id ?? null);
      })
      .finally(() => setLoadingThreads(false));
  }, [selectedClientId]);

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const selectedThread = threads.find((t) => t.id === selectedThreadId);

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
      setThreads((prev) => [...prev, data.thread]);
      setSelectedThreadId(data.thread.id);
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
      setThreads((prev) => prev.map((t) => t.id === selectedThreadId ? { ...t, name: data.thread.name } : t));
    }
    setModalLoading(false);
    setShowRenameModal(false);
    setRenameValue("");
  }

  return (
    <div className="admin-chat-shell">
      {/* Left: Client list sidebar */}
      <div className={`chat-client-sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <div className="chat-client-sidebar-header">
          {sidebarOpen && <span className="chat-sidebar-label">Conversations</span>}
          <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen((v) => !v)}>
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
        <div className="chat-client-list">
          {clients.map((client) => (
            <button
              key={client.id}
              className={`chat-client-row ${selectedClientId === client.id ? "active" : ""}`}
              onClick={() => setSelectedClientId(client.id)}
            >
              <div style={{ position: "relative", flexShrink: 0 }}>
                <Initials name={client.fullName} email={client.email} size={36} />
                {(client.unread ?? 0) > 0 && (
                  <span className="client-unread-dot">{client.unread! > 9 ? "9+" : client.unread}</span>
                )}
              </div>
              {sidebarOpen && (
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="chat-client-name">{client.fullName || client.email}</div>
                  <div className="chat-client-email">{client.email}</div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Center: Chat area */}
      <div className="chat-center">
        {/* Chat topbar */}
        <div className="chat-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
            {/* Thread dropdown */}
            <div className="thread-drop-wrapper" ref={dropRef}>
              <button
                className="thread-drop-btn"
                onClick={() => setThreadDropOpen((v) => !v)}
                disabled={!selectedClientId || loadingThreads}
              >
                <MessageSquare size={14} />
                <span>{selectedThread?.name ?? (loadingThreads ? "Loading…" : "No thread")}</span>
                <ChevronDown size={14} />
              </button>

              {threadDropOpen && (
                <div className="thread-dropdown">
                  <div className="thread-drop-label">THREADS WITH {selectedClient?.fullName?.toUpperCase() ?? "CLIENT"}</div>
                  {threads.map((t) => (
                    <button
                      key={t.id}
                      className={`thread-drop-item ${t.id === selectedThreadId ? "active" : ""}`}
                      onClick={() => { setSelectedThreadId(t.id); setThreadDropOpen(false); }}
                    >
                      <MessageSquare size={13} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{t.name}</div>
                        <div style={{ fontSize: 11, color: "var(--neutral-400)" }}>
                          {t.members.map((m) => m.user.fullName?.split(" ")[0] ?? m.user.email).join(", ")}
                        </div>
                      </div>
                      {t.id === selectedThreadId && <Check size={13} color="var(--brand-accent)" />}
                    </button>
                  ))}
                  <div className="thread-drop-divider" />
                  <button className="thread-drop-action" onClick={() => { setShowCreateModal(true); setThreadDropOpen(false); }}>
                    <Plus size={13} /> Create new thread
                  </button>
                  <button className="thread-drop-action" onClick={() => { setRenameValue(selectedThread?.name ?? ""); setShowRenameModal(true); setThreadDropOpen(false); }} disabled={!selectedThreadId}>
                    <PenLine size={13} /> Rename this thread
                  </button>
                  <button className="thread-drop-action" onClick={() => { setShowMembersModal(true); setThreadDropOpen(false); }} disabled={!selectedThreadId}>
                    <Users size={13} /> Manage members
                  </button>
                </div>
              )}
            </div>

            {selectedThread && (
              <span style={{ fontSize: 12, color: "var(--neutral-500)" }}>
                {selectedThread.members.length} in thread
              </span>
            )}
          </div>

          {selectedClientId && (
            <div style={{ display: "flex", gap: 10 }}>
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
              <div>Select a client to start messaging</div>
            </div>
          ) : !selectedThreadId ? (
            <div className="chat-empty-state">
              <MessageSquare size={40} color="var(--neutral-300)" />
              <div>{loadingThreads ? "Loading threads…" : "No threads yet — create one above"}</div>
            </div>
          ) : (
            <MessageThread key={selectedThreadId} threadId={selectedThreadId} currentUserId={currentUserId} />
          )}
        </div>
      </div>

      {/* Right: Info sidebar */}
      {selectedThreadId && (
        <ThreadInfoSidebar threadId={selectedThreadId} currentUserId={currentUserId} isAdmin />
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

      {/* Manage Members Modal */}
      {showMembersModal && selectedThreadId && (
        <ManageMembersModal
          threadId={selectedThreadId}
          thread={selectedThread!}
          onClose={() => setShowMembersModal(false)}
          onUpdate={(updated) => setThreads((prev) => prev.map((t) => t.id === updated.id ? updated : t))}
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
