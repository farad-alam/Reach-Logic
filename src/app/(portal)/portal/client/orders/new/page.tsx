// src/app/(portal)/portal/client/orders/new/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import NewOrderForm from "./NewOrderForm";

export const metadata = { title: "Create New Project" };

export default async function NewOrderPage() {
  const session = await auth();
  let user = null;
  if (session?.user?.id) {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { city: true, state: true, country: true },
    });
  }

  return (
    <div className="portal-page" style={{ maxWidth: 680 }}>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Start a New Project</h1>
          <p className="page-header-sub">Provide the details below, and we'll review it and provide a quote.</p>
        </div>
      </div>
      <div className="card">
        <NewOrderForm
          initialCity={user?.city || ""}
          initialState={user?.state || ""}
          initialCountry={user?.country || ""}
        />
      </div>
    </div>
  );
}
