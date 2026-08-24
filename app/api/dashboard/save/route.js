import { getSessionFromCookies } from "@/lib/session";
import { supabase } from "@/lib/supabase";

const ALLOWED_FONTS = ["JetBrains Mono", "Inter", "Space Grotesk", "IBM Plex Mono"];

export async function POST(request) {
  const session = await getSessionFromCookies(request.headers.get("cookie"));
  if (!session) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const display_name = String(body.display_name || "").slice(0, 60);
  const bio = String(body.bio || "").slice(0, 280);
  const accent_color = /^#[0-9a-fA-F]{6}$/.test(body.accent_color) ? body.accent_color : "#ffffff";
  const font = ALLOWED_FONTS.includes(body.font) ? body.font : ALLOWED_FONTS[0];

  const buttons = Array.isArray(body.buttons)
    ? body.buttons.slice(0, 8).map((b) => ({
        label: String(b.label || "").slice(0, 30),
        url: String(b.url || "").slice(0, 300),
        icon: String(b.icon || "").slice(0, 30),
      }))
    : [];

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name,
      bio,
      accent_color,
      font,
      buttons,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", session.id);

  if (error) {
    console.error("Failed to save profile:", error);
    return Response.json({ error: "save_failed" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
