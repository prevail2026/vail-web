import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/session";

export function middleware(request) {
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (request.nextUrl.pathname === "/dashboard/login") return NextResponse.next();

    const session = getSessionFromCookies(request.headers.get("cookie"));
    if (!session) {
      return NextResponse.redirect(new URL("/dashboard/login", request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/dashboard/:path*"],
};
