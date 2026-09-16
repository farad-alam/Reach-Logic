// src/app/(portal)/portal/admin/orders/new/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import NewOrderForm from "./NewOrderForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "New Order" };

export default async function NewOrderPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/portal/login");

  const clients = await prisma.user.findMany({
    where: { role: "CLIENT", isActive: true },
    orderBy: { fullName: "asc" },
    select: { id: true, fullName: true, email: true },
  });

  return (
    <div className="portal-page" style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/portal/admin/orders" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, color: "var(--neutral-500)", textDecoration: "none" }}>
          <ArrowLeft size={14} /> Back to Orders
        </Link>
      </div>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Create New Order</h1>
          <p className="page-header-sub">Place an order on behalf of a client.</p>
        </div>
      </div>
      <div className="card">
        <NewOrderForm clients={clients} />
      </div>
    </div>
  );
}
