"use client";
import { useState, FormEvent, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquare, Check, ChevronDown, Info } from "lucide-react";

interface ClientData {
  id: string;
  fullName: string | null;
  email: string;
  company: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
}

type ClientMode = "PORTAL" | "OFF_PORTAL" | null;

export default function NewInvoiceForm({ clients }: { clients: ClientData[] }) {
  const router = useRouter();
  const [clientMode, setClientMode] = useState<ClientMode>(null);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedThreadId, setSelectedThreadId] = useState("");
  const [threads, setThreads] = useState<any[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [isThreadDropdownOpen, setIsThreadDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Billing
  const [billingName, setBillingName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [billingCompany, setBillingCompany] = useState("");
  const [billingCountry, setBillingCountry] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingState, setBillingState] = useState("");
  
  // Invoice Details
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<"USD" | "BDT">("USD");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsThreadDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchThreads(clientId: string) {
    if (!clientId) {
      setThreads([]);
      setSelectedThreadId("");
      return;
    }
    setThreadsLoading(true);
    try {
      const res = await fetch(`/api/portal/threads?clientId=${clientId}`);
      const data = await res.json();
      if (data.threads) {
        setThreads(data.threads);
        const general = data.threads.find((t: any) => t.name === "General");
        if (general) setSelectedThreadId(general.id);
        else if (data.threads.length > 0) setSelectedThreadId(data.threads[0].id);
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
      setBillingName("");
      setBillingEmail("");
      setBillingCompany("");
      setBillingCountry("");
      setBillingCity("");
      setBillingState("");
      setThreads([]);
      setSelectedThreadId("");
    } else if (val === "OFF_PORTAL") {
      setClientMode("OFF_PORTAL");
      setSelectedClientId("");
      setBillingName("");
      setBillingEmail("");
      setBillingCompany("");
      setBillingCountry("");
      setBillingCity("");
      setBillingState("");
      setThreads([]);
      setSelectedThreadId("");
    } else {
      setClientMode("PORTAL");
      setSelectedClientId(val);
      const c = clients.find(cl => cl.id === val);
      if (c) {
        setBillingName(c.fullName || "");
        setBillingEmail(c.email);
        setBillingCompany(c.company || "");
        setBillingCountry(c.country || "");
        setBillingCity(c.city || "");
        setBillingState(c.state || "");
      }
      fetchThreads(val);
    }
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!clientMode) { setError("Please select a client."); return; }
    if (clientMode === "PORTAL" && !selectedThreadId) { setError("Please select a message thread."); return; }
    if (endDate && startDate && endDate < startDate) {
      setError("End date must be on or after start date.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/portal/invoices/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: clientMode === "PORTAL" ? selectedClientId : undefined,
          isOffPortal: clientMode === "OFF_PORTAL",
          threadId: clientMode === "PORTAL" ? selectedThreadId : undefined,
          billingName, billingEmail, billingCompany, billingCountry, billingCity, billingState,
          projectTitle, projectDescription, startDate, endDate,
          amount: parseFloat(amount),
          currency, notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create invoice."); return; }
      router.push(`/portal/admin/invoices/${data.invoiceId}`);
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  const selectedThread = threads.find(t => t.id === selectedThreadId);
  const selectedClient = clients.find(c => c.id === selectedClientId);

  return (
    <form onSubmit={handleSubmit} style={{ background: "#fff", padding: 32, borderRadius: 12, border: "1px solid var(--neutral-200)", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
      {error && <div className="auth-error" style={{ marginBottom: 20 }}>{error}</div>}
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 20, marginBottom: 24 }}>
        {/* Client Dropdown */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>Client <span style={{ color: "var(--brand-accent)" }}>*</span></label>
          <select
            className="form-select"
            value={clientMode === "OFF_PORTAL" ? "OFF_PORTAL" : selectedClientId}
            onChange={handleClientChange}
            required
          >
            <option value="">Select a client…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.fullName || c.email}</option>
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
                      onClick={() => { setSelectedThreadId(t.id); setIsThreadDropdownOpen(false); }}
                      style={{ 
                        padding: "12px 16px", 
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        cursor: "pointer",
                        background: selectedThreadId === t.id ? "#e8f5f0" : "transparent",
                        borderBottom: "1px solid var(--neutral-100)"
                      }}
                      onMouseEnter={(e) => { if(selectedThreadId !== t.id) e.currentTarget.style.background = "var(--neutral-50)"; }}
                      onMouseLeave={(e) => { if(selectedThreadId !== t.id) e.currentTarget.style.background = "transparent"; }}
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
                      {selectedThreadId === t.id && <Check size={16} color="var(--brand-accent)" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: "24px", background: clientMode === "PORTAL" ? "rgba(16,185,129,0.04)" : "#fff", border: `1px solid ${clientMode === "PORTAL" ? "rgba(16,185,129,0.2)" : "var(--neutral-200)"}`, borderRadius: 12, marginBottom: 32, position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--neutral-900)" }}>Billing Information</h3>
          {clientMode === "PORTAL" && <span style={{ fontSize: 12, fontWeight: 600, color: "#059669", background: "#d1fae5", padding: "4px 10px", borderRadius: 12 }}>Auto-filled from profile</span>}
          {clientMode === "OFF_PORTAL" && <span style={{ fontSize: 12, fontWeight: 600, color: "#9a3412", background: "#ffedd5", padding: "4px 10px", borderRadius: 12 }}>Off-Portal Client</span>}
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

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>City <span style={{ color: "var(--brand-accent)" }}>*</span></label>
            <input type="text" className="form-input" value={billingCity} onChange={e => setBillingCity(e.target.value)} required />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>State/Province <span style={{ color: "var(--brand-accent)" }}>*</span></label>
            <input type="text" className="form-input" value={billingState} onChange={e => setBillingState(e.target.value)} required />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <h3 style={{ margin: "0 0 20px 0", fontSize: 16, fontWeight: 700, color: "var(--neutral-900)" }}>Invoice Details</h3>
        <div className="form-group">
          <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>Project Title <span style={{ color: "var(--brand-accent)" }}>*</span></label>
          <input type="text" className="form-input" value={projectTitle} onChange={e => setProjectTitle(e.target.value)} placeholder="e.g. Website Redesign" required maxLength={150} />
        </div>

        <div className="form-group">
          <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>Project Description <span style={{ color: "var(--brand-accent)" }}>*</span></label>
          <textarea className="form-textarea" rows={5} value={projectDescription} onChange={e => setProjectDescription(e.target.value)} placeholder="Describe the scope of work…" required maxLength={3000} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 20 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>Start Date <span style={{ color: "var(--brand-accent)" }}>*</span></label>
            <input type="date" className="form-input" value={startDate} onChange={e => setStartDate(e.target.value)} required />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>End Date <span style={{ color: "var(--brand-accent)" }}>*</span></label>
            <input type="date" className="form-input" value={endDate} onChange={e => setEndDate(e.target.value)} required />
            <div style={{ fontSize: 11, color: "var(--neutral-500)", marginTop: 4 }}>Also used as the due date</div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>Amount <span style={{ color: "var(--brand-accent)" }}>*</span></label>
            <div style={{ display: "flex", border: "1px solid var(--neutral-200)", borderRadius: 6, overflow: "hidden" }}>
              <select className="form-select" style={{ border: "none", borderRadius: 0, width: "70px", background: "var(--neutral-50)", borderRight: "1px solid var(--neutral-200)", padding: "10px 8px" }} value={currency} onChange={e => setCurrency(e.target.value as "USD" | "BDT")}>
                <option value="USD">$ USD</option>
                <option value="BDT">৳ BDT</option>
              </select>
              <input type="number" step="0.01" min="0" className="form-input" style={{ border: "none", borderRadius: 0 }} placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} required />
            </div>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>Notes (Optional)</label>
          <textarea className="form-textarea" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional instructions or notes…" />
        </div>
      </div>

      <div style={{ display: "flex", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, gap: 12, alignItems: "center", marginBottom: 32 }}>
        <Info size={20} color="#0369a1" />
        <div style={{ fontSize: 13, color: "#0f172a" }}>
          An order is created automatically with this invoice, using the same title, dates and amount.
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <button type="button" className="btn btn-outline" style={{ padding: "10px 24px" }} onClick={() => router.back()}>Cancel</button>
        <button type="submit" className="btn btn-primary" style={{ padding: "10px 24px", background: "var(--brand-dark)", borderColor: "var(--brand-dark)" }} disabled={loading || !clientMode}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : "Create Invoice & Send Email"}
        </button>
      </div>
    </form>
  );
}
