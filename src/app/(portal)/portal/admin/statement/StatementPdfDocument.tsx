"use client";
import React from "react";
import type { StatementEntry, StatementTotals } from "./StatementClient";

function fmt(n: number, currency: string) {
  if (currency === "BDT") return `৳${Number(n).toFixed(2)}`;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function fmtDate(iso: string) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));
}

export default function StatementPdfDocument({
  entries,
  totals,
  period,
  customFrom,
  customTo,
  currency,
}: {
  entries: StatementEntry[];
  totals: StatementTotals;
  period: string;
  customFrom: string;
  customTo: string;
  currency: string;
}) {
  let periodStr = "";
  if (period === "this_month") periodStr = "This Month";
  else if (period === "last_month") periodStr = "Last Month";
  else if (period === "this_year") periodStr = "This Year";
  else if (period === "all_time") periodStr = "All Time";
  else if (period === "custom") periodStr = `${fmtDate(customFrom)} to ${fmtDate(customTo)}`;

  let currencyStr = "All currencies";
  if (currency === "USD") currencyStr = "USD only";
  if (currency === "BDT") currencyStr = "BDT only";

  return (
    <div id="statement-pdf-layout" style={{ display: "none", width: "800px", padding: "40px", background: "#fff", fontFamily: "sans-serif", color: "#111827" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>ReachLogic Statement</h1>
          <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>
            <p style={{ margin: 0 }}>Period: {periodStr}</p>
            <p style={{ margin: 0 }}>Currency: {currencyStr}</p>
            <p style={{ margin: 0 }}>Generated: {fmtDate(new Date().toISOString())}</p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px", color: "var(--brand-dark)" }}>ReachLogic</h2>
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>portal@reachlogic.net</p>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 40 }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #e5e7eb", textAlign: "left", fontSize: 11, textTransform: "uppercase", color: "#6b7280" }}>
            <th style={{ padding: "12px 8px" }}>Date</th>
            <th style={{ padding: "12px 8px" }}>Client/Payer</th>
            <th style={{ padding: "12px 8px" }}>Reference</th>
            <th style={{ padding: "12px 8px" }}>Method</th>
            <th style={{ padding: "12px 8px", textAlign: "right" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id} style={{ borderBottom: "1px solid #f3f4f6", fontSize: 12 }}>
              <td style={{ padding: "12px 8px", color: "#4b5563" }}>{fmtDate(e.date)}</td>
              <td style={{ padding: "12px 8px", fontWeight: 600 }}>{e.clientName}</td>
              <td style={{ padding: "12px 8px" }}>
                {e.invoiceNumber}
                {e.isRefund && <span style={{ marginLeft: 6, color: "#dc2626", fontSize: 10, fontWeight: 700 }}>REFUND</span>}
              </td>
              <td style={{ padding: "12px 8px", color: "#4b5563" }}>{e.method || "—"}</td>
              <td style={{ padding: "12px 8px", textAlign: "right", fontWeight: 700, color: e.isRefund ? "#dc2626" : "#111827" }}>
                {e.isRefund ? `-${fmt(Math.abs(e.amount), e.currency)}` : fmt(e.amount, e.currency)}
              </td>
            </tr>
          ))}
          {entries.length === 0 && (
            <tr>
              <td colSpan={5} style={{ padding: "24px 8px", textAlign: "center", color: "#6b7280" }}>No records found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {entries.length > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <table style={{ width: "300px", borderCollapse: "collapse" }}>
            <tbody>
              {["USD", "BDT"].map((cur) => totals[cur] && (
                <React.Fragment key={cur}>
                  <tr>
                    <td style={{ padding: "6px 0", color: "#6b7280", fontSize: 13 }}>Total received ({cur})</td>
                    <td style={{ padding: "6px 0", textAlign: "right", fontWeight: 600, fontSize: 13 }}>{fmt(totals[cur].received, cur)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "6px 0", color: "#6b7280", fontSize: 13 }}>Refunds</td>
                    <td style={{ padding: "6px 0", textAlign: "right", fontWeight: 600, fontSize: 13, color: "#dc2626" }}>-{fmt(totals[cur].refunds, cur)}</td>
                  </tr>
                  <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                    <td style={{ padding: "6px 0 12px", color: "#111827", fontWeight: 700, fontSize: 14 }}>Net ({cur})</td>
                    <td style={{ padding: "6px 0 12px", textAlign: "right", fontWeight: 800, fontSize: 14 }}>
                      {totals[cur].net < 0 ? "-" : ""}{fmt(Math.abs(totals[cur].net), cur)}
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
