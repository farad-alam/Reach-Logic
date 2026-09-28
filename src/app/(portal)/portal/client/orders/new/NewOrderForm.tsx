"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function NewOrderForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [amount, setAmount] = useState("");

  const [billingStreet, setBillingStreet] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingState, setBillingState] = useState("");
  const [billingZip, setBillingZip] = useState("");
  const [billingCountry, setBillingCountry] = useState("United States");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/portal/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceTitle: title,
          description,
          startDate,
          endDate,
          amount,
          billingStreet,
          billingCity,
          billingState,
          billingZip,
          billingCountry,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to submit order.");
        return;
      }

      router.push(`/portal/client/orders/${data.orderId}`);
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 40 }}>
      <div style={{ marginBottom: 24 }}>
        <button onClick={() => router.back()} className="btn btn-sm" style={{ background: "transparent", color: "var(--neutral-500)", padding: 0, fontWeight: 500, display: "inline-flex", gap: 6, alignItems: "center", border: "none", cursor: "pointer" }}>
          <span style={{ fontSize: 16 }}>←</span> Back to My Orders
        </button>
      </div>
      
      <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--neutral-900)", marginBottom: 8 }}>Start a New Project</h1>
      <p style={{ color: "var(--neutral-500)", marginBottom: 32, fontSize: 15 }}>Fill in the details below. Our team will review and approve your project.</p>

      <form onSubmit={handleSubmit} style={{ background: "#fff", padding: 32, borderRadius: 12, border: "1px solid var(--neutral-200)", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
        {error && <div className="auth-error" style={{ marginBottom: 20 }}>{error}</div>}
        
        <div className="form-group">
          <label className="form-label" htmlFor="title" style={{ fontSize: 13, fontWeight: 600 }}>Project Title <span style={{ color: "var(--brand-accent)" }}>*</span></label>
          <input 
            id="title" 
            type="text" 
            className="form-input" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="e.g. Website Redesign" 
            required 
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="description" style={{ fontSize: 13, fontWeight: 600 }}>Project Description <span style={{ color: "var(--brand-accent)" }}>*</span></label>
          <textarea 
            id="description" 
            className="form-textarea" 
            rows={5}
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Describe what you need in detail..." 
            required 
            maxLength={2000}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 24 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="startDate" style={{ fontSize: 13, fontWeight: 600 }}>Start Date <span style={{ color: "var(--brand-accent)" }}>*</span></label>
            <input 
              id="startDate" 
              type="date" 
              className="form-input" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="endDate" style={{ fontSize: 13, fontWeight: 600 }}>End Date <span style={{ color: "var(--brand-accent)" }}>*</span></label>
            <input 
              id="endDate" 
              type="date" 
              className="form-input" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              required 
            />
            <div style={{ fontSize: 11, color: "var(--neutral-400)", marginTop: 6 }}>Must be after the Start Date</div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="amount" style={{ fontSize: 13, fontWeight: 600 }}>Amount (USD) <span style={{ color: "var(--brand-accent)" }}>*</span></label>
            <div style={{ display: "flex", border: "1px solid var(--neutral-200)", borderRadius: 6, overflow: "hidden" }}>
              <div style={{ background: "var(--neutral-50)", padding: "10px 16px", borderRight: "1px solid var(--neutral-200)", color: "var(--neutral-600)", fontWeight: 600 }}>$</div>
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

        {/* Billing Address Mandatory Section */}
        <div style={{ marginTop: 32, padding: 24, background: "#fafafa", borderRadius: 8, border: "1px solid var(--neutral-200)" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--neutral-900)", marginBottom: 20 }}>
            Billing Address <span style={{ color: "var(--danger)" }}>*</span>
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>Street Address <span style={{ color: "var(--danger)" }}>*</span></label>
              <input
                type="text"
                className="form-input"
                value={billingStreet}
                onChange={(e) => setBillingStreet(e.target.value)}
                placeholder="e.g. 123 Main Street, Apt 4B"
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <div>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>City <span style={{ color: "var(--danger)" }}>*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={billingCity}
                  onChange={(e) => setBillingCity(e.target.value)}
                  placeholder="e.g. Brooklyn"
                  required
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>State/Province <span style={{ color: "var(--danger)" }}>*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={billingState}
                  onChange={(e) => setBillingState(e.target.value)}
                  placeholder="e.g. New York"
                  required
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>Zip Code <span style={{ color: "var(--danger)" }}>*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={billingZip}
                  onChange={(e) => setBillingZip(e.target.value)}
                  placeholder="e.g. 11201"
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>Country</label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  className="form-input"
                  value="United States"
                  disabled
                  style={{ backgroundColor: "#f0f0f0", color: "var(--neutral-600)", paddingRight: 40 }}
                />
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--neutral-500)" }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
              <input 
                type="checkbox" 
                id="saveDefault" 
                style={{ width: 16, height: 16, cursor: "pointer", accentColor: "var(--brand-dark)" }} 
              />
              <label htmlFor="saveDefault" style={{ fontSize: 13, color: "var(--neutral-600)", cursor: "pointer" }}>
                Save as my default billing address
              </label>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 32 }}>
          <button type="button" className="btn btn-outline" style={{ padding: "10px 24px" }} onClick={() => router.back()}>Cancel</button>
          <button type="submit" className="btn btn-primary" style={{ padding: "10px 24px", background: "var(--brand-dark)", borderColor: "var(--brand-dark)" }} disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Submit Project"}
          </button>
        </div>
      </form>
    </div>
  );
}
