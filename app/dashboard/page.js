"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PROVIDERS, PROVIDER_IDS } from "@/lib/providers";

const FONTS = ["JetBrains Mono", "Inter", "Space Grotesk", "IBM Plex Mono"];

const LINK_ERROR_MESSAGES = {
  bad_state: "That link attempt expired. Try connecting again.",
  server_error: "Something went wrong connecting that account. Try again.",
  missing_code: "The connection was cancelled before it finished.",
  unknown_provider: "That service isn't supported.",
};

function DashboardContent() {
  const params = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [user, setUser] = useState(null);
  const [linkedAccounts, setLinkedAccounts] = useState([]);
  const [unlinking, setUnlinking] = useState(null);
  const [form, setForm] = useState({
    display_name: "",
    bio: "",
    accent_color: "#ffffff",
    font: FONTS[0],
    buttons: [],
    widgets: [],
  });

  const linked = params.get("linked");
  const linkError = params.get("linkError");

  function load() {
    fetch("/api/dashboard/me")
      .then((r) => r.json())
      .then(({ user, profile, linkedAccounts }) => {
        setUser(user);
        setLinkedAccounts(linkedAccounts || []);
        if (profile) {
          setForm({
            display_name: profile.display_name || "",
            bio: profile.bio || "",
            accent_color: profile.accent_color || "#ffffff",
            font: profile.font || FONTS[0],
            buttons: profile.buttons || [],
            widgets: profile.widgets || [],
          });
        }
        setLoading(false);
      });
  }

  useEffect(load, []);

  function updateButton(i, key, value) {
    setForm((f) => {
      const buttons = [...f.buttons];
      buttons[i] = { ...buttons[i], [key]: value };
      return { ...f, buttons };
    });
  }

  function addButton() {
    if (form.buttons.length >= 8) return;
    setForm((f) => ({ ...f, buttons: [...f.buttons, { label: "", url: "", icon: "" }] }));
  }

  function removeButton(i) {
    setForm((f) => ({ ...f, buttons: f.buttons.filter((_, idx) => idx !== i) }));
  }

  function toggleWidget(providerId) {
    setForm((f) => {
      const on = f.widgets.includes(providerId);
      return { ...f, widgets: on ? f.widgets.filter((w) => w !== providerId) : [...f.widgets, providerId] };
    });
  }

  async function unlink(providerId) {
    setUnlinking(providerId);
    const res = await fetch(`/api/link/${providerId}/unlink`, { method: "POST" });
    setUnlinking(null);
    if (res.ok) {
      setLinkedAccounts((accts) => accts.filter((a) => a.provider !== providerId));
      setForm((f) => ({ ...f, widgets: f.widgets.filter((w) => w !== providerId) }));
    }
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/dashboard/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  if (loading) {
    return <main style={styles.main}><p style={{ color: "var(--text-dim)" }}>Loading…</p></main>;
  }

  const linkedMap = Object.fromEntries(linkedAccounts.map((a) => [a.provider, a]));

  return (
    <main style={styles.main}>
      <div style={styles.wrap}>
        <div style={styles.headRow}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", margin: 0 }}>
            Customize your profile{user ? ` — ${user.username}` : ""}
          </h1>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" style={styles.logoutBtn}>Log out</button>
          </form>
        </div>
        {user && (
          <p style={{ color: "var(--text-dim)", fontSize: "0.8125rem", marginTop: "0.25rem" }}>
            Public page: <code>/u/{user.username}</code>
          </p>
        )}

        {linked && (
          <p style={styles.banner}>
            {PROVIDERS[linked]?.label || linked} connected. Turn on its widget below to show it on your profile.
          </p>
        )}
        {linkError && (
          <p style={styles.bannerError}>
            {LINK_ERROR_MESSAGES[linkError] || "Couldn't connect that account. Try again."}
          </p>
        )}

        <section style={styles.section}>
          <label style={styles.label}>Display name</label>
          <input
            style={styles.input}
            value={form.display_name}
            maxLength={60}
            onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
          />

          <label style={styles.label}>Bio</label>
          <textarea
            style={{ ...styles.input, minHeight: "5rem", resize: "vertical" }}
            value={form.bio}
            maxLength={280}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
          />

          <label style={styles.label}>Accent color</label>
          <input
            type="color"
            value={form.accent_color}
            onChange={(e) => setForm((f) => ({ ...f, accent_color: e.target.value }))}
            style={{ width: "3rem", height: "2rem", border: "none", background: "none", cursor: "pointer" }}
          />

          <label style={styles.label}>Font</label>
          <select
            style={styles.input}
            value={form.font}
            onChange={(e) => setForm((f) => ({ ...f, font: e.target.value }))}
          >
            {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </section>

        <section style={styles.section}>
          <label style={styles.label}>Linked accounts</label>
          <p style={{ ...styles.hint, marginTop: 0 }}>
            Connect an account, then switch on its widget to show live data on your page.
          </p>
          {PROVIDER_IDS.map((id) => {
            const provider = PROVIDERS[id];
            const account = linkedMap[id];
            const isOn = form.widgets.includes(id);
            return (
              <div key={id} style={styles.providerRow}>
                <div style={styles.providerInfo}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ ...styles.providerDot, background: provider.color }} />
                    <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>{provider.label}</span>
                    {account && <span style={styles.connectedTag}>Connected as {account.provider_username}</span>}
                  </div>
                  <p style={styles.hint}>{provider.description}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  {account ? (
                    <>
                      <label style={styles.toggleLabel}>
                        <input type="checkbox" checked={isOn} onChange={() => toggleWidget(id)} />
                        Show on profile
                      </label>
                      <button
                        type="button"
                        onClick={() => unlink(id)}
                        disabled={unlinking === id}
                        style={styles.removeBtn}
                      >
                        {unlinking === id ? "…" : "Disconnect"}
                      </button>
                    </>
                  ) : (
                    <a href={`/api/link/${id}`} style={styles.smallBtn}>
                      Connect
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        <section style={styles.section}>
          <div style={styles.headRow}>
            <label style={styles.label}>Buttons</label>
            <button type="button" onClick={addButton} style={styles.smallBtn} disabled={form.buttons.length >= 8}>
              + Add button
            </button>
          </div>
          {form.buttons.map((b, i) => (
            <div key={i} style={styles.buttonRow}>
              <input
                style={styles.input}
                placeholder="Label"
                value={b.label}
                onChange={(e) => updateButton(i, "label", e.target.value)}
              />
              <input
                style={styles.input}
                placeholder="https://..."
                value={b.url}
                onChange={(e) => updateButton(i, "url", e.target.value)}
              />
              <button type="button" onClick={() => removeButton(i)} style={styles.removeBtn}>✕</button>
            </div>
          ))}
        </section>

        <button onClick={save} disabled={saving} style={styles.saveBtn}>
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
        </button>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<main style={styles.main}><p style={{ color: "var(--text-dim)" }}>Loading…</p></main>}>
      <DashboardContent />
    </Suspense>
  );
}

const styles = {
  main: {
    minHeight: "100vh", background: "var(--bg)", color: "var(--text)",
    fontFamily: "var(--font-mono)", padding: "3rem 1.5rem", position: "relative", zIndex: 1,
  },
  wrap: { maxWidth: "36rem", margin: "0 auto" },
  headRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" },
  section: {
    marginTop: "1.75rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border)",
    display: "flex", flexDirection: "column", gap: "0.5rem",
  },
  label: { fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "0.5rem" },
  hint: { fontSize: "0.75rem", color: "var(--text-faint)", margin: "0.2rem 0 0" },
  input: {
    background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "0.5rem",
    color: "var(--text)", padding: "0.6rem 0.8rem", fontFamily: "inherit", fontSize: "0.875rem",
  },
  buttonRow: { display: "flex", gap: "0.5rem", alignItems: "center" },
  removeBtn: {
    background: "none", border: "1px solid var(--border)", color: "var(--text-dim)",
    borderRadius: "0.5rem", padding: "0.5rem 0.65rem", cursor: "pointer", fontSize: "0.75rem",
    fontFamily: "inherit", whiteSpace: "nowrap",
  },
  smallBtn: {
    background: "none", border: "1px solid var(--border-strong)", color: "var(--text)",
    borderRadius: "0.4rem", padding: "0.3rem 0.6rem", fontSize: "0.75rem", cursor: "pointer",
    textDecoration: "none", whiteSpace: "nowrap",
  },
  saveBtn: {
    marginTop: "2rem", background: "var(--accent)", color: "#0a0714", border: "none",
    borderRadius: "0.5rem", padding: "0.65rem 1.3rem", fontWeight: 600,
    fontSize: "0.875rem", cursor: "pointer",
  },
  logoutBtn: {
    background: "none", border: "1px solid var(--border-strong)", color: "var(--text-dim)",
    borderRadius: "0.4rem", padding: "0.4rem 0.75rem", fontSize: "0.75rem", cursor: "pointer",
  },
  banner: {
    marginTop: "1rem", fontSize: "0.8rem", color: "var(--accent-2)",
    background: "rgba(110, 231, 196, 0.1)", border: "1px solid rgba(110, 231, 196, 0.3)",
    borderRadius: "0.5rem", padding: "0.6rem 0.85rem",
  },
  bannerError: {
    marginTop: "1rem", fontSize: "0.8rem", color: "var(--danger)",
    background: "rgba(242, 96, 106, 0.1)", border: "1px solid rgba(242, 96, 106, 0.3)",
    borderRadius: "0.5rem", padding: "0.6rem 0.85rem",
  },
  providerRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem",
    border: "1px solid var(--border)", borderRadius: "0.5rem", padding: "0.85rem 1rem",
  },
  providerInfo: { flex: 1, minWidth: 0 },
  providerDot: { width: "0.5rem", height: "0.5rem", borderRadius: "999px", display: "inline-block" },
  connectedTag: {
    fontSize: "0.68rem", color: "var(--text-faint)", border: "1px solid var(--border)",
    borderRadius: "999px", padding: "0.1rem 0.5rem",
  },
  toggleLabel: {
    display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem",
    color: "var(--text-dim)", whiteSpace: "nowrap", cursor: "pointer",
  },
};
