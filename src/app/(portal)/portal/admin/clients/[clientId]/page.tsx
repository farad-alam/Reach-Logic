// src/app/(portal)/portal/admin/clients/[clientId]/page.tsx
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  ArrowLeft, Mail, Calendar, ShoppingBag, FileText,
  MessageSquare, UserCheck, UserX, DollarSign, ChevronRight,
} from "lucide-react";
import CreateOrderForm from "./CreateOrderForm";

export const metadata = { title: "Client Detail" };

const statusColors: Record<string, string> = {
  AWAITING_QUOTE: "badge badge-awaiting",
  PENDING: "badge badge-pending",
  IN_PROGRESS: "badge badge-progress",
  COMPLETED: "badge badge-completed",
  CANCELLED: "badge badge-cancelled",
};
const statusLabels: Record<string, string> = {
  AWAITING_QUOTE: "Awaiting Quote",
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}
function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(d));
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/portal/login");
  const { clientId } = await params;

  const client = await prisma.user.findUnique({
    where: { id: clientId, role: "CLIENT" },
    select: {
      id: true,
      fullName: true,
      email: true,
      avatarUrl: true,
      isActive: true,
      createdAt: true,
      clientOrders: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          serviceTitle: true,
          status: true,
          amount: true,
          createdAt: true,
        },
      },
      clientInvoices: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { lineItems: { select: { amount: true } } },
      },
      clientThread: { select: { id: true } },
    },
  });

  if (!client) notFound();

  const totalValue = client.clientOrders.reduce((s, o) => s + Number(o.amount ?? 0), 0);
  const totalPaidInvoices = client.clientInvoices
    .filter((inv) => inv.isPaid)
    .reduce((s, inv) => s + inv.lineItems.reduce((ls, li) => ls + Number(li.amount), 0), 0);

  const initials = client.fullName
    ? client.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : client.email[0].toUpperCase();

  return (
    <div className="portal-page">
      {/* Back */}
      <Link
        href="/portal/admin/clients"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--neutral-500)", fontSize: 13, textDecoration: "none", marginBottom: 18 }}
      >
        <ArrowLeft size={14} /> Back to Clients
      </Link>

      {/* Header */}
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            background: "var(--brand-dark)", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 700, flexShrink: 0, overflow: "hidden",
          }}>
            {client.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={client.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : initials}
          </div>
          <div>
            <h1 className="page-header-title" style={{ marginBottom: 2 }}>
              {client.fullName ?? "—"}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "var(--neutral-500)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Mail size={12} /> {client.email}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Calendar size={12} /> Joined {fmtDate(client.createdAt)}
              </span>
              <span className={client.isActive ? "badge badge-completed" : "badge badge-cancelled"}>
                {client.isActive ? <><UserCheck size={11} /> Active</> : <><UserX size={11} /> Inactive</>}
              </span>
            </div>
          </div>
        </div>

        {/* Quick action buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <Link
            href={`/portal/admin/messages/${clientId}`}
            className="btn btn-outline btn-sm"
          >
            <MessageSquare size={13} /> Message
          </Link>
          <Link
            href={`/portal/admin/invoices/new?clientId=${clientId}`}
            className="btn btn-outline btn-sm"
          >
            <FileText size={13} /> New Invoice
          </Link>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-card-label">Total Orders</div>
          <div className="stat-card-value">{client.clientOrders.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Active Orders</div>
          <div className="stat-card-value">
            {client.clientOrders.filter((o) => o.status === "IN_PROGRESS" || o.status === "PENDING").length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Total Value</div>
          <div className="stat-card-value" style={{ fontSize: 20 }}>{totalValue > 0 ? fmt(totalValue) : "—"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Total Paid</div>
          <div className="stat-card-value" style={{ fontSize: 20, color: "var(--success)" }}>
            {totalPaidInvoices > 0 ? fmt(totalPaidInvoices) : "—"}
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        {/* Left: Orders */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Orders list */}
          <div className="card card-sm" style={{ padding: 0 }}>
            <div style={{ padding: "16px 18px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--neutral-100)" }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: "var(--neutral-900)", display: "flex", alignItems: "center", gap: 6 }}>
                <ShoppingBag size={14} /> Orders
              </span>
              <Link href="/portal/admin/orders" style={{ fontSize: 12, color: "var(--brand-accent)", textDecoration: "none", display: "flex", alignItems: "center", gap: 2 }}>
                View all <ChevronRight size={12} />
              </Link>
            </div>

            {client.clientOrders.length === 0 ? (
              <div style={{ padding: "28px 18px", textAlign: "center", color: "var(--neutral-400)", fontSize: 13 }}>
                No orders yet
              </div>
            ) : (
              client.clientOrders.map((order, i) => (
                <Link
                  key={order.id}
                  href={`/portal/admin/orders/${order.id}`}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 18px", textDecoration: "none",
                    borderBottom: i < client.clientOrders.length - 1 ? "1px solid var(--neutral-50)" : "none",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-50)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--neutral-900)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {order.serviceTitle}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--neutral-400)", marginTop: 1 }}>{fmtDate(order.createdAt)}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
                    <span className={statusColors[order.status]}>{statusLabels[order.status]}</span>
                    {order.amount && <span style={{ fontSize: 12, fontWeight: 600, color: "var(--neutral-700)" }}>{fmt(Number(order.amount))}</span>}
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Invoices */}
          <div className="card card-sm" style={{ padding: 0 }}>
            <div style={{ padding: "16px 18px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--neutral-100)" }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: "var(--neutral-900)", display: "flex", alignItems: "center", gap: 6 }}>
                <DollarSign size={14} /> Invoices
              </span>
              <Link href="/portal/admin/invoices" style={{ fontSize: 12, color: "var(--brand-accent)", textDecoration: "none", display: "flex", alignItems: "center", gap: 2 }}>
                View all <ChevronRight size={12} />
              </Link>
            </div>
            {client.clientInvoices.length === 0 ? (
              <div style={{ padding: "28px 18px", textAlign: "center", color: "var(--neutral-400)", fontSize: 13 }}>
                No invoices yet
              </div>
            ) : (
              client.clientInvoices.map((inv, i) => {
                const total = inv.lineItems.reduce((s, li) => s + Number(li.amount), 0);
                return (
                  <Link
                    key={inv.id}
                    href={`/portal/admin/invoices/${inv.id}`}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 18px", textDecoration: "none",
                      borderBottom: i < client.clientInvoices.length - 1 ? "1px solid var(--neutral-50)" : "none",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-50)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--neutral-900)" }}>{inv.invoiceNumber}</div>
                      <div style={{ fontSize: 12, color: "var(--neutral-400)", marginTop: 1 }}>Due {fmtDate(inv.dueDate)}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
                      <span className={inv.isPaid ? "badge badge-paid" : "badge badge-unpaid"}>{inv.isPaid ? "Paid" : "Unpaid"}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--neutral-700)" }}>{fmt(total)}</span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Create Order form */}
        <div>
          <div className="card card-sm">
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--neutral-900)", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
              <ShoppingBag size={14} /> Create Order for {client.fullName ?? client.email}
            </h2>
            <CreateOrderForm clientId={client.id} clientName={client.fullName ?? client.email} />
          </div>
        </div>
      </div>
    </div>
  );
}
