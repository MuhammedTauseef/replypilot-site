"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/** /reset-password — set a new password (arrived via the email reset link). */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);

    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password))
      return setError("Password must include both letters and numbers.");
    if (password !== confirm) return setError("Passwords do not match.");

    setBusy(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);

    if (updateError) {
      setError("This reset link is invalid or expired. Request a new one.");
      return;
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <main className="admin-wrap">
      <div className="admin-card">
        <h1>Choose a new password</h1>
        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="rp-password">New password</label>
            <input
              id="rp-password" type="password" autoComplete="new-password" required
              value={password} onChange={(e) => setPassword(e.target.value)} maxLength={72}
              placeholder="Min. 8 characters, letters + numbers"
            />
          </div>
          <div className="field">
            <label htmlFor="rp-confirm">Confirm new password</label>
            <input
              id="rp-confirm" type="password" autoComplete="new-password" required
              value={confirm} onChange={(e) => setConfirm(e.target.value)} maxLength={72}
            />
          </div>
          <button type="submit" className="btn btn-navy" style={{ width: "100%" }} disabled={busy}>
            {busy ? "Saving…" : "Set new password"}
          </button>
          <div className={`form-status${error ? " err" : ""}`} role="status" aria-live="polite">
            {error}
          </div>
          <p style={{ marginTop: 18, fontSize: ".92rem", color: "#4b5563" }}>
            <Link href="/forgot-password">Request a new reset link</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
