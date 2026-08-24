export default function Home() {
  return (
    <main style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#0a0d13", color: "#e7e9ee", fontFamily: "JetBrains Mono, monospace",
    }}>
      {/*
        Your existing site (the one with the sidebar, home/music/projects/github/skills
        pages, Discord presence, etc.) belongs here, or you can move it to /public and
        serve it as-is. This file is left minimal since that's a large existing page —
        drop your current HTML content back in, or convert it into a component.
      */}
      <div style={{ textAlign: "center" }}>
        <h1>vail</h1>
        <p style={{ color: "#9096a3" }}>
          <a href="/dashboard" style={{ color: "#e7e9ee" }}>Dashboard</a>
        </p>
      </div>
    </main>
  );
}
