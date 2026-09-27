// src/app/(portal)/portal/admin/messages/[clientId]/page.tsx
// Redirects to the main messages page since chat is now a full-page workspace
import { redirect } from "next/navigation";

export default async function AdminMessageThreadRedirect() {
  redirect("/portal/admin/messages");
}
