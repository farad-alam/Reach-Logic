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
  orderNumber?: string | null;        // e.g. "ORD-0012"
  orderStartDate?: Date | null;
  orderEndDate?: Date | null;
  lineItems: Array<{
    id: string;
    description: string;
    quantity: number | string;
    rate: number | string;
    amount: number | string;
  }>;
  notes: string | null;
  paymentMethod?: string | null;
  transactionId?: string | null;
}

function fmt(n: number | string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(n));
}

function fmtDate(d: Date | string | null | undefined) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(d));
}

function fmtShort(d: Date | string | null | undefined) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(d));
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
  orderNumber,
  orderStartDate,
  orderEndDate,
  lineItems,
  notes,
  paymentMethod,
  transactionId,
}: InvoiceDocumentProps) {
  const total = lineItems.reduce((sum, item) => sum + Number(item.amount), 0);
  const billToName = billingName || clientFullName || clientEmail;
  const displayEmail = billingEmail || clientEmail;

  return (
    <div id="invoice-document" className="invoice-doc">

      {/* ── HEADER ── */}
      <div className="invoice-header">
        {/* Left: Logo + Address */}
        <div className="invoice-header-left">
          <div className="invoice-logo-row">
            <img src="/logo.png" alt="ReachLogic" style={{ height: 36, width: "auto" }} />
          </div>
          <div className="invoice-address-block">
            1st Floor, Afroza Tower, Uposhohor<br />
            Newmarket, Rajshahi 6202, BD<br />
            Email: hello@reachlogic.net<br />
            WhatsApp: +880 1975 646536
          </div>
        </div>

        {/* Right: Invoice label + number */}
        <div className="invoice-header-right">
          <h1 className="invoice-title">Invoice</h1>
          <div className="invoice-number">{invoiceNumber}</div>
        </div>
      </div>

      {/* Green accent stripe */}
      <div className="invoice-header-accent" />

      {/* ── BODY ── */}
      <div className="invoice-body">

        {/* Bill To + Meta */}
        <div className="invoice-grid">
          {/* Bill To */}
          <div>
            <div className="invoice-bill-label" style={{ color: "#0a8c6a" }}>Bill To</div>
            <div className="invoice-bill-name" style={{ color: "#0d0d0d" }}>{billToName}</div>
            <div className="invoice-bill-detail" style={{ color: "#6b6b6b" }}>
              {billingCompany && <div>{billingCompany}</div>}
              {billingAddress
                ? billingAddress.split("\n").map((line, i) => <div key={i}>{line}</div>)
                : (
                  <>
                    <div>[Street address]</div>
                    <div>[City, State ZIP], United States</div>
                  </>
                )}
              <div>{displayEmail}</div>
            </div>
          </div>

          {/* Invoice meta */}
          <div style={{ paddingTop: 4 }}>
            <table className="invoice-meta-table">
              <tbody>
                <tr>
                  <td style={{ color: "#6b6b6b" }}>Invoice Date</td>
                  <td style={{ color: "#0d0d0d" }}>{fmtDate(createdAt)}</td>
                </tr>
                <tr>
                  <td style={{ color: "#6b6b6b" }}>Due Date</td>
                  <td style={{ color: "#0d0d0d" }}>{fmtDate(dueDate)}</td>
                </tr>
                {isPaid && paidAt && (
                  <tr>
                    <td style={{ color: "#6b6b6b" }}>Paid On</td>
                    <td style={{ color: "#0d0d0d" }}>{fmtDate(paidAt)}</td>
                  </tr>
                )}
                {orderNumber && (
                  <tr>
                    <td style={{ color: "#6b6b6b" }}>Order No.</td>
                    <td style={{ color: "var(--brand-accent)" }}>{orderNumber}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── LINE ITEMS TABLE ── */}
        <table className="invoice-table">
          <thead>
            <tr>
              <th style={{ color: "#042f28" }}>Project Title / Description</th>
              <th style={{ color: "#042f28" }}>QTY</th>
              <th style={{ color: "#042f28" }}>Rate</th>
              <th style={{ color: "#042f28" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <span className="invoice-item-title" style={{ color: "#0d0d0d" }}>{item.description}</span>
                  {(orderStartDate || orderEndDate) && (
                    <span className="invoice-item-sub" style={{ color: "#6b6b6b" }}>
                      As discussed · {fmtShort(orderStartDate)} to {fmtShort(orderEndDate)}
                    </span>
                  )}
                </td>
                <td style={{ color: "#0d0d0d" }}>{Number(item.quantity)}</td>
                <td style={{ color: "#0d0d0d" }}>{fmt(item.rate)}</td>
                <td style={{ fontWeight: 600, color: "#0d0d0d" }}>{fmt(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── TOTALS ── */}
        <div className="invoice-totals-row">
          {/* Totals block */}
          <div className="invoice-totals-right">
            <div className="invoice-total-block" style={{ color: "#fff" }}>
              <span>Total (USD)</span>
              <span className="invoice-total-amount">{fmt(total)}</span>
            </div>
            {isPaid && (
              <>
                <div className="invoice-totals-sub-row">
                  <span className="invoice-totals-sub-paid" style={{ color: "#0a8c6a" }}>Amount Paid</span>
                  <span className="invoice-totals-sub-paid" style={{ color: "#0a8c6a" }}>{fmt(total)}</span>
                </div>
                <div className="invoice-totals-sub-row">
                  <span className="invoice-totals-sub-due" style={{ color: "#2a2a2a" }}>Balance Due</span>
                  <span className="invoice-totals-sub-due" style={{ color: "#2a2a2a" }}>{fmt(0)}</span>
                </div>
              </>
            )}
            {!isPaid && (
              <div className="invoice-totals-sub-row">
                <span className="invoice-totals-sub-due" style={{ color: "#2a2a2a" }}>Balance Due</span>
                <span style={{ fontWeight: 600, color: "var(--neutral-900)" }}>{fmt(total)}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── BOTTOM CARDS ── */}
        <div className="invoice-bottom-cards">
          {/* Note */}
          <div className="invoice-card">
            <div className="invoice-card-label">Note</div>
            <p className="invoice-note-text">
              {notes || (isPaid ? "Thank you for the payment." : "Payment is due by the date above.")}
            </p>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="invoice-footer">
          <span className="invoice-footer-left">Thank you for your business</span>
          <span className="invoice-footer-right">reachlogic.net</span>
        </div>

      </div>
    </div>
  );
}
