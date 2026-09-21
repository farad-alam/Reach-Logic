// src/app/(portal)/portal/client/profile/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import ProfileForm from "@/components/portal/ProfileForm";

export const metadata = { title: "Profile — ReachLogic Portal" };

export default async function ClientProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/portal/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      fullName: true,
      email: true,
      avatarUrl: true,
      company: true,
      phone: true,
      address: true,
      createdAt: true,
    },
  });
  if (!user) redirect("/portal/login");

  return (
    <div className="portal-page">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">My Profile</h1>
          <p className="page-header-sub">Update your contact details, billing address and password</p>
        </div>
      </div>
      <ProfileForm
        initialName={user.fullName ?? ""}
        initialEmail={user.email}
        initialAvatar={user.avatarUrl}
        initialCompany={user.company ?? ""}
        initialPhone={user.phone ?? ""}
        initialAddress={user.address ?? ""}
      />
    </div>
  );
}
