import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side admin authentication for the auto-publisher.
 *
 * Owner rule (2026-10-27 — "admin SA hi published hon"): queued posts are
 * published THROUGH the admin publish API, never by flipping blog_posts
 * directly. This module signs in a dedicated automation admin account (a
 * real Supabase Auth user with profiles.role = 'admin') using the same
 * cookie-session mechanism as the /admin panel, so the cron can invoke
 * POST /api/admin/blog with a genuine admin session — requireAdmin(),
 * the RLS-bound write and triggerAutoDeploy() all run exactly as they
 * do for a human publish.
 *
 * Credentials come from env (CRON_ADMIN_EMAIL / CRON_ADMIN_PASSWORD),
 * provisioned by the owner. Nothing here uses the service-role key.
 */

export interface AutomationAdmin {
  /** Session-carrying client (RLS-bound) for queue reads/writes. */
  client: SupabaseClient;
  /** Cookie header for internal admin-API calls, from the live session. */
  cookieHeader: () => string;
}

export async function signInAutomationAdmin(): Promise<
  { ok: true; admin: AutomationAdmin } | { ok: false; error: string }
> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const email = process.env.CRON_ADMIN_EMAIL;
  const password = process.env.CRON_ADMIN_PASSWORD;
  if (!url || !anonKey) {
    return { ok: false, error: "Supabase public env vars are not configured." };
  }
  if (!email || !password) {
    return {
      ok: false,
      error: "CRON_ADMIN_EMAIL / CRON_ADMIN_PASSWORD are not configured.",
    };
  }

  // In-memory cookie store — same @supabase/ssr session mechanism the
  // panel uses, without a browser or an incoming request.
  const store = new Map<string, string>();
  const client = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return [...store.entries()].map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          if (value) store.set(name, value);
          else store.delete(name);
        });
      },
    },
  });

  const { error: signInError } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError) {
    return {
      ok: false,
      error: `Automation admin sign-in failed: ${signInError.message}`,
    };
  }

  // Same role check the admin routes perform — refuse non-admin sessions.
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) {
    return { ok: false, error: "Automation admin sign-in returned no user." };
  }
  const { data: profile } = await client
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if ((profile as { role?: string } | null)?.role !== "admin") {
    return { ok: false, error: "Automation account does not have the admin role." };
  }

  return {
    ok: true,
    admin: {
      client,
      cookieHeader: () =>
        [...store.entries()].map(([name, value]) => `${name}=${value}`).join("; "),
    },
  };
}

export interface AdminPublishDraft {
  title: string;
  slug: string;
  excerpt: string;
  content: unknown[];
  keywords: string[];
  cover_image: string | null;
}

export type AdminPublishResult =
  | { ok: true; postId: string | null }
  | { ok: false; status: number; error: string; slugExists: boolean };

/**
 * Invoke the panel's publish action — POST /api/admin/blog with
 * published: true — on the same origin, carrying the admin session.
 * This is the one and only way the auto-publisher publishes.
 */
export async function publishViaAdminApi(
  origin: string,
  cookieHeader: string,
  draft: AdminPublishDraft
): Promise<AdminPublishResult> {
  let res: Response;
  try {
    res = await fetch(`${origin}/api/admin/blog`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: cookieHeader },
      body: JSON.stringify({ ...draft, published: true }),
    });
  } catch (err) {
    return {
      ok: false,
      status: 0,
      error: `Admin publish request failed: ${String(err)}`,
      slugExists: false,
    };
  }

  const data = (await res.json().catch(() => ({}))) as {
    post?: { id?: string };
    error?: string;
  };
  if (res.ok) {
    return { ok: true, postId: data.post?.id ?? null };
  }
  const message = data.error || `HTTP ${res.status}`;
  return {
    ok: false,
    status: res.status,
    error: message,
    slugExists: /already exists/i.test(message),
  };
}
