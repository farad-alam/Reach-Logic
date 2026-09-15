// src/app/(portal)/portal/team/page.tsx
import { redirect } from "next/navigation";

export default function TeamRoot() {
  redirect("/portal/team/messages");
}
