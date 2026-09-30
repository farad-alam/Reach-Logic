import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Trash2, RefreshCcw, AlertTriangle } from "lucide-react";
import TrashActionButtons from "./TrashActionButtons";

export const metadata = { title: "Trash" };

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(d));
}

function getDaysRemaining(deletedAt: Date) {
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  const expirationDate = new Date(deletedAt.getTime() + thirtyDays);
  const diffTime = expirationDate.getTime() - Date.now();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export default async function AdminTrashPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/portal/login");

  // Fetch soft-deleted items
  const deletedOrders = await prisma.order.findMany({
    where: { deletedAt: { not: null } },
    include: { client: { select: { fullName: true, email: true } } },
    orderBy: { deletedAt: "desc" }
  });

  const deletedInvoices = await prisma.invoice.findMany({
    where: { deletedAt: { not: null } },
    include: { client: { select: { fullName: true, email: true } } },
    orderBy: { deletedAt: "desc" }
  });

  const deletedClients = await prisma.user.findMany({
    where: { deletedAt: { not: null }, role: "CLIENT" },
    orderBy: { deletedAt: "desc" }
  });

  const totalItems = deletedOrders.length + deletedInvoices.length + deletedClients.length;

  return (
    <div className="portal-page">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Trash</h1>
          <p className="page-header-sub">
            {totalItems} item{totalItems !== 1 ? "s" : ""} in trash. Items are automatically deleted after 30 days.
          </p>
        </div>
      </div>

      {totalItems === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Trash2 size={40} className="empty-state-icon" />
            <div className="empty-state-title">Trash is empty</div>
            <p className="empty-state-text">Deleted orders, invoices, and clients will appear here.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* Deleted Clients */}
          {deletedClients.length > 0 && (
            <div className="card">
              <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--neutral-900)", marginBottom: 16 }}>Clients</h2>
              <div className="table-wrapper">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>Name / Email</th>
                      <th>Deleted On</th>
                      <th>Days Remaining</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {deletedClients.map((client) => (
                      <tr key={client.id}>
                        <td style={{ fontWeight: 500 }}>{client.fullName || client.email}</td>
                        <td style={{ color: "var(--neutral-500)" }}>{fmtDate(client.deletedAt!)}</td>
                        <td style={{ color: "var(--warning)", fontWeight: 500 }}>{getDaysRemaining(client.deletedAt!)} days</td>
                        <td style={{ textAlign: "right" }}>
                          <TrashActionButtons type="client" id={client.id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Deleted Orders */}
          {deletedOrders.length > 0 && (
            <div className="card">
              <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--neutral-900)", marginBottom: 16 }}>Orders</h2>
              <div className="table-wrapper">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>Project</th>
                      <th>Client</th>
                      <th>Deleted On</th>
                      <th>Days Remaining</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {deletedOrders.map((order) => (
                      <tr key={order.id}>
                        <td style={{ fontWeight: 500 }}>{order.serviceTitle}</td>
                        <td style={{ color: "var(--neutral-600)" }}>{order.client.fullName || order.client.email}</td>
                        <td style={{ color: "var(--neutral-500)" }}>{fmtDate(order.deletedAt!)}</td>
                        <td style={{ color: "var(--warning)", fontWeight: 500 }}>{getDaysRemaining(order.deletedAt!)} days</td>
                        <td style={{ textAlign: "right" }}>
                          <TrashActionButtons type="order" id={order.id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Deleted Invoices */}
          {deletedInvoices.length > 0 && (
            <div className="card">
              <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--neutral-900)", marginBottom: 16 }}>Invoices</h2>
              <div className="table-wrapper">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>Invoice Number</th>
                      <th>Client</th>
                      <th>Deleted On</th>
                      <th>Days Remaining</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {deletedInvoices.map((inv) => (
                      <tr key={inv.id}>
                        <td style={{ fontWeight: 500 }}>{inv.invoiceNumber}</td>
                        <td style={{ color: "var(--neutral-600)" }}>{inv.client.fullName || inv.client.email}</td>
                        <td style={{ color: "var(--neutral-500)" }}>{fmtDate(inv.deletedAt!)}</td>
                        <td style={{ color: "var(--warning)", fontWeight: 500 }}>{getDaysRemaining(inv.deletedAt!)} days</td>
                        <td style={{ textAlign: "right" }}>
                          <TrashActionButtons type="invoice" id={inv.id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
