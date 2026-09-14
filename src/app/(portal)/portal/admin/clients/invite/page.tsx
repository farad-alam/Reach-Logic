// src/app/(portal)/portal/admin/clients/invite/page.tsx
import InviteClientForm from "./InviteClientForm";
export const metadata = { title: "Invite Client" };
export default function InviteClientPage() {
  return (
    <div className="portal-page" style={{ maxWidth: 560 }}>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Invite a Client</h1>
          <p className="page-header-sub">Send an invitation email to onboard a new client.</p>
        </div>
      </div>
      <div className="card">
        <InviteClientForm />
      </div>
    </div>
  );
}
