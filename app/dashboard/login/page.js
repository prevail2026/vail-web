"use client";

import { useSearchParams } from "next/navigation";

const ERROR_MESSAGES = {
  not_authorized: "Your Discord account doesn't have the role required for dashboard access.",
  missing_code: "Something went wrong starting the login. Try again.",
  server_error: "Something went wrong on our end. Try again in a moment.",
};

export default function LoginPage() {
  const params = useSearchParams();
  const error = params.get("error");

  return (
    <main style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#0a0d13", color: "#e7e9ee", fontFamily: "JetBrains Mono, monospace",
    }}>
      <div style={{ textAlign: "center", maxWidth: "24rem", padding: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>Dashboard access</h1>
        <p style={{ color: "#9096a3", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
          Log in with Discord to customize your profile page.
        </p>
        {error && (
          <p style={{ color: "#f23f43", fontSize: "0.8125rem", marginBottom: "1.5rem" }}>
            {ERROR_MESSAGES[error] || "Login failed. Try again."}
          </p>
        )}
        <a
          href="/api/auth/login"
          style={{
            display: "inline-block", background: "#fff", color: "#0a0d13",
            padding: "0.625rem 1.25rem", borderRadius: "0.375rem", fontWeight: 600,
            fontSize: "0.875rem", textDecoration: "none",
          }}
        >
          Continue with Discord
        </a>
      </div>
    </main>
  );
}
