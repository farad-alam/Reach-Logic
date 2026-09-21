// src/app/(portal)/portal/client/invoices/[id]/page.tsx
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Calendar, CheckCircle2 } from "lucide-react";
import DownloadPdfButton from "@/components/portal/DownloadPdfButton";
import InvoiceDocument from "@/components/portal/InvoiceDocument";

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
      <InvoiceDocument
        invoiceNumber={invoice.invoiceNumber}
        createdAt={invoice.createdAt}
        dueDate={invoice.dueDate}
        paidAt={invoice.paidAt}
        isPaid={invoice.isPaid}
        billingName={invoice.billingName}
        billingEmail={invoice.billingEmail}
        billingCompany={invoice.billingCompany}
        billingAddress={invoice.billingAddress}
        clientFullName={invoice.client.fullName}
        clientEmail={invoice.client.email}
        orderServiceTitle={invoice.order?.serviceTitle ?? null}
        lineItems={invoice.lineItems.map(item => ({
          id: item.id,
          description: item.description,
          quantity: Number(item.quantity),
          rate: Number(item.rate),
          amount: Number(item.amount),
        }))}
        notes={invoice.notes}
      />
    </div>
  );
}
