import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createSupabaseQueueAdminDeps,
  updateQueueItem,
  deleteQueueItem,
  type QueueItemPatch,
} from "@/lib/queue-admin";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in.", status: 401 } as const;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if ((profile as { role?: string } | null)?.role !== "admin") {
    return { error: "Admins only.", status: 403 } as const;
  }
  return { supabase };
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

/**
 * GET /api/admin/blog/queue — list the article buffer (admin readout):
 * every queue row with its schedule and status, earliest first.
 * GET /api/admin/blog/queue?id=... — one full queue item (with content),
 * used by the Buffer Queue edit form.
 */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const id = new URL(req.url).searchParams.get("id");
  if (id) {
    const { data, error } = await auth.supabase
      .from("blog_publish_queue")
      .select(
        "id, slug, title, excerpt, content, keywords, cover_image, scheduled_publish_at, status, attempts, last_error, created_at"
      )
      .eq("id", id)
      .single();
    if (error || !data) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({ item: data });
  }

  const { data, error } = await auth.supabase
    .from("blog_publish_queue")
    .select(
      "id, slug, title, scheduled_publish_at, status, attempts, last_error, published_post_id, published_at, created_at"
    )
    .order("scheduled_publish_at", { ascending: true });
  if (error) return NextResponse.json({ error: "Failed to load queue." }, { status: 500 });
  return NextResponse.json({ queue: data });
}

function guardResponse(result: { reason: string; error: string }) {
  const status = result.reason === "not-found" ? 404 : 409;
  return NextResponse.json({ error: result.error }, { status });
}

/**
 * PUT /api/admin/blog/queue — edit / reschedule a waiting item.
 * Body: { id, title, excerpt, content, keywords, cover_image?,
 * scheduled_publish_at }. Only 'pending' items may change (enforced in
 * lib/queue-admin by status, including a status-conditioned write);
 * 'publishing' / 'published' / 'failed' items are refused with 409.
 */
export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const id = String(body.id ?? "");
  if (!id) return NextResponse.json({ error: "ID required." }, { status: 400 });
  const title = String(body.title ?? "").trim().slice(0, 200);
  if (!title) return NextResponse.json({ error: "Title required." }, { status: 400 });

  const scheduledRaw = String(body.scheduled_publish_at ?? "").trim();
  const scheduled = new Date(scheduledRaw);
  if (!scheduledRaw || Number.isNaN(scheduled.getTime())) {
    return NextResponse.json(
      { error: "scheduled_publish_at (ISO date) required." },
      { status: 400 }
    );
  }

  const patch: QueueItemPatch = {
    title,
    excerpt: String(body.excerpt ?? "").trim().slice(0, 500),
    content: Array.isArray(body.content) ? body.content.slice(0, 200) : [],
    keywords: Array.isArray(body.keywords)
      ? body.keywords.map((k) => String(k).slice(0, 60)).slice(0, 10)
      : [],
    cover_image: String(body.cover_image ?? "").trim().slice(0, 500) || null,
    scheduled_publish_at: scheduled.toISOString(),
  };

  const result = await updateQueueItem(
    createSupabaseQueueAdminDeps(auth.supabase),
    id,
    patch
  );
  if (!result.ok) return guardResponse(result);
  return NextResponse.json({ ok: true });
}

/**
 * DELETE /api/admin/blog/queue?id=... — remove a waiting item from the
 * buffer entirely. Only 'pending' items may be deleted (same guard as
 * PUT); anything else is refused with 409.
 */
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required." }, { status: 400 });

  const result = await deleteQueueItem(
    createSupabaseQueueAdminDeps(auth.supabase),
    id
  );
  if (!result.ok) return guardResponse(result);
  return NextResponse.json({ ok: true });
}

/**
 * POST /api/admin/blog/queue — enqueue a finished, QC-passed draft for
 * scheduled auto-publishing. Body: { title, slug?, excerpt, content,
 * keywords, cover_image?, scheduled_publish_at }.
 *
 * The item is NOT published here — the daily cron publishes it through
 * POST /api/admin/blog when its schedule comes due.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const title = String(body.title ?? "").trim().slice(0, 200);
  if (!title) return NextResponse.json({ error: "Title required." }, { status: 400 });
  const slug = slugify(String(body.slug ?? "") || title);
  if (!slug) return NextResponse.json({ error: "Invalid slug." }, { status: 400 });

  const scheduledRaw = String(body.scheduled_publish_at ?? "").trim();
  const scheduled = new Date(scheduledRaw);
  if (!scheduledRaw || Number.isNaN(scheduled.getTime())) {
    return NextResponse.json(
      { error: "scheduled_publish_at (ISO date) required." },
      { status: 400 }
    );
  }

  const content = Array.isArray(body.content) ? body.content.slice(0, 200) : [];
  const keywords = Array.isArray(body.keywords)
    ? body.keywords.map((k) => String(k).slice(0, 60)).slice(0, 10)
    : [];

  // Refuse slugs that are already live posts — the queue is only for
  // finished drafts that are not yet published anywhere.
  const { data: existing } = await auth.supabase
    .from("blog_posts")
    .select("id")
    .eq("slug", slug)
    .single();
  if (existing) {
    return NextResponse.json(
      { error: "A blog post with this slug already exists." },
      { status: 400 }
    );
  }

  const { data, error } = await auth.supabase
    .from("blog_publish_queue")
    .insert({
      slug,
      title,
      excerpt: String(body.excerpt ?? "").trim().slice(0, 500),
      content,
      keywords,
      cover_image: String(body.cover_image ?? "").trim().slice(0, 500) || null,
      scheduled_publish_at: scheduled.toISOString(),
      status: "pending",
    })
    .select("id, slug, scheduled_publish_at")
    .single();

  if (error) {
    const msg =
      error.code === "23505"
        ? "A queue item with this slug already exists."
        : "Enqueue failed.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({ ok: true, queueItem: data });
}
