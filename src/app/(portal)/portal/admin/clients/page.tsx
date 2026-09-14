// src/app/(portal)/portal/admin/clients/page.tsx — Client list
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Users, Plus, Mail } from "lucide-react";

export const metadata = { title: "Clients" };

export default async function ClientsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/portal/login");

  const clients = await prisma.user.findMany({
    where: { role: "CLIENT" },
    orderBy: { createdAt: "desc" },
    include: {
      clientOrders: { select: { id: true, status: true, amount: true } },
      clientThread: { select: { id: true } },
    },
  });

  // Pending invitations
  const pendingInvites = await prisma.invitation.count({
    where: { role: "CLIENT", acceptedAt: null, expiresAt: { gt: new Date() } },
  });

  return (
    <div className="portal-page">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Clients</h1>
          <p className="page-header-sub">
            {clients.length} client{clients.length !== 1 ? "s" : ""}
            {pendingInvites > 0 && ` · ${pendingInvites} pending invitation${pendingInvites !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link href="/portal/admin/clients/invite" className="btn btn-primary">
          <Plus size={14} /> Invite Client
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Users size={40} className="empty-state-icon" />
            <div className="empty-state-title">No clients yet</div>
            <p className="empty-state-text">
              Invite your first client to get started.
            </p>
            <Link href="/portal/admin/clients/invite" className="btn btn-primary" style={{ marginTop: 8 }}>
              <Plus size={14} /> Invite Client
            </Link>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Orders</th>
                <th>Total Value</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => {
                const totalValue = client.clientOrders.reduce(
                  (s, o) => s + Number(o.amount ?? 0),
                  0
                );
                const activeOrders = client.clientOrders.filter(
                  (o) => o.status === "IN_PROGRESS" || o.status === "PENDING"
                ).length;

                return (
                  <tr key={client.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: "50%",
                            background: "var(--brand-mid)",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 13,
                            fontWeight: 600,
                            flexShrink: 0,
                          }}
                        >
                          {client.fullName
                            ? client.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                            : client.email[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, color: "var(--neutral-900)" }}>
                            {client.fullName ?? "—"}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--neutral-500)", display: "flex", alignItems: "center", gap: 4 }}>
                            <Mail size={11} /> {client.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{client.clientOrders.length}</span>
                      {activeOrders > 0 && (
                        <span className="badge badge-progress" style={{ marginLeft: 6 }}>
                          {activeOrders} active
                        </span>
                      )}
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      {totalValue > 0
                        ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalValue)
                        : "—"}
                    </td>
                    <td>
                      <span className={client.isActive ? "badge badge-completed" : "badge badge-cancelled"}>
                        {client.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link href={`/portal/admin/clients/${client.id}`} className="btn btn-outline btn-sm">
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
