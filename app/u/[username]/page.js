import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import styles from "./profile.module.css";
import { ProfileWidgets } from "./widgets";

function hexToRgba(hex, alpha) {
  const clean = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#a48cff";
  const r = parseInt(clean.slice(1, 3), 16);
  const g = parseInt(clean.slice(3, 5), 16);
  const b = parseInt(clean.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

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

export async function generateMetadata({ params }) {
  return { title: `${params.username} — vail` };
}

export default async function ProfilePage({ params }) {
  const result = await getProfile(params.username);
  if (!result) notFound();

  const { user, profile } = result;
  const accent = profile?.accent_color || "#a48cff";
  const font = profile?.font || "JetBrains Mono";
  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`
    : `https://cdn.discordapp.com/embed/avatars/0.png`;

  const cssVars = {
    "--accent-c": accent,
    "--accent-fade": hexToRgba(accent, 0.14),
    "--btn-border": hexToRgba(accent, 0.45),
    fontFamily: `${font}, var(--font-mono)`,
  };

  return (
    <main className={styles.page} style={cssVars}>
      <div className={styles.glow} />
      <div className={styles.card}>
        <div className={styles.avatarWrap}>
          <img className={styles.avatar} src={avatarUrl} alt="" />
        </div>
        <h1 className={styles.name} style={{ color: accent }}>
          {profile?.display_name || user.username}
        </h1>
        <div className={styles.handle}>vail.gg/{user.username}</div>
        {profile?.bio && <p className={styles.bio}>{profile.bio}</p>}

        <ProfileWidgets username={user.username} enabled={profile?.widgets} />

        {Array.isArray(profile?.buttons) && profile.buttons.length > 0 && (
          <div className={styles.buttons}>
            {profile.buttons.map((b, i) =>
              b.label && b.url ? (
                <a key={i} className={styles.buttonLink} href={b.url} target="_blank" rel="noopener noreferrer">
                  {b.label}
                </a>
              ) : null
            )}
          </div>
        )}

        <div className={styles.footer}>
          <a href="/">made with vail</a>
        </div>
      </div>
    </main>
  );
}
