"use client";
import type { StatementEntry, StatementTotals } from "./StatementClient";

function fmt(n: number, currency: string) {
  if (currency === "BDT") return `৳${Number(n).toFixed(2)}`;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function fmtDate(iso: string) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));
}

export default function StatementTable({
  entries,
  totals,
}: {
  entries: StatementEntry[];
  totals: StatementTotals;
}) {
  return (
    <div style={{ borderRadius: 12, border: "1px solid var(--neutral-200)", overflow: "hidden", background: "#fff", display: "flex", flexDirection: "column" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "var(--neutral-50)", borderBottom: "1px solid var(--neutral-200)", textTransform: "uppercase", fontSize: 11, fontWeight: 700, color: "var(--neutral-500)", letterSpacing: "0.05em" }}>
            <tr>
              <th style={{ padding: "16px 24px", textAlign: "left", whiteSpace: "nowrap" }}>Date</th>
              <th style={{ padding: "16px 24px", textAlign: "left", whiteSpace: "nowrap" }}>Client / Payer</th>
              <th style={{ padding: "16px 24px", textAlign: "left", whiteSpace: "nowrap" }}>Reference</th>
              <th style={{ padding: "16px 24px", textAlign: "left", whiteSpace: "nowrap" }}>Method</th>
              <th style={{ padding: "16px 24px", textAlign: "left", whiteSpace: "nowrap" }}>Currency</th>
              <th style={{ padding: "16px 24px", textAlign: "right", whiteSpace: "nowrap" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--neutral-500)", fontSize: 14 }}>
                  No payments or refunds found for the selected filters.
                </td>
              </tr>
            ) : (
              entries.map((e) => (
                <tr key={e.id} style={{ borderBottom: "1px solid var(--neutral-100)", fontSize: 13, background: e.isRefund ? "#fff5f5" : "transparent" }}>
                  <td style={{ padding: "16px 24px", color: "var(--neutral-600)" }}>{fmtDate(e.date)}</td>
                  <td style={{ padding: "16px 24px", fontWeight: 700, color: "var(--neutral-900)" }}>{e.clientName}</td>
                  <td style={{ padding: "16px 24px" }}>
                    <span style={{ fontWeight: 600, color: "var(--neutral-800)" }}>{e.invoiceNumber}</span>
                    {e.isRefund && (
                      <span style={{ display: "inline-flex", marginLeft: 8, alignItems: "center", background: "#fee2e2", color: "#991b1b", padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, border: "1px solid #fecaca" }}>
                        REFUND
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "16px 24px", color: "var(--neutral-600)" }}>{e.method || "—"}</td>
                  <td style={{ padding: "16px 24px", color: "var(--neutral-600)" }}>{e.currency}</td>
                  <td style={{ padding: "16px 24px", textAlign: "right", fontWeight: 700, color: e.isRefund ? "#dc2626" : "#16a34a" }}>
                    {e.isRefund ? `−${fmt(Math.abs(e.amount), e.currency)}` : fmt(e.amount, e.currency)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {entries.length > 0 && (
        <div style={{ padding: "32px 48px", background: "#fafafa", borderTop: "1px solid var(--neutral-200)", display: "flex", justifyContent: "flex-end" }}>
          <table style={{ width: 400 }}>
            <tbody>
              <tr>
                <td style={{ padding: "8px 0", color: "var(--neutral-500)", fontSize: 14, textAlign: "right", paddingRight: 32 }}>Total received</td>
                <td style={{ padding: "8px 0", fontWeight: 700, fontSize: 14, textAlign: "right" }}>
                  {totals["USD"]?.received > 0 && <div style={{ color: "#16a34a" }}>{fmt(totals["USD"].received, "USD")}</div>}
                  {totals["BDT"]?.received > 0 && <div style={{ color: "#16a34a" }}>{fmt(totals["BDT"].received, "BDT")}</div>}
                  {!totals["USD"]?.received && !totals["BDT"]?.received && <div style={{ color: "var(--neutral-400)" }}>—</div>}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "8px 0", color: "var(--neutral-500)", fontSize: 14, textAlign: "right", paddingRight: 32 }}>Refunds</td>
                <td style={{ padding: "8px 0", fontWeight: 700, fontSize: 14, textAlign: "right" }}>
                  {totals["USD"]?.refunds > 0 && <div style={{ color: "#dc2626" }}>−{fmt(totals["USD"].refunds, "USD")}</div>}
                  {totals["BDT"]?.refunds > 0 && <div style={{ color: "#dc2626" }}>−{fmt(totals["BDT"].refunds, "BDT")}</div>}
                  {!totals["USD"]?.refunds && !totals["BDT"]?.refunds && <div style={{ color: "var(--neutral-400)" }}>—</div>}
                </td>
              </tr>
              <tr>
                <td colSpan={2} style={{ padding: "16px 0 0" }}>
                  <div style={{ height: 1, background: "var(--neutral-200)", width: "100%" }} />
                </td>
              </tr>
              <tr>
                <td style={{ padding: "16px 0 0", fontWeight: 700, color: "var(--neutral-900)", fontSize: 15, textAlign: "right", paddingRight: 32 }}>Net for this period</td>
                <td style={{ padding: "16px 0 0", fontWeight: 800, fontSize: 15, textAlign: "right", color: "var(--neutral-900)" }}>
                  {totals["USD"]?.net !== undefined && <div>{totals["USD"].net < 0 ? "−" : ""}{fmt(Math.abs(totals["USD"].net), "USD")}</div>}
                  {totals["BDT"]?.net !== undefined && <div>{totals["BDT"].net < 0 ? "−" : ""}{fmt(Math.abs(totals["BDT"].net), "BDT")}</div>}
                  {totals["USD"]?.net === undefined && totals["BDT"]?.net === undefined && <div style={{ color: "var(--neutral-400)" }}>—</div>}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
