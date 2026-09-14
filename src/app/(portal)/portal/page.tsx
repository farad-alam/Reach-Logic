// src/app/(portal)/portal/page.tsx — /portal root: redirect to correct area
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function PortalRootPage() {
  const session = await auth();

  if (!session?.user) redirect("/portal/login");

  const role = (session.user as { role?: string }).role;

  if (role === "SUPER_ADMIN") redirect("/portal/admin");
  if (role === "CLIENT") redirect("/portal/client");
  if (role === "TEAM_MEMBER") redirect("/portal/team/messages");

  redirect("/portal/login");
}
