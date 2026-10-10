"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface Props {
  initialCity?: string;
  initialState?: string;
  initialCountry?: string;
}

export default function NewOrderForm({
  initialCity = "",
  initialState = "",
  initialCountry = "",
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [amount, setAmount] = useState("");

  const [billingCity, setBillingCity] = useState(initialCity);
  const [billingState, setBillingState] = useState(initialState);
  const [billingCountry, setBillingCountry] = useState(initialCountry || "United States");

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
          billingCity,
          billingState,
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

        {/* Billing Address Section */}
        <div style={{ marginTop: 32, padding: 24, background: "#fafafa", borderRadius: 8, border: "1px solid var(--neutral-200)" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--neutral-900)", marginBottom: 20 }}>
            Billing Location <span style={{ color: "var(--danger)" }}>*</span>
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
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
            </div>

            <div>
              <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>Country <span style={{ color: "var(--danger)" }}>*</span></label>
              <select
                className="form-input"
                value={billingCountry}
                onChange={(e) => setBillingCountry(e.target.value)}
                required
              >
                <option value="" disabled>Select country</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Bangladesh">Bangladesh</option>
                <option value="Other">Other</option>
              </select>
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
