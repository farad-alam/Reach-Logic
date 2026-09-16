// src/app/(portal)/portal/client/invoices/[id]/page.tsx
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Calendar, CheckCircle2 } from "lucide-react";

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
      order: { select: { id: true, serviceTitle: true } },
      lineItems: true,
    },
  });

  if (!invoice || invoice.clientId !== session.user.id) notFound();

  const total = invoice.lineItems.reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <div className="portal-page">
      <div style={{ marginBottom: 20 }}>
        <Link href="/portal/client/invoices" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, color: "var(--neutral-500)", textDecoration: "none" }}>
          <ArrowLeft size={14} /> Back to Invoices
        </Link>
      </div>

      <div className="page-header" style={{ alignItems: "center" }}>
        <div>
          <h1 className="page-header-title">Invoice {invoice.invoiceNumber}</h1>
          <p className="page-header-sub">Issued on {fmtDate(invoice.createdAt)}</p>
        </div>
        <div>
          {invoice.isPaid ? (
            <span className="badge badge-paid" style={{ padding: "6px 12px", fontSize: 14 }}>
              <CheckCircle2 size={16} /> Paid on {invoice.paidAt ? fmtDate(invoice.paidAt) : ""}
            </span>
          ) : (
            <span className="badge badge-unpaid" style={{ padding: "6px 12px", fontSize: 14 }}>Unpaid</span>
          )}
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--neutral-500)", textTransform: "uppercase", marginBottom: 8 }}>Project</div>
          {invoice.order ? (
            <Link href={`/portal/client/orders/${invoice.orderId}`} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, color: "var(--brand-accent)", fontWeight: 500, textDecoration: "none" }}>
              {invoice.order.serviceTitle}
            </Link>
          ) : (
            <span style={{ fontSize: 15, color: "var(--neutral-400)" }}>—</span>
          )}
        </div>
        <div className="card">
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--neutral-500)", textTransform: "uppercase", marginBottom: 8 }}>Due Date</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, color: "var(--neutral-900)", fontWeight: 500 }}>
            <Calendar size={16} color="var(--neutral-400)" /> {fmtDate(invoice.dueDate)}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--neutral-100)" }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--neutral-900)" }}>Invoice Summary</h3>
        </div>
        
        <table className="portal-table">
          <thead>
            <tr>
              <th>Description</th>
              <th style={{ textAlign: "right" }}>Qty</th>
              <th style={{ textAlign: "right" }}>Rate</th>
              <th style={{ textAlign: "right" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((item) => (
              <tr key={item.id}>
                <td style={{ fontWeight: 500 }}>{item.description}</td>
                <td style={{ textAlign: "right", color: "var(--neutral-600)" }}>{Number(item.quantity)}</td>
                <td style={{ textAlign: "right", color: "var(--neutral-600)" }}>{fmt(Number(item.rate))}</td>
                <td style={{ textAlign: "right", fontWeight: 600 }}>{fmt(Number(item.amount))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div style={{ padding: "20px 24px", background: "var(--neutral-50)", display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: 300 }}>
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
               <span style={{ fontSize: 16, fontWeight: 600, color: "var(--neutral-900)" }}>Total Due</span>
               <span style={{ fontSize: 24, fontWeight: 700, color: "var(--neutral-900)" }}>{fmt(total)}</span>
             </div>
             
             {!invoice.isPaid && (
                <div style={{ marginTop: 24 }}>
                   {/* In a real implementation, a checkout button or payment instructions go here */}
                   <div style={{ fontSize: 13, color: "var(--neutral-500)", textAlign: "right" }}>
                     Please refer to your contract for payment instructions.
                   </div>
                </div>
             )}
          </div>
        </div>
      </div>

      {invoice.notes && (
        <div className="card" style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--neutral-900)", marginBottom: 12 }}>Notes</h3>
          <p style={{ fontSize: 14, color: "var(--neutral-600)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{invoice.notes}</p>
        </div>
      )}
    </div>
  );
}
