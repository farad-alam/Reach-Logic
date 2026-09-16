// src/app/(portal)/portal/admin/team/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { UserCog, UserPlus, Mail, Calendar } from "lucide-react";
import DeactivateButton from "./DeactivateButton";
import ReactivateButton from "./ReactivateButton";
import PendingInvitesList from "@/components/portal/PendingInvitesList";

export const metadata = { title: "Team" };

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(d));
}

export default async function TeamPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/portal/login");

  const team = await prisma.user.findMany({
    where: { role: "TEAM_MEMBER" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      email: true,
      isActive: true,
      avatarUrl: true,
      createdAt: true,
      threadMemberships: { select: { id: true } },
    },
  });

  const pendingInvites = await prisma.invitation.findMany({
    where: { role: "TEAM_MEMBER", acceptedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, createdAt: true, expiresAt: true },
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://reachlogic.net";

  return (
    <div className="portal-page">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Team</h1>
          <p className="page-header-sub">{team.length} team member{team.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/portal/admin/team/invite" className="btn btn-primary btn-sm">
          <UserPlus size={14} /> Invite Team Member
        </Link>
      </div>

      {team.length === 0 ? (
        <div className="card card-sm" style={{ textAlign: "center", padding: "48px 20px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <UserCog size={36} color="var(--neutral-300)" />
            <p style={{ color: "var(--neutral-500)", fontSize: 14 }}>No team members yet.</p>
            <Link href="/portal/admin/team/invite" className="btn btn-primary btn-sm">
              <UserPlus size={13} /> Invite your first team member
            </Link>
          </div>
        </div>
      ) : (
        <div className="card card-sm" style={{ padding: 0 }}>
          {team.map((member, i) => (
            <div
              key={member.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 18px",
                borderBottom: i < team.length - 1 ? "1px solid var(--neutral-100)" : "none",
                opacity: member.isActive ? 1 : 0.5,
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "var(--brand-dark)", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 700, flexShrink: 0, overflow: "hidden",
              }}>
                {member.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={member.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  (member.fullName ?? member.email).slice(0, 2).toUpperCase()
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--neutral-900)" }}>
                  {member.fullName ?? "—"}{" "}
                  {!member.isActive && (
                    <span style={{ fontSize: 11, fontWeight: 400, color: "var(--neutral-400)", marginLeft: 4 }}>
                      (Deactivated)
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "var(--neutral-500)", display: "flex", gap: 12, marginTop: 2 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Mail size={11} /> {member.email}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Calendar size={11} /> Joined {formatDate(member.createdAt)}
                  </span>
                </div>
              </div>

              {/* Threads assigned */}
              <div style={{ fontSize: 12, color: "var(--neutral-400)", textAlign: "right", flexShrink: 0 }}>
                {member.threadMemberships.length} thread{member.threadMemberships.length !== 1 ? "s" : ""}
              </div>

              {/* Deactivate / Reactivate */}
              {member.isActive ? (
                <DeactivateButton userId={member.id} />
              ) : (
                <ReactivateButton userId={member.id} />
              )}
            </div>
          ))}
        </div>
      )}

      <PendingInvitesList
        invites={pendingInvites}
        role="TEAM_MEMBER"
        baseUrl={baseUrl}
      />
    </div>
  );
}
