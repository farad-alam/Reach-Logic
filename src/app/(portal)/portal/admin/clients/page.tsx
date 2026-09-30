// src/app/(portal)/portal/admin/clients/page.tsx — Client list
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Users, Plus } from "lucide-react";
import ClientTable from "./ClientTable";

export const metadata = { title: "Clients" };


export default async function ClientsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/portal/login");

  const clients = await prisma.user.findMany({
    where: { role: "CLIENT" },
    orderBy: { createdAt: "desc" },
    include: {
      clientOrders: { select: { id: true, status: true, amount: true } },
      clientInvoices: { select: { isPaid: true, amountPaid: true, lineItems: { select: { amount: true } } } },
      clientColleagues: {
        include: {
          colleague: { select: { id: true, fullName: true, email: true, isActive: true } },
          thread: { select: { name: true } },
        },
        orderBy: { invitedAt: "desc" },
      },
    },
  });

  // Pending invitations — full records for resend/revoke UI
  const pendingInvites = await prisma.invitation.findMany({
    where: { role: "CLIENT", acceptedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, createdAt: true, expiresAt: true },
  });

  const clientData = clients.map((c) => ({
    id: c.id,
    fullName: c.fullName,
    email: c.email,
    country: c.country,
    state: c.state,
    timezone: c.timezone,
    isActive: c.isActive,
    createdAt: c.createdAt,
    orders: c.clientOrders.map((o) => ({ status: o.status, amount: o.amount ? o.amount.toString() : null })),
    invoices: c.clientInvoices.map((i) => ({
      isPaid: i.isPaid,
      amountPaid: i.amountPaid ? i.amountPaid.toString() : null,
      lineItems: i.lineItems.map((li) => ({ amount: li.amount.toString() })),
    })),
    colleagues: c.clientColleagues.map((cc) => ({
      id: cc.colleague.id,
      fullName: cc.colleague.fullName,
      email: cc.colleague.email,
      isActive: cc.colleague.isActive,
      threadName: cc.thread.name,
      status: cc.status,
      invitedAt: cc.invitedAt,
    })),
  }));

  const inviteData = pendingInvites.map((i) => ({
    id: i.id,
    email: i.email,
    createdAt: i.createdAt,
    expiresAt: i.expiresAt,
  }));

  return (
    <div className="portal-page">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Clients</h1>
          <p className="page-header-sub">
            {clients.length} client{clients.length !== 1 ? "s" : ""}
            {clientData.some((c) => c.colleagues.length > 0) && ` · ${clientData.reduce((acc, curr) => acc + curr.colleagues.length, 0)} colleague${clientData.reduce((acc, curr) => acc + curr.colleagues.length, 0) !== 1 ? "s" : ""}`}
            {pendingInvites.length > 0 && ` · ${pendingInvites.length} pending invitation${pendingInvites.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link href="/portal/admin/clients/invite" className="btn btn-primary">
          <Plus size={14} /> Invite Client
        </Link>
      </div>

      {clientData.length === 0 && inviteData.length === 0 ? (
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
        <ClientTable initialClients={clientData} initialInvites={inviteData} />
      )}
    </div>
  );
}
