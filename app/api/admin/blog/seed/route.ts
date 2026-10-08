import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { posts } from "@/app/blog/posts";

// One-time seed token (remove after use).
const SEED_TOKEN = "CUDMLQoW_ENHr6CNWgdvtTu7h6J-np4JpUEQGH4CczM";

/**
 * POST /api/admin/blog/seed — one-time migration of the 11 hardcoded
 * articles into the blog_posts table. Admin only. Idempotent.
 */
export async function POST(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token");
  let isAdmin = token === SEED_TOKEN;

  if (!isAdmin) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = (profile as { role?: string } | null)?.role === "admin";
  }

  if (!isAdmin) {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }

  const supabase = await createClient();

  let inserted = 0;
  const errors: string[] = [];

  for (const p of posts) {
    const { error } = await supabase.from("blog_posts").upsert(
      {
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        keywords: p.keywords,
        published: true,
      },
      { onConflict: "slug", ignoreDuplicates: true }
    );
    if (error) {
      errors.push(`${p.slug}: ${error.message}`);
    } else {
      inserted++;
    }
  }

  // Count actual rows to report truthfully
  const { count } = await supabase
    .from("blog_posts")
    .select("id", { count: "exact", head: true });

  // Clean up the connectivity test row if present
  await supabase.from("blog_posts").delete().eq("slug", "seed-test");

  const { count: finalCount } = await supabase
    .from("blog_posts")
    .select("id", { count: "exact", head: true });

  return NextResponse.json({
    ok: errors.length === 0,
    attempted: posts.length,
    inserted,
    totalInDb: finalCount,
    errors: errors.length ? errors : undefined,
  });
}
