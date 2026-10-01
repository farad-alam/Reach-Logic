// src/app/(portal)/portal/admin/invoices/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { FileText, Plus, CheckCircle2 } from "lucide-react";
import InvoiceManageDropdown from "./InvoiceManageDropdown";

export const metadata = { title: "Invoices" };

function fmt(n: number | null | undefined, currency: string = "USD") {
  if (n === null || n === undefined) return "—";
  if (currency === "BDT") return `৳${Number(n).toFixed(2)}`;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function fmtDate(d: Date | null | undefined) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(d));
}

export default async function AdminInvoicesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/portal/login");

  // Fetch Main Invoices
  const mainInvoicesRaw = await prisma.invoice.findMany({
    where: { 
      deletedAt: null,
      invoiceStatus: { in: ["ACTIVE", "PARTIALLY_REFUNDED"] }
    },
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { fullName: true, email: true } },
      order: { select: { serviceTitle: true } },
      lineItems: true,
    },
  });

  const mainInvoices = mainInvoicesRaw.map((inv) => ({
    ...inv,
    total: inv.lineItems.reduce((sum, item) => sum + Number(item.amount), 0),
  }));

  const unpaidCount = mainInvoices.filter((i) => !i.isPaid).length;

  // Fetch RVG Invoices
  const rvgInvoices = await prisma.invoice.findMany({
    where: { 
      deletedAt: null,
      invoiceStatus: { in: ["VOID", "SYSTEM_GLITCH", "REFUNDED", "PARTIALLY_REFUNDED"] }
    },
    orderBy: { actionDate: "desc" },
    include: {
      client: { select: { fullName: true, email: true } },
      order: { select: { serviceTitle: true } },
      lineItems: true,
    },
  });

  return (
    <div className="portal-page">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Invoices</h1>
          <p className="page-header-sub">
            All client invoices. Invoices are never deleted: refunded, voided and system glitch invoices move to the section below.
            {unpaidCount > 0 && <span style={{ color: "#ea580c" }}> · {unpaidCount} unpaid</span>}
          </p>
        </div>
        <Link href="/portal/admin/invoices/new" className="btn btn-primary">
          <Plus size={14} /> Create Invoice
        </Link>
      </div>

      {mainInvoices.length === 0 && rvgInvoices.length === 0 ? (
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
        <>
          {mainInvoices.length > 0 && (
            <div style={{ borderRadius: 10, border: "1px solid var(--neutral-200)", overflow: "hidden", background: "#fff", marginBottom: 40 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#fafafa", borderBottom: "1px solid var(--neutral-200)" }}>
                    <th style={thStyle}>Invoice</th>
                    <th style={thStyle}>Client</th>
                    <th style={thStyle}>Project</th>
                    <th style={thStyle}>Total Amount</th>
                    <th style={thStyle}>Due Date</th>
                    <th style={thStyle}>Paid</th>
                    <th style={thStyle}>Due</th>
                    <th style={thStyle}>Status</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mainInvoices.map((inv) => {
                    const amountPaid = inv.isPaid ? inv.total : Number(inv.amountPaid || 0);
                    const amountDue = Math.max(0, inv.total - amountPaid);
                    const isPartiallyPaid = !inv.isPaid && amountPaid > 0;

                    return (
                      <tr key={inv.id} style={{ borderBottom: "1px solid #f3f4f6", fontSize: 13 }}>
                        <td style={{ ...tdStyle, fontWeight: 700, color: "#111827" }}>{inv.invoiceNumber}</td>
                        <td style={{ ...tdStyle, color: "#4b5563" }}>{inv.client?.fullName ?? inv.client?.email}</td>
                        <td style={{ ...tdStyle, color: "#4b5563" }}>{inv.order?.serviceTitle ?? "—"}</td>
                        <td style={{ ...tdStyle, fontWeight: 700, color: "#111827" }}>{fmt(inv.total, inv.currency)}</td>
                        <td style={{ ...tdStyle, color: "#6b7280" }}>{fmtDate(inv.dueDate)}</td>
                        <td style={{ ...tdStyle, fontWeight: 700, color: "#16a34a" }}>{fmt(amountPaid, inv.currency)}</td>
                        <td style={{ ...tdStyle, fontWeight: 700, color: amountDue > 0 ? "#ea580c" : "#6b7280" }}>{fmt(amountDue, inv.currency)}</td>
                        <td style={tdStyle}>
                          {inv.invoiceStatus === "PARTIALLY_REFUNDED" ? (
                            <span style={badgeStyle("#fef3c7", "#b45309")}>Partially Refunded</span>
                          ) : inv.isPaid ? (
                            <span style={badgeStyle("#dcfce7", "#16a34a")}>
                              <CheckCircle2 size={11} /> Paid
                            </span>
                          ) : isPartiallyPaid ? (
                            <span style={badgeStyle("#dbeafe", "#1d4ed8")}>◉ Partially Paid</span>
                          ) : (
                            <span style={badgeStyle("#fef3c7", "#d97706")}>⊙ Unpaid</span>
                          )}
                        </td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>
                          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", alignItems: "center" }}>
                            <Link
                              href={`/portal/admin/invoices/${inv.id}`}
                              className="btn btn-outline btn-sm"
                              style={{ fontSize: 13 }}>
                              View
                            </Link>
                            <InvoiceManageDropdown
                              invoiceId={inv.id}
                              isPaid={inv.isPaid}
                              isLocked={inv.isLocked}
                              invoiceNumber={inv.invoiceNumber}
                              amountPaid={amountPaid}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {rvgInvoices.length > 0 && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--neutral-900)", marginBottom: 4 }}>Refunds, Voids & System Glitches Invoices</h2>
              <p style={{ fontSize: 13, color: "var(--neutral-500)", marginBottom: 16 }}>These invoices keep their number for audit records. Voids and system glitches are excluded from totals.</p>
              <div style={{ borderRadius: 10, border: "1px solid var(--neutral-200)", overflow: "hidden", background: "#fff" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#fafafa", borderBottom: "1px solid var(--neutral-200)" }}>
                      <th style={thStyle}>Invoice</th>
                      <th style={thStyle}>Client</th>
                      <th style={thStyle}>Project</th>
                      <th style={thStyle}>Type</th>
                      <th style={thStyle}>Invoice Amount</th>
                      <th style={thStyle}>Refunded</th>
                      <th style={thStyle}>Date</th>
                      <th style={thStyle}>Reason</th>
                      <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rvgInvoices.map((inv) => {
                      const total = inv.lineItems.reduce((sum, item) => sum + Number(item.amount), 0);
                      const isRefund = inv.invoiceStatus === "REFUNDED" || inv.invoiceStatus === "PARTIALLY_REFUNDED";
                      
                      let typeBadge: React.ReactNode;
                      if (inv.invoiceStatus === "REFUNDED") typeBadge = <span style={badgeStyle("#fee2e2", "#991b1b")}>Refund (Full)</span>;
                      else if (inv.invoiceStatus === "PARTIALLY_REFUNDED") typeBadge = <span style={badgeStyle("#fef3c7", "#b45309")}>Refund (Partial)</span>;
                      else if (inv.invoiceStatus === "VOID") typeBadge = <span style={badgeStyle("#f3f4f6", "#374151")}>Void</span>;
                      else if (inv.invoiceStatus === "SYSTEM_GLITCH") typeBadge = <span style={badgeStyle("#ede9fe", "#6d28d9")}>System Glitch</span>;

                      return (
                        <tr key={inv.id} style={{ borderBottom: "1px solid #f3f4f6", fontSize: 13 }}>
                          <td style={{ ...tdStyle, fontWeight: 700, color: "#111827" }}>{inv.invoiceNumber}</td>
                          <td style={{ ...tdStyle, color: "#4b5563" }}>{inv.client?.fullName ?? inv.client?.email}</td>
                          <td style={{ ...tdStyle, color: "#4b5563" }}>{inv.order?.serviceTitle ?? "—"}</td>
                          <td style={tdStyle}>{typeBadge}</td>
                          <td style={{ ...tdStyle, fontWeight: 700, color: "#111827" }}>{fmt(total, inv.currency)}</td>
                          <td style={{ ...tdStyle, fontWeight: 700, color: isRefund ? "#dc2626" : "#6b7280" }}>
                            {isRefund ? `−${fmt(Number(inv.refundAmount || 0), inv.currency)}` : fmt(0, inv.currency)}
                          </td>
                          <td style={{ ...tdStyle, color: "#6b7280" }}>{fmtDate(inv.actionDate)}</td>
                          <td style={{ ...tdStyle, color: "#6b7280", maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={inv.actionReason || ""}>
                            {inv.actionReason || "—"}
                          </td>
                          <td style={{ ...tdStyle, textAlign: "right" }}>
                            <Link href={`/portal/admin/invoices/${inv.id}`} className="btn btn-outline btn-sm" style={{ fontSize: 13 }}>View</Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "14px 20px",
  textAlign: "left",
  fontSize: 11,
  fontWeight: 700,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "14px 20px",
  verticalAlign: "middle",
};

function badgeStyle(bg: string, color: string): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    background: bg,
    color,
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    whiteSpace: "nowrap",
  };
}
