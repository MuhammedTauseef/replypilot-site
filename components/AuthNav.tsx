"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Header auth area. Signed out → "Log in".
 * Signed in → "Dashboard" (clients) or "Admin" (admins) + "Sign out".
 */
export default function AuthNav() {
  // undefined = still checking, null = signed out, string = role
  const [role, setRole] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    const supabase = createClient();
    async function check() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setRole(null);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      setRole((profile as { role?: string } | null)?.role ?? "client");
    }
    check();
    const { data: sub } = supabase.auth.onAuthStateChange(() => check());
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    try {
      const supabase = createClient();
      // Never hang on a slow network — 5s max, then move on.
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((resolve) => setTimeout(resolve, 5000)),
      ]);
    } catch {
      // ignore — navigate home anyway
    }
    window.location.href = "/";
  }

  if (!role) {
    return (
      <a className="nav-link" href="/login">
        Log in
      </a>
    );
  }

  const dest = role === "admin" ? "/admin" : "/dashboard";
  const label = role === "admin" ? "Admin" : "Dashboard";

  return (
    <>
      <a className="nav-link" href={dest}>
        {label}
      </a>
      <button type="button" className="nav-link nav-signout" onClick={signOut}>
        Sign out
      </button>
    </>
  );
}
