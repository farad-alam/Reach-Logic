// src/app/(portal)/portal/admin/settings/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import ProfileForm from "@/components/portal/ProfileForm";

export const metadata = { title: "Settings — ReachLogic Portal" };

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/portal/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { fullName: true, email: true, avatarUrl: true, role: true, createdAt: true },
  });
  if (!user) redirect("/portal/login");

  return (
    <div className="portal-page">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Settings</h1>
          <p className="page-header-sub">Manage your account</p>
        </div>
      </div>

      {/* Read-only account info */}
      <div className="card card-sm" style={{ maxWidth: 600, marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--neutral-900)", marginBottom: 14 }}>Account Info</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px", fontSize: 13 }}>
          <div>
            <div style={{ color: "var(--neutral-400)", marginBottom: 2 }}>Email</div>
            <div style={{ color: "var(--neutral-900)", fontWeight: 500 }}>{user.email}</div>
          </div>
          <div>
            <div style={{ color: "var(--neutral-400)", marginBottom: 2 }}>Role</div>
            <div style={{ color: "var(--neutral-900)", fontWeight: 500 }}>Super Admin</div>
          </div>
          <div>
            <div style={{ color: "var(--neutral-400)", marginBottom: 2 }}>Member since</div>
            <div style={{ color: "var(--neutral-900)", fontWeight: 500 }}>
              {new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date(user.createdAt))}
            </div>
          </div>
        </div>
      </div>

      <ProfileForm
        initialName={user.fullName ?? ""}
        initialEmail={user.email}
        initialAvatar={user.avatarUrl}
      />
    </div>
  );
}
