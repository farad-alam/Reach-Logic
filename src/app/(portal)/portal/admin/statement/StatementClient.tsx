"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2, Search, Calendar, ChevronDown } from "lucide-react";
import StatementTable from "./StatementTable";
import StatementSummaryCards from "./StatementSummaryCards";
import StatementDownloadButtons from "./StatementDownloadButtons";

export type StatementEntry = {
  id: string;
  date: string;
  clientName: string;
  invoiceNumber: string;
  isRefund: boolean;
  method: string | null;
  currency: string;
  amount: number;
  notes: string | null;
};

export type StatementTotals = Record<string, { received: number; refunds: number; net: number }>;

type Client = { id: string; fullName: string | null; email: string };

const PERIODS = [
  { key: "this_month", label: "This Month" },
  { key: "last_month", label: "Last Month" },
  { key: "this_year", label: "This Year" },
  { key: "all_time", label: "All Time" },
];

export default function StatementClient({ initialClients }: { initialClients: Client[] }) {
  const [period, setPeriod] = useState("this_month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [clientId, setClientId] = useState("all");
  const [currency, setCurrency] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [entries, setEntries] = useState<StatementEntry[]>([]);
  const [totals, setTotals] = useState<StatementTotals>({});
  const [entryCount, setEntryCount] = useState(0);
  const [paymentCount, setPaymentCount] = useState(0);
  const [refundCount, setRefundCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const customRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Close custom picker on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (customRef.current && !customRef.current.contains(e.target as Node)) {
        setShowCustom(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchStatement = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ period, clientId, currency, search: debouncedSearch });
    if (period === "custom" && customFrom) params.set("from", customFrom);
    if (period === "custom" && customTo) params.set("to", customTo);
    try {
      const res = await fetch(`/api/portal/invoices/statement?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      setEntries(data.entries ?? []);
      setTotals(data.totals ?? {});
      setEntryCount(data.entryCount ?? 0);
      setPaymentCount(data.paymentCount ?? 0);
      setRefundCount(data.refundCount ?? 0);
    } finally {
      setLoading(false);
    }
  }, [period, clientId, currency, debouncedSearch, customFrom, customTo]);

  useEffect(() => { fetchStatement(); }, [fetchStatement]);

  const customRangeLabel = customFrom && customTo
    ? `Custom: ${fmtDate(customFrom)} to ${fmtDate(customTo)}`
    : "Custom";

  return (
    <div className="portal-page" id="statement-root">
      {/* ── PAGE HEADER ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--neutral-900)", margin: 0 }}>Statement</h1>
          <p style={{ fontSize: 13, color: "var(--neutral-500)", margin: "4px 0 0" }}>Read only. Filled automatically from paid invoices.</p>
        </div>
        <StatementDownloadButtons entries={entries} totals={totals} period={period} customFrom={customFrom} customTo={customTo} currency={currency} />
      </div>

      {/* ── FILTERS ── */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 24 }}>
        {/* Period pills */}
        <div style={{ display: "flex", gap: 4, background: "#f3f4f6", borderRadius: 10, padding: 3 }}>
          {PERIODS.map((p) => (
            <button key={p.key} onClick={() => { setPeriod(p.key); setShowCustom(false); }}
              style={{
                padding: "7px 14px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 600,
                cursor: "pointer", transition: "all 0.15s",
                background: period === p.key ? "var(--brand-dark)" : "transparent",
                color: period === p.key ? "#fff" : "var(--neutral-600)",
              }}>
              {p.label}
            </button>
          ))}

          {/* Custom date range */}
          <div style={{ position: "relative" }} ref={customRef}>
            <button onClick={() => { setShowCustom(!showCustom); setPeriod("custom"); }}
              style={{
                padding: "7px 14px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 600,
                cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, transition: "all 0.15s",
                background: period === "custom" ? "var(--brand-dark)" : "transparent",
                color: period === "custom" ? "#fff" : "var(--neutral-600)",
              }}>
              <Calendar size={13} />
              {period === "custom" ? customRangeLabel : "Custom"}
            </button>
            {showCustom && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", left: 0, background: "#fff",
                borderRadius: 10, border: "1px solid var(--neutral-200)", boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                padding: 16, zIndex: 100, minWidth: 260,
              }}>
                <div style={{ marginBottom: 10 }}>
                  <label style={labelStyle}>From</label>
                  <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} style={dateInputStyle} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>To</label>
                  <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} style={dateInputStyle} />
                </div>
                <button onClick={() => setShowCustom(false)} style={{ width: "100%", padding: "8px", borderRadius: 7, background: "var(--brand-dark)", color: "#fff", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Client dropdown */}
        <div style={{ position: "relative" }}>
          <select value={clientId} onChange={(e) => setClientId(e.target.value)} style={selectStyle}>
            <option value="all">All clients</option>
            {initialClients.map((c) => (
              <option key={c.id} value={c.id}>{c.fullName || c.email}</option>
            ))}
          </select>
          <ChevronDown size={13} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--neutral-500)" }} />
        </div>

        {/* Currency filter */}
        <div style={{ display: "flex", gap: 4, background: "#f3f4f6", borderRadius: 10, padding: 3 }}>
          {[["all", "All currencies"], ["USD", "USD only"], ["BDT", "BDT only"]].map(([val, label]) => (
            <button key={val} onClick={() => setCurrency(val)}
              style={{
                padding: "7px 14px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 600,
                cursor: "pointer", transition: "all 0.15s",
                background: currency === val ? "var(--brand-dark)" : "transparent",
                color: currency === val ? "#fff" : "var(--neutral-600)",
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginLeft: "auto" }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--neutral-400)" }} />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: "8px 14px 8px 34px", borderRadius: 8, border: "1px solid var(--neutral-200)", fontSize: 13, outline: "none", width: 200 }}
          />
        </div>
      </div>

      {/* ── SUMMARY CARDS ── */}
      <StatementSummaryCards totals={totals} entryCount={entryCount} paymentCount={paymentCount} refundCount={refundCount} />

      {/* ── TABLE ── */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
          <Loader2 size={28} className="animate-spin" style={{ color: "var(--brand-dark)" }} />
        </div>
      ) : (
        <StatementTable entries={entries} totals={totals} />
      )}
    </div>
  );
}

function fmtDate(iso: string) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));
}

const labelStyle: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 600, color: "var(--neutral-600)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" };
const dateInputStyle: React.CSSProperties = { width: "100%", padding: "8px 10px", border: "1px solid var(--neutral-200)", borderRadius: 7, fontSize: 13, boxSizing: "border-box" };
const selectStyle: React.CSSProperties = { appearance: "none", padding: "8px 32px 8px 12px", borderRadius: 8, border: "1px solid var(--neutral-200)", fontSize: 13, fontWeight: 500, color: "var(--neutral-700)", background: "#fff", cursor: "pointer", outline: "none" };
