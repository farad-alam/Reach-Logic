import React from "react";

interface InvoiceDocumentProps {
  invoiceNumber: string;
  createdAt: Date;
  dueDate: Date;
  paidAt: Date | null;
  isPaid: boolean;
  billingName: string | null;
  billingEmail: string | null;
  billingCompany: string | null;
  billingAddress: string | null;
  clientFullName: string | null;
  clientEmail: string;
  orderServiceTitle: string | null;
  lineItems: Array<{ id: string; description: string; quantity: number | string; rate: number | string; amount: number | string }>;
  notes: string | null;
}

function fmt(n: number | string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(n));
}

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(d));
}

export default function InvoiceDocument({
  invoiceNumber,
  createdAt,
  dueDate,
  paidAt,
  isPaid,
  billingName,
  billingEmail,
  billingCompany,
  billingAddress,
  clientFullName,
  clientEmail,
  orderServiceTitle,
  lineItems,
  notes,
}: InvoiceDocumentProps) {
  const total = lineItems.reduce((sum, item) => sum + Number(item.amount), 0);
  const billToName = billingName || clientFullName || clientEmail;

  return (
    <div id="invoice-document" className="invoice-doc">
      {isPaid && (
        <div className="invoice-watermark">
          PAID
        </div>
      )}

      {/* Header */}
      <div className="invoice-header">
        <div>
          <h1 className="invoice-brand">ReachLogic</h1>
          <div className="invoice-brand-sub">
            hello@reachlogic.net<br />
            www.reachlogic.net
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <h2 className="invoice-title">Invoice</h2>
          <div className="invoice-number">#{invoiceNumber}</div>
        </div>
      </div>
      <div className="invoice-header-accent"></div>

      {/* Bill To & Details */}
      <div className="invoice-body">
        <div className="invoice-grid">
          <div>
            <div className="invoice-label">Bill To:</div>
            <div className="invoice-value">
              <strong style={{ display: "block", color: "var(--neutral-900)" }}>{billToName}</strong>
              {billingCompany && <div style={{ color: "var(--neutral-700)" }}>{billingCompany}</div>}
              {billingEmail && <div style={{ color: "var(--neutral-600)" }}>{billingEmail}</div>}
              {billingAddress && (
                <div style={{ color: "var(--neutral-600)", whiteSpace: "pre-wrap", marginTop: 4 }}>
                  {billingAddress}
                </div>
              )}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="invoice-detail-row">
              <span className="invoice-label">Issue Date:</span>
              <span className="invoice-value-inline">{fmtDate(createdAt)}</span>
            </div>
            <div className="invoice-detail-row">
              <span className="invoice-label">Due Date:</span>
              <span className="invoice-value-inline">{fmtDate(dueDate)}</span>
            </div>
            {isPaid && paidAt && (
              <div className="invoice-detail-row">
                <span className="invoice-label">Date Paid:</span>
                <span className="invoice-value-inline">{fmtDate(paidAt)}</span>
              </div>
            )}
            {orderServiceTitle && (
              <div className="invoice-detail-row">
                <span className="invoice-label">Project:</span>
                <span className="invoice-value-inline">{orderServiceTitle}</span>
              </div>
            )}
          </div>
        </div>

        {/* Line Items */}
        <div style={{ marginTop: 40, marginBottom: 40 }}>
          <table className="invoice-table">
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Description</th>
                <th style={{ textAlign: "right" }}>Qty</th>
                <th style={{ textAlign: "right", width: 100 }}>Rate</th>
                <th style={{ textAlign: "right", width: 100 }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 500, color: "var(--neutral-900)" }}>{item.description}</td>
                  <td style={{ textAlign: "right", color: "var(--neutral-600)" }}>{Number(item.quantity)}</td>
                  <td style={{ textAlign: "right", color: "var(--neutral-600)" }}>{fmt(item.rate)}</td>
                  <td style={{ textAlign: "right", fontWeight: 600, color: "var(--neutral-900)" }}>{fmt(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 40 }}>
          <div style={{ width: 320 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px" }}>
              <span style={{ fontSize: 14, color: "var(--neutral-600)" }}>Subtotal</span>
              <span style={{ fontSize: 14, color: "var(--neutral-900)", fontWeight: 500 }}>{fmt(total)}</span>
            </div>
            <div className="invoice-total-block">
              <span>{isPaid ? "Total Paid" : "Total Due"}</span>
              <span style={{ fontSize: 24 }}>{fmt(total)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <div style={{ borderTop: "1px solid var(--neutral-200)", paddingTop: 24, marginBottom: 24 }}>
            <h3 className="invoice-label" style={{ marginBottom: 8 }}>Notes</h3>
            <p style={{ fontSize: 14, color: "var(--neutral-700)", lineHeight: 1.6, whiteSpace: "pre-wrap", margin: 0 }}>
              {notes}
            </p>
          </div>
        )}
      </div>

      <div className="invoice-footer">
        Thank you for your business &bull; reachlogic.net &bull; hello@reachlogic.net
      </div>
    </div>
  );
}
