import { validateInviteToken } from "@/lib/invitations";
import AcceptInviteForm from "./AcceptInviteForm";
import { Check } from "lucide-react";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params;
  const check = await validateInviteToken(token);

  if (!check.valid || !check.invitation) {
    return (
      <div className="invite-split-shell">
        <div className="invite-split-right" style={{ flex: 1 }}>
          <div className="invite-auth-card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h1 className="invite-auth-title">Invitation Invalid</h1>
            <p className="invite-auth-sub" style={{ marginBottom: 0 }}>
              {check.reason}
            </p>
            <p style={{ fontSize: 13, color: "var(--neutral-400)", marginTop: 16 }}>
              Contact your administrator to request a new invitation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { invitation } = check;

  return (
    <div className="invite-split-shell">
      <div className="invite-split-left">
        <div className="invite-brand-logo">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#12c494" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="invite-brand-title" style={{ margin: 0, fontSize: 32, letterSpacing: "-0.04em" }}>reachlogic</span>
        </div>
        
        <h1 className="invite-brand-title">You're invited to work with ReachLogic</h1>
        <p className="invite-brand-subtitle">
          Set up your account in a minute. Everything for your projects lives in one place.
        </p>

        <ul className="invite-features">
          <li><Check size={18} color="var(--brand-light)" /> Chat with {invitation.invitedBy.fullName || "our team"}</li>
          <li><Check size={18} color="var(--brand-light)" /> Chat with your team in one place</li>
          <li><Check size={18} color="var(--brand-light)" /> Track orders and project status</li>
          <li><Check size={18} color="var(--brand-light)" /> Download invoices anytime</li>
          <li><Check size={18} color="var(--brand-light)" /> 24 hours support</li>
        </ul>

        <div className="invite-footer-url">reachlogic.net</div>
      </div>

      <div className="invite-split-right">
        <AcceptInviteForm
          token={token}
          email={invitation.email}
          role={invitation.role}
          inviterName={invitation.invitedBy.fullName ?? "the ReachLogic team"}
        />
      </div>
    </div>
  );
}
