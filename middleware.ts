// middleware.ts — Portal route protection
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Public portal routes (no auth needed)
  const publicPaths = [
    "/portal/login",
    "/portal/invite",
    "/portal/forgot-password",
    "/portal/reset-password",
  ];

  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  // If accessing a portal route but not logged in → redirect to login
  if (pathname.startsWith("/portal") && !isPublic && !session) {
    return NextResponse.redirect(new URL("/portal/login", req.url));
  }

  // If logged in, enforce role-based routing
  if (session && pathname.startsWith("/portal")) {
    const role = (session.user as { role?: string })?.role;

    // Admin trying to access client/team routes
    if (pathname.startsWith("/portal/client") && role !== "CLIENT") {
      return NextResponse.redirect(new URL("/portal/admin", req.url));
    }
    if (pathname.startsWith("/portal/team") && role !== "TEAM_MEMBER") {
      return NextResponse.redirect(new URL("/portal/admin", req.url));
    }
    if (pathname.startsWith("/portal/admin") && role !== "SUPER_ADMIN") {
      if (role === "CLIENT") return NextResponse.redirect(new URL("/portal/client", req.url));
      if (role === "TEAM_MEMBER") return NextResponse.redirect(new URL("/portal/team/messages", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/portal/:path*"],
};
