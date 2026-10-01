"use client";
import { useState, FormEvent, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquare, Plus, Check, ChevronDown } from "lucide-react";

interface Client {
  id: string;
  fullName: string | null;
  email: string;
}

type ClientMode = "PORTAL" | "OFF_PORTAL" | null;

export default function NewOrderForm({ clients }: { clients: Client[] }) {
  const router = useRouter();
  const [clientMode, setClientMode] = useState<ClientMode>(null);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [threadId, setThreadId] = useState("");
  const [serviceTitle, setServiceTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<"USD" | "BDT">("USD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [threads, setThreads] = useState<any[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [isThreadDropdownOpen, setIsThreadDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isCreateThreadModalOpen, setIsCreateThreadModalOpen] = useState(false);
  const [newThreadName, setNewThreadName] = useState("");
  const [creatingThread, setCreatingThread] = useState(false);

  // Billing (Off-Portal)
  const [billingName, setBillingName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [billingCompany, setBillingCompany] = useState("");
  const [billingCountry, setBillingCountry] = useState("");
  const [billingAddress, setBillingAddress] = useState("");

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsThreadDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchThreads(clientId: string, autoSelectNewId?: string) {
    if (!clientId) {
      setThreads([]);
      setThreadId("");
      return;
    }
    setThreadsLoading(true);
    try {
      const res = await fetch(`/api/portal/threads?clientId=${clientId}`);
      const data = await res.json();
      if (data.threads) {
        setThreads(data.threads);
        if (autoSelectNewId) {
          setThreadId(autoSelectNewId);
        } else {
          const general = data.threads.find((t: any) => t.name === "General");
          if (general) setThreadId(general.id);
          else if (data.threads.length > 0) setThreadId(data.threads[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setThreadsLoading(false);
    }
  }

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "") {
      setClientMode(null);
      setSelectedClientId("");
      setThreads([]);
      setThreadId("");
    } else if (val === "OFF_PORTAL") {
      setClientMode("OFF_PORTAL");
      setSelectedClientId("");
      setThreads([]);
      setThreadId("");
    } else {
      setClientMode("PORTAL");
      setSelectedClientId(val);
      fetchThreads(val);
    }
  };

  function handleCreateNewThread() {
    setIsCreateThreadModalOpen(true);
    setIsThreadDropdownOpen(false);
  }

  async function submitCreateThread() {
    if (!newThreadName || !newThreadName.trim()) return;
    
    setCreatingThread(true);
    try {
      const res = await fetch("/api/portal/threads/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selectedClientId, name: newThreadName.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.thread) {
        await fetchThreads(selectedClientId, data.thread.id);
        setIsCreateThreadModalOpen(false);
        setNewThreadName("");
      } else {
        alert(data.error || "Failed to create thread.");
      }
    } catch (e) {
      console.error(e);
      alert("Error creating thread.");
    } finally {
      setCreatingThread(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!clientMode) { setError("Please select a client."); return; }
    if (clientMode === "PORTAL" && !threadId) { setError("Please select a message thread."); return; }
    if (endDate && startDate && endDate < startDate) {
      setError("End date must be on or after start date.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = { 
        clientId: clientMode === "PORTAL" ? selectedClientId : undefined, 
        isOffPortal: clientMode === "OFF_PORTAL",
        threadId: clientMode === "PORTAL" ? threadId : undefined, 
        serviceTitle, description, startDate, endDate, amount, currency,
        ...(clientMode === "OFF_PORTAL" ? {
          offPortalName: billingName,
          offPortalEmail: billingEmail,
          offPortalCompany: billingCompany,
          offPortalCountry: billingCountry,
          offPortalAddress: billingAddress,
        } : {})
      };
      
      const res = await fetch("/api/portal/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to create order."); return; }
      router.push(`/portal/admin/orders/${data.orderId}`);
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  const selectedThread = threads.find(t => t.id === threadId);
  const selectedClient = clients.find(c => c.id === selectedClientId);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 40 }}>
      
      <form onSubmit={handleSubmit} style={{ background: "#fff", padding: 32, borderRadius: 12, border: "1px solid var(--neutral-200)", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
        {error && <div className="auth-error" style={{ marginBottom: 20 }}>{error}</div>}
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 20, marginBottom: 24 }}>
          {/* Client Dropdown */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="order-client" style={{ fontSize: 13, fontWeight: 600 }}>Client <span style={{ color: "var(--brand-accent)" }}>*</span></label>
            <select
              id="order-client"
              className="form-select"
              value={clientMode === "OFF_PORTAL" ? "OFF_PORTAL" : selectedClientId}
              onChange={handleClientChange}
              required
            >
              <option value="">Select a client…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.fullName ?? c.email}</option>
              ))}
              <optgroup label="─────────────────">
                <option value="OFF_PORTAL">Off-Portal Client</option>
              </optgroup>
            </select>
          </div>

          {/* Thread Picker */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>Message Thread <span style={{ color: "var(--brand-accent)" }}>*</span></label>
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <div 
                onClick={() => clientMode === "PORTAL" && setIsThreadDropdownOpen(!isThreadDropdownOpen)}
                className="form-input" 
                style={{ 
                  display: "flex", alignItems: "center", justifyContent: "space-between", 
                  cursor: clientMode === "PORTAL" ? "pointer" : "not-allowed", 
                  background: clientMode === "PORTAL" ? "#fff" : "var(--neutral-50)",
                  borderColor: isThreadDropdownOpen ? "var(--brand-accent)" : "var(--neutral-200)"
                }}
              >
                {clientMode === "OFF_PORTAL" ? (
                  <span style={{ color: "var(--neutral-400)" }}>Not needed for Off-Portal Client</span>
                ) : threadsLoading ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--neutral-500)" }}>
                    <Loader2 size={16} className="animate-spin" /> Loading...
                  </div>
                ) : selectedThread ? (
                  <span style={{ color: "var(--neutral-900)" }}>{selectedThread.name}</span>
                ) : (
                  <span style={{ color: "var(--neutral-400)" }}>{selectedClientId ? "Select thread..." : "Select client first"}</span>
                )}
                <ChevronDown size={16} color="var(--neutral-500)" />
              </div>

              {isThreadDropdownOpen && (
                <div style={{ 
                  position: "absolute", top: "calc(100% + 4px)", left: 0, width: "100%", 
                  background: "#fff", zIndex: 50, 
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)", 
                  borderRadius: 8, border: "1px solid var(--neutral-200)",
                  overflow: "hidden"
                }}>
                  <div style={{ padding: "10px 16px", fontSize: 10, fontWeight: 700, color: "var(--neutral-500)", textTransform: "uppercase", letterSpacing: "0.05em", background: "var(--neutral-50)", borderBottom: "1px solid var(--neutral-100)" }}>
                    {selectedClient?.fullName?.toUpperCase() || "CLIENT"}'S THREADS
                  </div>
                  
                  <div style={{ maxHeight: 240, overflowY: "auto" }}>
                    {threads.map(t => (
                      <div 
                        key={t.id} 
                        onClick={() => { setThreadId(t.id); setIsThreadDropdownOpen(false); }}
                        style={{ 
                          padding: "12px 16px", 
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          cursor: "pointer",
                          background: threadId === t.id ? "#e8f5f0" : "transparent",
                          borderBottom: "1px solid var(--neutral-100)"
                        }}
                        onMouseEnter={(e) => { if(threadId !== t.id) e.currentTarget.style.background = "var(--neutral-50)"; }}
                        onMouseLeave={(e) => { if(threadId !== t.id) e.currentTarget.style.background = "transparent"; }}
                      >
                        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                          <MessageSquare size={16} color="var(--neutral-500)" style={{ marginTop: 2 }} />
                          <div>
                            <div style={{ fontWeight: 600, color: "var(--neutral-900)", fontSize: 14 }}>{t.name}</div>
                            <div style={{ fontSize: 12, color: "var(--neutral-500)", marginTop: 2 }}>
                              {t.members.map((m:any) => m.user.fullName?.split(" ")[0]).join(", ")}
                            </div>
                          </div>
                        </div>
                        {threadId === t.id && <Check size={16} color="var(--brand-accent)" />}
                      </div>
                    ))}
                  </div>

                  <div 
                    onClick={handleCreateNewThread}
                    style={{ 
                      padding: "14px 16px", display: "flex", alignItems: "center", gap: 8, 
                      color: "var(--brand-dark)", fontWeight: 600, fontSize: 13, 
                      cursor: "pointer", borderTop: "1px solid var(--neutral-100)",
                      background: "#fff"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--neutral-50)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
                  >
                    <Plus size={16} /> Create new thread for this order
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {clientMode === "OFF_PORTAL" && (
          <div style={{ padding: "24px", background: "#fff", border: "1px solid var(--neutral-200)", borderRadius: 12, marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--neutral-900)" }}>Billing Information</h3>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#9a3412", background: "#ffedd5", padding: "4px 10px", borderRadius: 12 }}>Off-Portal Client</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>Full Name <span style={{ color: "var(--brand-accent)" }}>*</span></label>
                <input type="text" className="form-input" value={billingName} onChange={e => setBillingName(e.target.value)} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>Email Address <span style={{ color: "var(--brand-accent)" }}>*</span></label>
                <input type="email" className="form-input" value={billingEmail} onChange={e => setBillingEmail(e.target.value)} required />
              </div>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>Company (Optional)</label>
                <input type="text" className="form-input" value={billingCompany} onChange={e => setBillingCompany(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>Country <span style={{ color: "var(--brand-accent)" }}>*</span></label>
                <input type="text" className="form-input" value={billingCountry} onChange={e => setBillingCountry(e.target.value)} required />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>Billing Address <span style={{ color: "var(--brand-accent)" }}>*</span></label>
              <textarea className="form-textarea" rows={2} value={billingAddress} onChange={e => setBillingAddress(e.target.value)} required placeholder="Street, City, State/Province, Postal Code" />
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="order-title" style={{ fontSize: 13, fontWeight: 600 }}>Project Title <span style={{ color: "var(--brand-accent)" }}>*</span></label>
          <input
            id="order-title"
            type="text"
            className="form-input"
            value={serviceTitle}
            onChange={(e) => setServiceTitle(e.target.value)}
            placeholder="e.g. Website Redesign"
            required
            maxLength={150}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="order-desc" style={{ fontSize: 13, fontWeight: 600 }}>Project Description <span style={{ color: "var(--brand-accent)" }}>*</span></label>
          <textarea
            id="order-desc"
            className="form-textarea"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the scope of work…"
            required
            maxLength={3000}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="order-start" style={{ fontSize: 13, fontWeight: 600 }}>Start Date <span style={{ color: "var(--brand-accent)" }}>*</span></label>
            <input
              id="order-start"
              type="date"
              className="form-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="order-end" style={{ fontSize: 13, fontWeight: 600 }}>End Date <span style={{ color: "var(--brand-accent)" }}>*</span></label>
            <input
              id="order-end"
              type="date"
              className="form-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="amount" style={{ fontSize: 13, fontWeight: 600 }}>Amount <span style={{ color: "var(--brand-accent)" }}>*</span></label>
            <div style={{ display: "flex", border: "1px solid var(--neutral-200)", borderRadius: 6, overflow: "hidden" }}>
              <select className="form-select" style={{ border: "none", borderRadius: 0, width: "70px", background: "var(--neutral-50)", borderRight: "1px solid var(--neutral-200)", padding: "10px 8px" }} value={currency} onChange={e => setCurrency(e.target.value as "USD" | "BDT")}>
                <option value="USD">$ USD</option>
                <option value="BDT">৳ BDT</option>
              </select>
              <input 
                id="amount" 
                type="number"
                step="0.01"
                min="0"
                className="form-input" 
                style={{ border: "none", borderRadius: 0 }}
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required 
              />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 32 }}>
          <button type="button" className="btn btn-outline" style={{ padding: "10px 24px" }} onClick={() => router.back()}>Cancel</button>
          <button type="submit" className="btn btn-primary" style={{ padding: "10px 24px", background: "var(--brand-dark)", borderColor: "var(--brand-dark)" }} disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Create Order"}
          </button>
        </div>
      </form>

      {/* Create Thread Modal */}
      {isCreateThreadModalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
          background: "rgba(0,0,0,0.5)", zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, width: 400, maxWidth: "90%", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--neutral-900)", marginBottom: 16 }}>Create New Thread</h3>
            <div className="form-group">
              <label className="form-label">Thread Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Website Redesign"
                value={newThreadName}
                onChange={(e) => setNewThreadName(e.target.value)}
                onKeyDown={(e) => { if(e.key === "Enter") { e.preventDefault(); submitCreateThread(); } }}
                autoFocus
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 24 }}>
              <button 
                className="btn btn-outline" 
                onClick={() => { setIsCreateThreadModalOpen(false); setNewThreadName(""); }}
                disabled={creatingThread}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                style={{ background: "var(--brand-dark)", borderColor: "var(--brand-dark)" }}
                onClick={submitCreateThread}
                disabled={!newThreadName.trim() || creatingThread}
              >
                {creatingThread ? <Loader2 size={16} className="animate-spin" /> : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
