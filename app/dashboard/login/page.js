"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

const ERROR_MESSAGES = {
  not_authorized: "Your Discord account doesn't have the role required for dashboard access.",
  missing_code: "Something went wrong starting the login. Try again.",
  server_error: "Something went wrong on our end. Try again in a moment.",
};

function LoginContent() {
  const params = useSearchParams();
  const error = params.get("error");

  return (
    <div style={{ textAlign: "center", maxWidth: "24rem", padding: "2rem" }}>
      <a
        href="/"
        style={{
          display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem",
          fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.05rem", textDecoration: "none",
        }}
      >
        <span
          style={{
            width: "1.6rem", height: "1.6rem", borderRadius: "0.4rem",
            background: "linear-gradient(155deg, var(--accent), #6a5acd 70%)",
            boxShadow: "0 0 0.9rem rgba(164, 140, 255, 0.5)",
          }}
        />
        vail
      </a>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", marginBottom: "0.75rem" }}>
        Log in to your dashboard
      </h1>
      <p style={{ color: "var(--text-dim)", fontSize: "0.875rem", marginBottom: "1.75rem" }}>
        Continue with Discord to customize your profile page.
      </p>
      {error && (
        <p
          style={{
            color: "var(--danger)", fontSize: "0.8125rem", marginBottom: "1.5rem",
            background: "rgba(242, 96, 106, 0.1)", border: "1px solid rgba(242, 96, 106, 0.3)",
            borderRadius: "0.5rem", padding: "0.65rem 0.85rem",
          }}
        >
          {ERROR_MESSAGES[error] || "Login failed. Try again."}
        </p>
      )}
      <a
        href="/api/auth/login"
        style={{
          display: "inline-block", background: "var(--accent)", color: "#0a0714",
          padding: "0.7rem 1.4rem", borderRadius: "0.5rem", fontWeight: 600,
          fontSize: "0.875rem", textDecoration: "none",
        }}
      >
        Continue with Discord
      </a>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background:
          "radial-gradient(50rem 26rem at 50% -10%, rgba(164, 140, 255, 0.14), transparent 60%), var(--bg)",
        color: "var(--text)", fontFamily: "var(--font-mono)", position: "relative", zIndex: 1,
      }}
    >
      <Suspense fallback={null}>
        <LoginContent />
      </Suspense>
    </main>
  );
}
