// src/app/(portal)/portal/client/invoices/[id]/page.tsx
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Calendar, CheckCircle2 } from "lucide-react";
import DownloadPdfButton from "@/components/portal/DownloadPdfButton";

export const metadata = { title: "Invoice Details" };

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}
function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(d));
}

export default async function ClientInvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/portal/login");
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      client: { select: { fullName: true, email: true } },
      order: { select: { id: true, serviceTitle: true } },
      lineItems: true,
    },
  });

  if (!invoice || invoice.clientId !== session.user.id) notFound();

  const total = invoice.lineItems.reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <div className="portal-page">
      <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }} data-html2canvas-ignore="true">
        <Link href="/portal/client/invoices" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, color: "var(--neutral-500)", textDecoration: "none" }}>
          <ArrowLeft size={14} /> Back to Invoices
        </Link>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {invoice.isPaid ? (
            <span className="badge badge-paid" style={{ padding: "6px 12px", fontSize: 14 }}>
              <CheckCircle2 size={16} /> Paid on {invoice.paidAt ? fmtDate(invoice.paidAt) : ""}
            </span>
          ) : (
            <span className="badge badge-unpaid" style={{ padding: "6px 12px", fontSize: 14 }}>Unpaid</span>
          )}
          <DownloadPdfButton targetId="invoice-document" filename={`Invoice_${invoice.invoiceNumber}.pdf`} invoiceId={invoice.id} />
        </div>
      </div>

      {/* The Printable Invoice Document */}
      <div id="invoice-document" className="invoice-doc card" style={{ padding: 40 }}>
        {/* Invoice Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--brand-dark)", letterSpacing: "-0.02em", margin: 0 }}>ReachLogic</h1>
            <div style={{ color: "var(--neutral-500)", fontSize: 13, marginTop: 4 }}>
              hello@reachlogic.net<br />
              www.reachlogic.net
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--neutral-900)", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Invoice</h2>
            <div style={{ fontSize: 15, color: "var(--neutral-600)", marginTop: 4 }}>#{invoice.invoiceNumber}</div>
          </div>
        </div>

        {/* From / To Section */}
        <div className="grid-2" style={{ marginBottom: 40, gap: 40 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--neutral-400)", textTransform: "uppercase", marginBottom: 8 }}>Bill To:</div>
            <div style={{ fontSize: 15, color: "var(--neutral-900)", lineHeight: 1.5 }}>
              {invoice.billingName ? <strong style={{ display: "block" }}>{invoice.billingName}</strong> : <strong style={{ display: "block" }}>{invoice.client.fullName ?? invoice.client.email}</strong>}
              {invoice.billingCompany && <div style={{ color: "var(--neutral-700)" }}>{invoice.billingCompany}</div>}
              {invoice.billingEmail && <div style={{ color: "var(--neutral-600)" }}>{invoice.billingEmail}</div>}
              {invoice.billingAddress && <div style={{ color: "var(--neutral-600)", whiteSpace: "pre-wrap", marginTop: 4 }}>{invoice.billingAddress}</div>}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "var(--neutral-500)", fontWeight: 500 }}>Issue Date:</span>
              <span style={{ fontSize: 14, color: "var(--neutral-900)", fontWeight: 500 }}>{fmtDate(invoice.createdAt)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "var(--neutral-500)", fontWeight: 500 }}>Due Date:</span>
              <span style={{ fontSize: 14, color: "var(--neutral-900)", fontWeight: 500 }}>{fmtDate(invoice.dueDate)}</span>
            </div>
            {invoice.order && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "var(--neutral-500)", fontWeight: 500 }}>Project:</span>
                <span style={{ fontSize: 14, color: "var(--neutral-900)", fontWeight: 500 }}>{invoice.order.serviceTitle}</span>
              </div>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div style={{ marginBottom: 40 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--neutral-200)" }}>
                <th style={{ textAlign: "left", padding: "12px 0", fontSize: 13, color: "var(--neutral-500)", textTransform: "uppercase" }}>Description</th>
                <th style={{ textAlign: "right", padding: "12px 0", fontSize: 13, color: "var(--neutral-500)", textTransform: "uppercase" }}>Qty</th>
                <th style={{ textAlign: "right", padding: "12px 0", fontSize: 13, color: "var(--neutral-500)", textTransform: "uppercase", width: 100 }}>Rate</th>
                <th style={{ textAlign: "right", padding: "12px 0", fontSize: 13, color: "var(--neutral-500)", textTransform: "uppercase", width: 100 }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid var(--neutral-100)" }}>
                  <td style={{ padding: "16px 0", fontSize: 14, color: "var(--neutral-900)", fontWeight: 500 }}>{item.description}</td>
                  <td style={{ textAlign: "right", padding: "16px 0", fontSize: 14, color: "var(--neutral-600)" }}>{Number(item.quantity)}</td>
                  <td style={{ textAlign: "right", padding: "16px 0", fontSize: 14, color: "var(--neutral-600)" }}>{fmt(Number(item.rate))}</td>
                  <td style={{ textAlign: "right", padding: "16px 0", fontSize: 14, color: "var(--neutral-900)", fontWeight: 600 }}>{fmt(Number(item.amount))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Payment info */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 40 }}>
          <div style={{ width: 300 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--neutral-100)" }}>
              <span style={{ fontSize: 14, color: "var(--neutral-600)" }}>Subtotal</span>
              <span style={{ fontSize: 14, color: "var(--neutral-900)", fontWeight: 500 }}>{fmt(total)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", alignItems: "center" }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "var(--neutral-900)" }}>Total Due</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: "var(--brand-dark)" }}>{fmt(total)}</span>
            </div>

            {!invoice.isPaid && (
              <div style={{ marginTop: 24 }} data-html2canvas-ignore="true">
                <div style={{ fontSize: 13, color: "var(--neutral-500)", textAlign: "right" }}>
                  Please refer to your contract for payment instructions.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div style={{ borderTop: "1px solid var(--neutral-200)", paddingTop: 24 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--neutral-400)", textTransform: "uppercase", marginBottom: 8 }}>Notes</h3>
            <p style={{ fontSize: 14, color: "var(--neutral-700)", lineHeight: 1.6, whiteSpace: "pre-wrap", margin: 0 }}>{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
