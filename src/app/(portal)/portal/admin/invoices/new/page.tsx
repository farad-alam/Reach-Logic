// src/app/(portal)/portal/admin/invoices/new/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import NewInvoiceForm from "./NewInvoiceForm";

export const metadata = { title: "Create Invoice" };

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/portal/login");
  const params = await searchParams;

  // We need a list of clients and their active orders to select from
  const clients = await prisma.user.findMany({
    where: { role: "CLIENT", isActive: true },
    select: {
      id: true,
      fullName: true,
      email: true,
      clientOrders: {
        where: { status: { notIn: ["AWAITING_QUOTE", "CANCELLED"] } },
        select: { id: true, serviceTitle: true, amount: true },
      },
    },
  });

  const clientsWithNumberAmount = clients.map(c => ({
    ...c,
    clientOrders: c.clientOrders.map(o => ({
      ...o,
      amount: o.amount ? Number(o.amount) : null,
    })),
  }));

  return (
    <div className="portal-page" style={{ maxWidth: 800 }}>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Create Invoice</h1>
          <p className="page-header-sub">Generate a new invoice for a project.</p>
        </div>
      </div>
      <div className="card">
        <NewInvoiceForm clients={clientsWithNumberAmount} initialOrderId={params.orderId} />
      </div>
    </div>
  );
}
