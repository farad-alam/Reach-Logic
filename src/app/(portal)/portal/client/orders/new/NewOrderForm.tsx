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
    <form onSubmit={handleSubmit}>
      {error && <div className="auth-error">{error}</div>}
      
      <div className="form-group">
        <label className="form-label" htmlFor="title">Project Title</label>
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
        <label className="form-label" htmlFor="description">Project Description & Requirements</label>
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

      <div className="grid-2">
        <div className="form-group">
          <label className="form-label" htmlFor="startDate">Target Start Date</label>
          <input 
            id="startDate" 
            type="date" 
            className="form-input" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="endDate">Target Completion Date</label>
          <input 
            id="endDate" 
            type="date" 
            className="form-input" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
            required 
          />
        </div>
      </div>

      <div style={{ background: "var(--neutral-50)", padding: "16px", borderRadius: "8px", marginTop: "12px", border: "1px solid var(--neutral-100)" }}>
        <p style={{ fontSize: "13px", color: "var(--neutral-600)", margin: 0, lineHeight: 1.5 }}>
          <strong>Next steps:</strong> After submitting, our team will review your requirements and provide a quote. You can track the progress and communicate with us in your dashboard.
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
        <button type="button" className="btn btn-outline" onClick={() => router.back()}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : "Submit Project"}
        </button>
      </div>
    </form>
  );
}
