// src/app/(portal)/portal/invite/[token]/page.tsx
import { validateInviteToken } from "@/lib/invitations";
import AcceptInviteForm from "./AcceptInviteForm";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params;
  const check = await validateInviteToken(token);

  if (!check.valid || !check.invitation) {
    return (
      <div className="auth-shell">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h1 className="auth-title">Invitation Invalid</h1>
          <p className="auth-sub" style={{ marginBottom: 0 }}>
            {check.reason}
          </p>
          <p style={{ fontSize: 13, color: "var(--neutral-400)", marginTop: 16 }}>
            Contact your administrator to request a new invitation.
          </p>
        </div>
      </div>
    );
  }

  const { invitation } = check;

  return (
    <div className="auth-shell">
      <AcceptInviteForm
        token={token}
        email={invitation.email}
        role={invitation.role}
        inviterName={invitation.invitedBy.fullName ?? "the ReachLogic team"}
      />
    </div>
  );
}
