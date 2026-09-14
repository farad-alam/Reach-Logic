// src/app/(portal)/portal/admin/invoices/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { FileText, Plus, CheckCircle2 } from "lucide-react";

export const metadata = { title: "Invoices" };

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}
function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(d));
}

export default async function AdminInvoicesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/portal/login");

  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { fullName: true, email: true } },
      order: { select: { serviceTitle: true } },
      lineItems: true,
    },
  });

  const invoicesWithTotals = invoices.map((inv) => ({
    ...inv,
    total: inv.lineItems.reduce((sum, item) => sum + Number(item.amount), 0),
  }));

  const unpaidCount = invoicesWithTotals.filter((i) => !i.isPaid).length;

  return (
    <div className="portal-page">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Invoices</h1>
          <p className="page-header-sub">
            {invoices.length} total invoice{invoices.length !== 1 ? "s" : ""}
            {unpaidCount > 0 && <span style={{ color: "var(--warning)" }}> · {unpaidCount} unpaid</span>}
          </p>
        </div>
        <Link href="/portal/admin/invoices/new" className="btn btn-primary">
          <Plus size={14} /> Create Invoice
        </Link>
      </div>

      {invoicesWithTotals.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <FileText size={40} className="empty-state-icon" />
            <div className="empty-state-title">No invoices yet</div>
            <p className="empty-state-text">Create your first invoice for a project.</p>
            <Link href="/portal/admin/invoices/new" className="btn btn-primary" style={{ marginTop: 8 }}>
              Create Invoice
            </Link>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Client</th>
                <th>Project</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {invoicesWithTotals.map((inv) => (
                <tr key={inv.id}>
                  <td style={{ fontWeight: 600 }}>{inv.invoiceNumber}</td>
                  <td style={{ color: "var(--neutral-600)" }}>{inv.client.fullName ?? inv.client.email}</td>
                  <td style={{ color: "var(--neutral-600)" }}>{inv.order.serviceTitle}</td>
                  <td style={{ fontWeight: 500 }}>{fmt(inv.total)}</td>
                  <td style={{ fontSize: 13, color: "var(--neutral-500)" }}>{fmtDate(inv.dueDate)}</td>
                  <td>
                    {inv.isPaid ? (
                      <span className="badge badge-paid"><CheckCircle2 size={12} /> Paid</span>
                    ) : (
                      <span className="badge badge-unpaid">Unpaid</span>
                    )}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <Link href={`/portal/admin/invoices/${inv.id}`} className="btn btn-outline btn-sm">Manage</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
