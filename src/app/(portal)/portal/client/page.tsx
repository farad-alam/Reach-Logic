// src/app/(portal)/portal/client/page.tsx — Client Dashboard
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ShoppingBag, FileText, Plus, ChevronRight, MessageSquare } from "lucide-react";

export const metadata = { title: "My Dashboard" };

const statusColors: Record<string, string> = {
  AWAITING_QUOTE: "badge badge-awaiting",
  PENDING: "badge badge-pending",
  IN_PROGRESS: "badge badge-progress",
  COMPLETED: "badge badge-completed",
  CANCELLED: "badge badge-cancelled",
};

const statusLabels: Record<string, string> = {
  AWAITING_QUOTE: "Awaiting Quote",
  PENDING: "Pending Start",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

function fmt(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}
function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(d));
}

export default async function ClientDashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/portal/login");

  const [orders, invoices, unreadMessages] = await Promise.all([
    prisma.order.findMany({
      where: { clientId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.invoice.findMany({
      where: { clientId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { lineItems: true },
    }),
    prisma.notification.count({
      where: { userId: session.user.id, type: "NEW_MESSAGE", isRead: false },
    }),
  ]);

  const activeOrders = await prisma.order.count({
    where: { clientId: session.user.id, status: { in: ["PENDING", "IN_PROGRESS"] } },
  });

  const unpaidInvoices = await prisma.invoice.count({
    where: { clientId: session.user.id, isPaid: false },
  });

  const invoicesWithTotals = invoices.map((inv) => ({
    ...inv,
    total: inv.lineItems.reduce((sum, item) => sum + Number(item.amount), 0),
  }));

  return (
    <div className="portal-page">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Welcome, {(session.user.name ?? "").split(" ")[0]}!</h1>
          <p className="page-header-sub">Here is the latest on your projects.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/portal/client/messages" className="btn btn-outline btn-sm" style={{ position: "relative" }}>
            <MessageSquare size={14} /> Messages
            {unreadMessages > 0 && <span className="notif-dot" style={{ top: -2, right: -2 }} />}
          </Link>
          <Link href="/portal/client/orders/new" className="btn btn-primary btn-sm">
            <Plus size={14} /> New Order
          </Link>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div className="stat-card-label">Active Orders</div>
              <div className="stat-card-value">{activeOrders}</div>
            </div>
            <div style={{ background: "var(--neutral-100)", padding: 10, borderRadius: 8 }}>
              <ShoppingBag size={18} color="var(--neutral-600)" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div className="stat-card-label">Unpaid Invoices</div>
              <div className="stat-card-value" style={{ color: unpaidInvoices > 0 ? "var(--warning)" : "inherit" }}>
                {unpaidInvoices}
              </div>
            </div>
            <div style={{ background: unpaidInvoices > 0 ? "#fef3c7" : "var(--neutral-100)", padding: 10, borderRadius: 8 }}>
              <FileText size={18} color={unpaidInvoices > 0 ? "var(--warning)" : "var(--neutral-600)"} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Recent Orders */}
        <div className="card card-sm" style={{ padding: 0 }}>
          <div style={{ padding: "18px 20px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--neutral-100)" }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: "var(--neutral-900)" }}>Your Orders</span>
            <Link href="/portal/client/orders" style={{ fontSize: 12, color: "var(--brand-accent)", textDecoration: "none", display: "flex", alignItems: "center", gap: 2 }}>
              View all <ChevronRight size={12} />
            </Link>
          </div>
          {orders.length === 0 ? (
            <div className="empty-state" style={{ padding: "32px 20px" }}>
              <ShoppingBag size={28} color="var(--neutral-300)" />
              <span style={{ fontSize: 13, color: "var(--neutral-400)", marginBottom: 12 }}>You have no orders yet</span>
              <Link href="/portal/client/orders/new" className="btn btn-outline btn-sm">Start a new order</Link>
            </div>
          ) : (
            <div>
              {orders.map((order) => (
                <Link key={order.id} href={`/portal/client/orders/${order.id}`}
                  style={{ display: "flex", alignItems: "center", padding: "12px 20px", gap: 12, textDecoration: "none", borderBottom: "1px solid var(--neutral-50)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-50)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--neutral-900)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {order.serviceTitle}
                    </div>
                  </div>
                  <span className={statusColors[order.status]}>{statusLabels[order.status]}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Invoices */}
        <div className="card card-sm" style={{ padding: 0 }}>
          <div style={{ padding: "18px 20px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--neutral-100)" }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: "var(--neutral-900)" }}>Recent Invoices</span>
            <Link href="/portal/client/invoices" style={{ fontSize: 12, color: "var(--brand-accent)", textDecoration: "none", display: "flex", alignItems: "center", gap: 2 }}>
              View all <ChevronRight size={12} />
            </Link>
          </div>
          {invoicesWithTotals.length === 0 ? (
            <div className="empty-state" style={{ padding: "32px 20px" }}>
              <FileText size={28} color="var(--neutral-300)" />
              <span style={{ fontSize: 13, color: "var(--neutral-400)" }}>No invoices yet</span>
            </div>
          ) : (
            <div>
              {invoicesWithTotals.map((inv) => (
                <Link key={inv.id} href={`/portal/client/invoices/${inv.id}`}
                  style={{ display: "flex", alignItems: "center", padding: "12px 20px", gap: 12, textDecoration: "none", borderBottom: "1px solid var(--neutral-50)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-50)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--neutral-900)" }}>
                      {inv.invoiceNumber}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--neutral-500)", marginTop: 1 }}>
                      Due {fmtDate(inv.dueDate)}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <span className={inv.isPaid ? "badge badge-paid" : "badge badge-unpaid"}>
                      {inv.isPaid ? "Paid" : "Unpaid"}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--neutral-700)" }}>
                      {fmt(inv.total)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
