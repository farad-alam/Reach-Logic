"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Plus, PenLine, Users, Check, ChevronLeft, ChevronRight, MessageSquare, X, FileText, Trash2 } from "lucide-react";
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
  
  // Tree state
  const [expandedClients, setExpandedClients] = useState<Set<string>>(
    new Set(initialClientId ? [initialClientId] : [clients[0]?.id ?? ""])
  );
  const [threadsByClient, setThreadsByClient] = useState<Record<string, Thread[]>>({});
  const [loadingClients, setLoadingClients] = useState<Set<string>>(new Set());
  
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  // Thread management modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newThreadName, setNewThreadName] = useState("");
  const [renameValue, setRenameValue] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  // Load threads for expanded clients
  useEffect(() => {
    expandedClients.forEach((clientId) => {
      if (clientId && !threadsByClient[clientId] && !loadingClients.has(clientId)) {
        setLoadingClients((prev) => new Set(prev).add(clientId));
        fetch(`/api/portal/threads?clientId=${clientId}`)
          .then((r) => r.json())
          .then((data) => {
            const list: Thread[] = data.threads ?? [];
            setThreadsByClient((prev) => ({ ...prev, [clientId]: list }));
            
            // If this is the selected client and we don't have a thread selected, select the most recent one
            if (clientId === selectedClientId && !selectedThreadId) {
              const sorted = [...list].sort((a, b) => {
                const da = a.messages[0]?.createdAt ? new Date(a.messages[0].createdAt).getTime() : 0;
                const db = b.messages[0]?.createdAt ? new Date(b.messages[0].createdAt).getTime() : 0;
                return db - da;
              });
              setSelectedThreadId(sorted[0]?.id ?? null);
            }
          })
          .finally(() => {
            setLoadingClients((prev) => {
              const next = new Set(prev);
              next.delete(clientId);
              return next;
            });
          });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedClients, selectedClientId]);

  const toggleClientExpanded = (clientId: string) => {
    setExpandedClients((prev) => {
      const next = new Set(prev);
      if (next.has(clientId)) next.delete(clientId);
      else next.add(clientId);
      return next;
    });
  };

  const activeThreads = selectedClientId ? (threadsByClient[selectedClientId] || []) : [];

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
      setThreadsByClient((prev) => {
        const list = prev[selectedClientId] || [];
        return { ...prev, [selectedClientId]: [...list, data.thread] };
      });
      setSelectedThreadId(data.thread.id);
      setExpandedClients((prev) => new Set(prev).add(selectedClientId));
    }
    setModalLoading(false);
    setShowCreateModal(false);
    setNewThreadName("");
  }

  async function renameThread() {
    if (!renameValue.trim() || !selectedThreadId || !selectedClientId) return;
    setModalLoading(true);
    const res = await fetch(`/api/portal/threads/${selectedThreadId}/rename`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: renameValue.trim() }),
    });
    const data = await res.json();
    if (data.ok) {
      setThreadsByClient((prev) => {
        const list = prev[selectedClientId] || [];
        return {
          ...prev,
          [selectedClientId]: list.map((t) => t.id === selectedThreadId ? { ...t, name: data.thread.name } : t)
        };
      });
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
      setThreadsByClient((prev) => {
        const list = prev[selectedClientId] || [];
        const remaining = list.filter((t) => t.id !== selectedThreadId);
        if (selectedThreadId === selectedThreadId) { // Need to update selectedThreadId asynchronously or here
           setSelectedThreadId(remaining.length > 0 ? remaining[0].id : null);
        }
        return { ...prev, [selectedClientId]: remaining };
      });
    }
    setModalLoading(false);
    setShowDeleteModal(false);
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
          {/* Accordion Tree view */}
          <div className="chat-client-tree">
            {clients.map((client) => {
              const isExpanded = expandedClients.has(client.id);
              const clientThreads = threadsByClient[client.id] || [];
              const isLoading = loadingClients.has(client.id);
              
              return (
                <div key={client.id} style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                  <button
                    className={`chat-client-header ${selectedClientId === client.id ? "active" : ""}`}
                    onClick={() => {
                      setSelectedClientId(client.id);
                      if (!isExpanded) toggleClientExpanded(client.id);
                    }}
                  >
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <Initials name={client.fullName} email={client.email} size={28} />
                      {(client.unread ?? 0) > 0 && (
                        <span className="client-unread-dot">{client.unread! > 9 ? "9+" : client.unread}</span>
                      )}
                    </div>
                    {sidebarOpen && (
                      <>
                        <div className="chat-client-name">{client.fullName || client.email}</div>
                        <div className="chat-client-actions" onClick={(e) => e.stopPropagation()}>
                          <button onClick={(e) => { e.stopPropagation(); setSelectedClientId(client.id); setShowCreateModal(true); }}>
                            <Plus size={14} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); toggleClientExpanded(client.id); }}>
                            <ChevronDown size={14} style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
                          </button>
                        </div>
                      </>
                    )}
                  </button>

                  {/* Threads for this client */}
                  {isExpanded && sidebarOpen && (
                    <div className="chat-thread-tree-list">
                      {isLoading ? (
                        <div style={{ padding: "8px 20px", fontSize: 12, color: "var(--neutral-400)" }}>Loading...</div>
                      ) : clientThreads.length === 0 ? (
                        <div style={{ padding: "8px 20px", fontSize: 12, color: "var(--neutral-400)" }}>No threads</div>
                      ) : (
                        clientThreads.map((t) => (
                          <div
                            key={t.id}
                            className={`chat-thread-item ${t.id === selectedThreadId ? "active" : ""}`}
                            onClick={() => {
                              setSelectedClientId(client.id);
                              setSelectedThreadId(t.id);
                            }}
                          >
                            <div className="thread-dot" />
                            <div className="chat-thread-name">{t.name}</div>
                            
                            {/* Hover context menu */}
                            <div className="thread-kebab-menu" onClick={(e) => e.stopPropagation()}>
                              <div style={{ display: "flex", gap: 2 }}>
                                <button className="thread-kebab-btn" onClick={(e) => { e.stopPropagation(); setSelectedThreadId(t.id); setSelectedClientId(client.id); setRenameValue(t.name); setShowRenameModal(true); }}>
                                  <PenLine size={12} />
                                </button>
                                <button className="thread-kebab-btn" onClick={(e) => { e.stopPropagation(); setSelectedThreadId(t.id); setSelectedClientId(client.id); setShowDeleteModal(true); }}>
                                  <Trash2 size={12} color="#ef4444" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

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
                  <div className="breadcrumb-title">
                    {selectedClient.fullName || selectedClient.email}
                  </div>
                  <div className="breadcrumb-subtitle">Select a thread</div>
                </div>
              </>
            ) : (
              <div className="breadcrumb-title">Select a Client</div>
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
              <div>{loadingClients.has(selectedClientId) ? "Loading threads…" : "No threads yet — create one by clicking + on the client row"}</div>
            </div>
          ) : (
            <MessageThread key={selectedThreadId} threadId={selectedThreadId} currentUserId={currentUserId} />
          )}
        </div>
      </div>

      {/* Right: Info sidebar */}
      {selectedThreadId && (
        <ThreadInfoSidebar threadId={selectedThreadId} currentUserId={currentUserId} userRole="SUPER_ADMIN" />
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
      {showMembersModal && selectedThreadId && selectedClientId && (
        <ManageMembersModal
          threadId={selectedThreadId}
          thread={selectedThread!}
          onClose={() => setShowMembersModal(false)}
          onUpdate={(updated) => setThreadsByClient((prev) => {
            const list = prev[selectedClientId] || [];
            return {
              ...prev,
              [selectedClientId]: list.map((t) => t.id === updated.id ? updated : t)
            };
          })}
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
