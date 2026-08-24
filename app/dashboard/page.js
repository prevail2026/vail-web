"use client";

import { useEffect, useState } from "react";

const FONTS = ["JetBrains Mono", "Inter", "Space Grotesk", "IBM Plex Mono"];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    display_name: "",
    bio: "",
    accent_color: "#ffffff",
    font: FONTS[0],
    buttons: [],
  });

  useEffect(() => {
    fetch("/api/dashboard/me")
      .then((r) => r.json())
      .then(({ user, profile }) => {
        setUser(user);
        if (profile) {
          setForm({
            display_name: profile.display_name || "",
            bio: profile.bio || "",
            accent_color: profile.accent_color || "#ffffff",
            font: profile.font || FONTS[0],
            buttons: profile.buttons || [],
          });
        }
        setLoading(false);
      });
  }, []);

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
    return <main style={styles.main}><p style={{ color: "#9096a3" }}>Loading…</p></main>;
  }

  return (
    <main style={styles.main}>
      <div style={styles.wrap}>
        <div style={styles.headRow}>
          <h1 style={{ fontSize: "1.5rem", margin: 0 }}>
            Customize your profile{user ? ` — ${user.username}` : ""}
          </h1>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" style={styles.logoutBtn}>Log out</button>
          </form>
        </div>
        {user && (
          <p style={{ color: "#9096a3", fontSize: "0.8125rem", marginTop: "0.25rem" }}>
            Public page: <code>/u/{user.username}</code>
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

const styles = {
  main: {
    minHeight: "100vh", background: "#0a0d13", color: "#e7e9ee",
    fontFamily: "JetBrains Mono, monospace", padding: "3rem 1.5rem",
  },
  wrap: { maxWidth: "36rem", margin: "0 auto" },
  headRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" },
  section: {
    marginTop: "1.75rem", paddingTop: "1.5rem", borderTop: "1px solid #e8e9eb2a",
    display: "flex", flexDirection: "column", gap: "0.5rem",
  },
  label: { fontSize: "0.75rem", color: "#9096a3", marginTop: "0.5rem" },
  input: {
    background: "#000000a1", border: "1px solid #e8e9eb2a", borderRadius: "0.375rem",
    color: "#e7e9ee", padding: "0.5rem 0.75rem", fontFamily: "inherit", fontSize: "0.875rem",
  },
  buttonRow: { display: "flex", gap: "0.5rem", alignItems: "center" },
  removeBtn: {
    background: "none", border: "1px solid #e8e9eb2a", color: "#9096a3",
    borderRadius: "0.375rem", padding: "0.5rem 0.65rem", cursor: "pointer",
  },
  smallBtn: {
    background: "none", border: "1px solid #e8e9eb2a", color: "#e7e9ee",
    borderRadius: "0.375rem", padding: "0.3rem 0.6rem", fontSize: "0.75rem", cursor: "pointer",
  },
  saveBtn: {
    marginTop: "2rem", background: "#fff", color: "#0a0d13", border: "none",
    borderRadius: "0.375rem", padding: "0.625rem 1.25rem", fontWeight: 600,
    fontSize: "0.875rem", cursor: "pointer",
  },
  logoutBtn: {
    background: "none", border: "1px solid #e8e9eb2a", color: "#9096a3",
    borderRadius: "0.375rem", padding: "0.4rem 0.75rem", fontSize: "0.75rem", cursor: "pointer",
  },
};
