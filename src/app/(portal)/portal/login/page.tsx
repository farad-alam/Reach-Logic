import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    const role = (session.user as any).role;
    if (role === "SUPER_ADMIN") {
      redirect("/portal/admin");
    } else if (role === "CLIENT" || role === "CLIENT_COLLEAGUE") {
      redirect("/portal/client");
    } else if (role === "TEAM_MEMBER") {
      redirect("/portal/team/messages");
    }
  }

  return (
    <Suspense
      fallback={
        <div className="auth-shell">
          <div className="auth-card" style={{ display: "flex", justifyContent: "center" }}>
            <Loader2 className="animate-spin" />
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
