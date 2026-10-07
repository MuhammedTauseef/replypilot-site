"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/** /login — sign in, then route to /admin (admins) or /dashboard (clients). */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsVerify, setNeedsVerify] = useState(false);
  const [resent, setResent] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    setNeedsVerify(false);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (signInError) {
      setBusy(false);
      const msg = signInError.message.toLowerCase();
      if (msg.includes("email not confirmed") || msg.includes("not confirmed")) {
        setNeedsVerify(true);
        setError("Please verify your email first — check your inbox for the link.");
      } else {
        setError("Invalid email or password.");
      }
      return;
    }

    // Role-aware landing: admins → /admin, clients → /dashboard.
    const {
      data: { user },
    } = await supabase.auth.getUser();
    let dest = "/dashboard";
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if ((profile as { role?: string } | null)?.role === "admin") dest = "/admin";
    }
    router.push(dest);
    router.refresh();
  }

  async function resendVerification() {
    setResent(false);
    const supabase = createClient();
    await supabase.auth.resend({
      type: "signup",
      email: email.trim().toLowerCase(),
    });
    setResent(true);
  }

  return (
    <main className="admin-wrap">
      <div className="admin-card">
        <h1>Log in</h1>
        <p>Welcome back.</p>
        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="li-email">Email</label>
            <input
              id="li-email" type="email" autoComplete="username" required
              value={email} onChange={(e) => setEmail(e.target.value)} maxLength={160}
            />
          </div>
          <div className="field">
            <label htmlFor="li-password">Password</label>
            <input
              id="li-password" type="password" autoComplete="current-password" required
              value={password} onChange={(e) => setPassword(e.target.value)} maxLength={72}
            />
          </div>
          <button type="submit" className="btn btn-navy" style={{ width: "100%" }} disabled={busy}>
            {busy ? "Logging in…" : "Log in"}
          </button>
          <div className={`form-status${error ? " err" : ""}`} role="status" aria-live="polite">
            {error}
          </div>
          {needsVerify && (
            <p style={{ fontSize: ".92rem" }}>
              Didn&apos;t get the email?{" "}
              <button
                type="button"
                onClick={resendVerification}
                style={{ background: "none", border: 0, padding: 0, color: "#0a172a", fontWeight: 700, cursor: "pointer", font: "inherit", fontSize: ".92rem" }}
              >
                Resend verification email
              </button>
              {resent && <span style={{ color: "#1c7a3d" }}> — sent!</span>}
            </p>
          )}
          <p style={{ marginTop: 18, fontSize: ".92rem", color: "#4b5563" }}>
            <Link href="/forgot-password">Forgot password?</Link>
            <br />
            New here? <Link href="/signup">Create an account</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
