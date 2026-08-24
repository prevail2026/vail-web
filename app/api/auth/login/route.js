import { discordAuthorizeUrl } from "@/lib/discord";

export async function GET() {
  return Response.redirect(discordAuthorizeUrl(), 302);
}
