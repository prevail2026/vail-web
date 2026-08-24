import { clearSessionCookieHeader } from "@/lib/session";

export async function POST(request) {
  const url = new URL(request.url);
  const headers = new Headers();
  headers.append("Set-Cookie", clearSessionCookieHeader());
  headers.append("Location", `${url.origin}/`);
  return new Response(null, { status: 302, headers });
}
