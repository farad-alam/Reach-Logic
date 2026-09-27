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

// ReachLogic SVG logo mark (simplified white version)
function LogoMark() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="36" rx="8" fill="rgba(255,255,255,0.15)" />
      <path d="M10 10h8a6 6 0 0 1 6 6v0a6 6 0 0 1-6 6h-2l6 4" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="25" r="2" fill="var(--brand-light)" />
    </svg>
  );
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
            <LogoMark />
            <span className="invoice-logo-text">reachlogic</span>
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
            <div className="invoice-bill-label">Bill To</div>
            <div className="invoice-bill-name">{billToName}</div>
            <div className="invoice-bill-detail">
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
                  <td>Invoice Date</td>
                  <td>{fmtDate(createdAt)}</td>
                </tr>
                <tr>
                  <td>Due Date</td>
                  <td>{fmtDate(dueDate)}</td>
                </tr>
                {isPaid && paidAt && (
                  <tr>
                    <td>Paid On</td>
                    <td>{fmtDate(paidAt)}</td>
                  </tr>
                )}
                {orderNumber && (
                  <tr>
                    <td>Order No.</td>
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
              <th>Project Title / Description</th>
              <th>QTY</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <span className="invoice-item-title">{item.description}</span>
                  {(orderStartDate || orderEndDate) && (
                    <span className="invoice-item-sub">
                      As discussed · {fmtShort(orderStartDate)} to {fmtShort(orderEndDate)}
                    </span>
                  )}
                </td>
                <td>{Number(item.quantity)}</td>
                <td>{fmt(item.rate)}</td>
                <td style={{ fontWeight: 600 }}>{fmt(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── TOTALS + PAID STAMP ── */}
        <div className="invoice-totals-row">
          {/* PAID stamp (only when paid) */}
          {isPaid && paidAt && (
            <div className="invoice-paid-stamp">
              <div className="invoice-paid-stamp-text">PAID</div>
              <div className="invoice-paid-stamp-date">
                {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" })
                  .format(new Date(paidAt))
                  .toUpperCase()}
              </div>
            </div>
          )}

          {/* Totals block */}
          <div className="invoice-totals-right">
            <div className="invoice-total-block">
              <span>Total (USD)</span>
              <span className="invoice-total-amount">{fmt(total)}</span>
            </div>
            {isPaid && (
              <>
                <div className="invoice-totals-sub-row">
                  <span className="invoice-totals-sub-paid">Amount Paid</span>
                  <span className="invoice-totals-sub-paid">{fmt(total)}</span>
                </div>
                <div className="invoice-totals-sub-row">
                  <span className="invoice-totals-sub-due">Balance Due</span>
                  <span className="invoice-totals-sub-due">{fmt(0)}</span>
                </div>
              </>
            )}
            {!isPaid && (
              <div className="invoice-totals-sub-row">
                <span className="invoice-totals-sub-due">Balance Due</span>
                <span style={{ fontWeight: 600, color: "var(--neutral-900)" }}>{fmt(total)}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── BOTTOM CARDS ── */}
        <div className="invoice-bottom-cards">
          {/* Payment Details */}
          <div className="invoice-card">
            <div className="invoice-card-label">Payment Details</div>
            <div className="invoice-card-row">
              <span>Method</span>
              <span>{paymentMethod || "[Payment method]"}</span>
            </div>
            <div className="invoice-card-row">
              <span>Transaction ID</span>
              <span>{transactionId || "[Reference no.]"}</span>
            </div>
          </div>

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
