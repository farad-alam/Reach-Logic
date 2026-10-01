"use client";
import type { StatementTotals } from "./StatementClient";

function fmt(n: number, currency: string) {
  if (currency === "BDT") return `৳${Number(n).toFixed(2)}`;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default function StatementSummaryCards({
  totals,
  entryCount,
  paymentCount,
  refundCount,
}: {
  totals: StatementTotals;
  entryCount: number;
  paymentCount: number;
  refundCount: number;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 32 }}>
      
      {/* USD CARD */}
      <div style={cardStyle}>
        <div style={cardLabelStyle}>RECEIVED (USD)</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "var(--brand-dark)", marginBottom: 8, lineHeight: 1 }}>
          {totals["USD"] ? fmt(totals["USD"].received, "USD") : "—"}
        </div>
        <div style={{ fontSize: 13, color: "var(--neutral-500)" }}>
          {totals["USD"] && (totals["USD"].refunds > 0 || totals["USD"].net !== totals["USD"].received) ? (
            <>Refunds −{fmt(totals["USD"].refunds, "USD")} · Net <span style={{ fontWeight: 600 }}>{fmt(totals["USD"].net, "USD")}</span></>
          ) : (
            "No refunds in this period"
          )}
        </div>
      </div>

      {/* BDT CARD */}
      <div style={cardStyle}>
        <div style={cardLabelStyle}>RECEIVED (BDT)</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "var(--brand-dark)", marginBottom: 8, lineHeight: 1 }}>
          {totals["BDT"] ? fmt(totals["BDT"].received, "BDT") : "—"}
        </div>
        <div style={{ fontSize: 13, color: "var(--neutral-500)" }}>
          {totals["BDT"] && (totals["BDT"].refunds > 0 || totals["BDT"].net !== totals["BDT"].received) ? (
            <>Refunds −{fmt(totals["BDT"].refunds, "BDT")} · Net <span style={{ fontWeight: 600 }}>{fmt(totals["BDT"].net, "BDT")}</span></>
          ) : (
            "No refunds in this period"
          )}
        </div>
      </div>

      {/* ENTRIES CARD */}
      <div style={cardStyle}>
        <div style={cardLabelStyle}>ENTRIES</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "var(--neutral-900)", marginBottom: 8, lineHeight: 1 }}>
          {entryCount}
        </div>
        <div style={{ fontSize: 13, color: "var(--neutral-500)" }}>
          {paymentCount} payment{paymentCount !== 1 ? "s" : ""} · {refundCount} refund{refundCount !== 1 ? "s" : ""}
        </div>
      </div>

    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 12,
  padding: 24,
  border: "1px solid var(--neutral-200)",
  boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
};

const cardLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: "var(--neutral-500)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: 12,
};
