import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

async function getProfile(username) {
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .ilike("username", username)
    .maybeSingle();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return { user, profile };
}

export default async function ProfilePage({ params }) {
  const result = await getProfile(params.username);
  if (!result) notFound();

  const { user, profile } = result;
  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`
    : `https://cdn.discordapp.com/embed/avatars/0.png`;

  return (
    <main
      style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#0a0d13", color: "#e7e9ee", fontFamily: `${profile.font}, monospace`,
        padding: "2rem",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "26rem" }}>
        <img
          src={avatarUrl}
          alt=""
          style={{
            width: "6rem", height: "6rem", borderRadius: "9999px",
            border: `2px solid ${profile.accent_color}`, marginBottom: "1rem",
          }}
        />
        <h1 style={{ fontSize: "1.75rem", margin: 0, color: profile.accent_color }}>
          {profile.display_name || user.username}
        </h1>
        {profile.bio && (
          <p style={{ color: "#9096a3", marginTop: "0.75rem", fontSize: "0.9375rem" }}>
            {profile.bio}
          </p>
        )}
        {Array.isArray(profile.buttons) && profile.buttons.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center", marginTop: "1.5rem" }}>
            {profile.buttons.map((b, i) => (
              b.label && b.url ? (
                <a
                  key={i}
                  href={b.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    border: `1px solid ${profile.accent_color}`, color: profile.accent_color,
                    borderRadius: "0.375rem", padding: "0.5rem 1rem", fontSize: "0.8125rem",
                    textDecoration: "none",
                  }}
                >
                  {b.label}
                </a>
              ) : null
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
