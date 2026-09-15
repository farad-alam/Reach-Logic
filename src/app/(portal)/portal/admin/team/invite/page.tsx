// src/app/(portal)/portal/admin/team/invite/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import InviteTeamForm from "./InviteTeamForm";

export const metadata = { title: "Invite Team Member — ReachLogic Portal" };

export default async function InviteTeamPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/portal/login");
  return (
    <div className="portal-page">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Invite Team Member</h1>
          <p className="page-header-sub">Send an invitation email to a new team member</p>
        </div>
      </div>
      <div style={{ maxWidth: 480 }}>
        <div className="card card-sm">
          <InviteTeamForm />
        </div>
      </div>
    </div>
  );
}
