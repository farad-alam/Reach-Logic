import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import StatementClient from "./StatementClient";
import { prisma } from "@/lib/db";

export const metadata = { title: "Statement" };

export default async function StatementPage() {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "SUPER_ADMIN") {
    redirect("/portal/login");
  }

  // Pre-fetch clients for the dropdown filter to avoid client-side waterfalls
  const clients = await prisma.user.findMany({
    where: { role: "CLIENT", deletedAt: null },
    select: { id: true, fullName: true, email: true },
    orderBy: { fullName: "asc" },
  });

  return <StatementClient initialClients={clients} />;
}
