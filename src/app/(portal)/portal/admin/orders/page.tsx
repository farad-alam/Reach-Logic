// src/app/(portal)/portal/admin/orders/page.tsx — All orders
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export const metadata = { title: "Orders" };

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

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/portal/login");

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { fullName: true, email: true } },
      createdBy: { select: { fullName: true, role: true } },
    },
  });

  return (
    <div className="portal-page">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Orders</h1>
          <p className="page-header-sub">{orders.length} total order{orders.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/portal/admin/orders/new" className="btn btn-primary">
          + New Order
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <ShoppingBag size={40} className="empty-state-icon" />
            <div className="empty-state-title">No orders yet</div>
            <p className="empty-state-text">Orders will appear here when clients or you create them.</p>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Client</th>
                <th>Created By</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 500 }}>{order.serviceTitle}</td>
                  <td style={{ color: "var(--neutral-600)" }}>
                    <Link href={`/portal/admin/clients/${order.clientId}`} style={{ color: "var(--brand-accent)", textDecoration: "none", fontWeight: 500 }}>
                      {order.client.fullName ?? order.client.email}
                    </Link>
                  </td>
                  <td style={{ fontSize: 12, color: "var(--neutral-500)" }}>
                    {order.createdBy.role === "CLIENT" ? "Client" : "Admin"}
                  </td>
                  <td style={{ fontWeight: 500 }}>
                    {order.amount ? fmt(Number(order.amount)) : <span style={{ color: "var(--neutral-400)" }}>Not quoted</span>}
                  </td>
                  <td><span className={statusColors[order.status]}>{statusLabels[order.status]}</span></td>
                  <td style={{ fontSize: 13, color: "var(--neutral-500)" }}>{fmtDate(order.createdAt)}</td>
                  <td style={{ textAlign: "right" }}>
                    <Link href={`/portal/admin/orders/${order.id}`} className="btn btn-outline btn-sm">Manage</Link>
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
