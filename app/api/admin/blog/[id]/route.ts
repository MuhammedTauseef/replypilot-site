import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { posts as FALLBACK_POSTS } from "@/app/blog/posts";

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

/** GET /api/admin/blog/[id] — get single post. */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { id } = await params;

  const { data, error } = await auth.supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) return NextResponse.json({ error: "Not found." }, { status: 404 });

  // If DB content is empty/placeholder, enrich with fallback from posts.ts
  // so the admin editor always shows the full article.
  const contentLen = JSON.stringify(data.content || []).length;
  if (contentLen < 500) {
    const fallback = FALLBACK_POSTS.find((p) => p.slug === data.slug);
    if (fallback) {
      return NextResponse.json({
        post: {
          ...data,
          content: fallback.content,
          keywords:
            Array.isArray(data.keywords) && data.keywords.length > 0
              ? data.keywords
              : fallback.keywords,
        },
      });
    }
  }

  return NextResponse.json({ post: data });
}

/** PUT /api/admin/blog/[id] — update single post. */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (typeof body.title === "string") updates.title = body.title.trim().slice(0, 200);
  if (typeof body.slug === "string") updates.slug = body.slug.trim().toLowerCase().slice(0, 100);
  if (typeof body.excerpt === "string") updates.excerpt = body.excerpt.trim().slice(0, 500);
  if (Array.isArray(body.content)) updates.content = body.content;
  if (Array.isArray(body.keywords)) updates.keywords = body.keywords;
  if (typeof body.published === "boolean") updates.published = body.published;
  if (typeof body.cover_image === "string") updates.cover_image = body.cover_image;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update." }, { status: 400 });
  }

  // Resolve full values: the throttle RPC takes complete fields, so merge
  // the partial body over the current row. The RPC claims the slot ONLY
  // when the update flips published false -> true.
  const { data: current } = await auth.supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single();
  if (!current) {
    // Preserve the previous lenient behavior (ok:true) for unknown ids.
    return NextResponse.json({ ok: true });
  }
  const merged = {
    slug: typeof updates.slug === "string" ? updates.slug : current.slug,
    title: typeof updates.title === "string" ? updates.title : current.title,
    excerpt: typeof updates.excerpt === "string" ? updates.excerpt : current.excerpt,
    content: Array.isArray(updates.content) ? updates.content : current.content,
    keywords: Array.isArray(updates.keywords) ? updates.keywords : current.keywords,
    cover_image:
      typeof updates.cover_image === "string" ? updates.cover_image : current.cover_image,
    published: typeof updates.published === "boolean" ? updates.published : current.published,
  };

  const { error } = await auth.supabase.rpc("update_blog_post_with_claim", {
    p_id: id,
    p_slug: merged.slug,
    p_title: merged.title,
    p_excerpt: merged.excerpt,
    p_content: merged.content,
    p_keywords: merged.keywords,
    p_cover_image: merged.cover_image,
    p_published: merged.published,
  });
  if (error) {
    const msg = String(error.message ?? "");
    if (msg.includes("RATE_LIMITED")) {
      return NextResponse.json(
        {
          error:
            "Publish rate limit: max 2 articles per 24 hours. Try again after the window passes.",
        },
        { status: 429 }
      );
    }
    if (msg.includes("FORBIDDEN")) {
      return NextResponse.json({ error: "Admins only." }, { status: 403 });
    }
    if (error.code === "23505" || msg.includes("duplicate key")) {
      return NextResponse.json(
        { error: "A post with this slug already exists." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Update failed." }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

/** DELETE /api/admin/blog/[id] — delete single post. */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { id } = await params;

  const { error, count } = await auth.supabase
    .from("blog_posts")
    .delete({ count: "exact" })
    .eq("id", id);
  if (error || count === 0) {
    return NextResponse.json({ error: "Delete failed." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
