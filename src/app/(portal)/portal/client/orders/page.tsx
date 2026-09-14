// src/app/(portal)/portal/client/orders/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ShoppingBag, Plus } from "lucide-react";

export const metadata = { title: "My Orders" };

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

export default async function ClientOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/portal/login");

  const orders = await prisma.order.findMany({
    where: { clientId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="portal-page">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">My Orders</h1>
          <p className="page-header-sub">{orders.length} total project{orders.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/portal/client/orders/new" className="btn btn-primary">
          <Plus size={14} /> Start New Project
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <ShoppingBag size={40} className="empty-state-icon" />
            <div className="empty-state-title">No orders yet</div>
            <p className="empty-state-text">Ready to get started? Create a new project request and we'll provide a quote.</p>
            <Link href="/portal/client/orders/new" className="btn btn-primary" style={{ marginTop: 8 }}>
              Start New Project
            </Link>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Requested On</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 500 }}>{order.serviceTitle}</td>
                  <td style={{ fontWeight: 500 }}>
                    {order.amount ? fmt(Number(order.amount)) : <span style={{ color: "var(--neutral-400)" }}>Awaiting Quote</span>}
                  </td>
                  <td><span className={statusColors[order.status]}>{statusLabels[order.status]}</span></td>
                  <td style={{ fontSize: 13, color: "var(--neutral-500)" }}>{fmtDate(order.createdAt)}</td>
                  <td style={{ textAlign: "right" }}>
                    <Link href={`/portal/client/orders/${order.id}`} className="btn btn-outline btn-sm">View</Link>
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
