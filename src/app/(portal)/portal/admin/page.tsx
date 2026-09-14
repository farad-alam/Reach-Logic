// src/app/(portal)/portal/admin/page.tsx — Super Admin Dashboard
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  Users,
  ShoppingBag,
  DollarSign,
  Clock,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

export const metadata = { title: "Dashboard" };

function fmt(amount: number | null | undefined) {
  if (!amount) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount));
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(d));
}

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

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/portal/login");

  // Stats
  const [
    totalClients,
    totalOrders,
    orders,
    paidInvoicesData,
    recentOrders,
    recentInvoices,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "CLIENT", isActive: true } }),
    prisma.order.count(),
    prisma.order.findMany({
      where: { amount: { not: null } },
      select: { amount: true },
    }),
    prisma.invoice.findMany({
      where: { isPaid: true },
      include: { lineItems: { select: { amount: true } } },
    }),
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { client: { select: { fullName: true, email: true } } },
    }),
    prisma.invoice.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { fullName: true, email: true } },
        lineItems: true,
      },
    }),
  ]);

  // Calculate totals
  const totalValue = orders.reduce((sum, o) => sum + Number(o.amount ?? 0), 0);
  const totalPaid = paidInvoicesData.reduce(
    (sum, inv) => sum + inv.lineItems.reduce((s, li) => s + Number(li.amount), 0),
    0
  );
  const totalDue = totalValue - totalPaid;

  // Invoice totals (sum line items)
  const invoicesWithTotals = recentInvoices.map((inv) => ({
    ...inv,
    total: inv.lineItems.reduce(
      (sum, item) => sum + Number(item.amount),
      0
    ),
  }));

  return (
    <div className="portal-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Dashboard</h1>
          <p className="page-header-sub">Overview of your business</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/portal/admin/clients/invite" className="btn btn-outline btn-sm">
            + Invite Client
          </Link>
          <Link href="/portal/admin/orders" className="btn btn-primary btn-sm">
            View All Orders
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div className="stat-card-label">Total Clients</div>
              <div className="stat-card-value">{totalClients}</div>
            </div>
            <div style={{ background: "var(--neutral-100)", padding: 10, borderRadius: 8 }}>
              <Users size={18} color="var(--neutral-600)" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div className="stat-card-label">Total Orders</div>
              <div className="stat-card-value">{totalOrders}</div>
            </div>
            <div style={{ background: "var(--neutral-100)", padding: 10, borderRadius: 8 }}>
              <ShoppingBag size={18} color="var(--neutral-600)" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div className="stat-card-label">Total Paid</div>
              <div className="stat-card-value" style={{ color: "var(--success)", fontSize: 22 }}>
                {fmt(totalPaid)}
              </div>
            </div>
            <div style={{ background: "#dcfce7", padding: 10, borderRadius: 8 }}>
              <TrendingUp size={18} color="var(--success)" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div className="stat-card-label">Amount Due</div>
              <div className="stat-card-value" style={{ color: totalDue > 0 ? "var(--warning)" : "inherit", fontSize: 22 }}>
                {fmt(totalDue)}
              </div>
            </div>
            <div style={{ background: "#fef3c7", padding: 10, borderRadius: 8 }}>
              <Clock size={18} color="var(--warning)" />
            </div>
          </div>
        </div>
      </div>

      {/* Two-column: Recent Orders + Recent Invoices */}
      <div className="grid-2">
        {/* Recent Orders */}
        <div className="card card-sm" style={{ padding: 0 }}>
          <div style={{ padding: "18px 20px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--neutral-100)" }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: "var(--neutral-900)" }}>Recent Orders</span>
            <Link href="/portal/admin/orders" style={{ fontSize: 12, color: "var(--brand-accent)", textDecoration: "none", display: "flex", alignItems: "center", gap: 2 }}>
              View all <ChevronRight size={12} />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="empty-state" style={{ padding: "32px 20px" }}>
              <ShoppingBag size={28} color="var(--neutral-300)" />
              <span style={{ fontSize: 13, color: "var(--neutral-400)" }}>No orders yet</span>
            </div>
          ) : (
            <div>
              {recentOrders.map((order) => (
                <Link key={order.id} href={`/portal/admin/orders/${order.id}`}
                  style={{ display: "flex", alignItems: "center", padding: "12px 20px", gap: 12, textDecoration: "none", borderBottom: "1px solid var(--neutral-50)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-50)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--neutral-900)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {order.serviceTitle}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--neutral-500)", marginTop: 1 }}>
                      {order.client.fullName ?? order.client.email}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <span className={statusColors[order.status]}>
                      {statusLabels[order.status]}
                    </span>
                    {order.amount && (
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--neutral-700)" }}>
                        {fmt(Number(order.amount))}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Invoices */}
        <div className="card card-sm" style={{ padding: 0 }}>
          <div style={{ padding: "18px 20px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--neutral-100)" }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: "var(--neutral-900)" }}>Recent Invoices</span>
            <Link href="/portal/admin/invoices" style={{ fontSize: 12, color: "var(--brand-accent)", textDecoration: "none", display: "flex", alignItems: "center", gap: 2 }}>
              View all <ChevronRight size={12} />
            </Link>
          </div>
          {invoicesWithTotals.length === 0 ? (
            <div className="empty-state" style={{ padding: "32px 20px" }}>
              <DollarSign size={28} color="var(--neutral-300)" />
              <span style={{ fontSize: 13, color: "var(--neutral-400)" }}>No invoices yet</span>
            </div>
          ) : (
            <div>
              {invoicesWithTotals.map((inv) => (
                <Link key={inv.id} href={`/portal/admin/invoices/${inv.id}`}
                  style={{ display: "flex", alignItems: "center", padding: "12px 20px", gap: 12, textDecoration: "none", borderBottom: "1px solid var(--neutral-50)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-50)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--neutral-900)" }}>
                      {inv.invoiceNumber}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--neutral-500)", marginTop: 1 }}>
                      {inv.client.fullName ?? inv.client.email} · Due {formatDate(inv.dueDate)}
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
