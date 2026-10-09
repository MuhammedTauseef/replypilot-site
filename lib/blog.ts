import { createPublicClient } from "@/lib/supabase/public";
import { posts as FALLBACK_POSTS } from "@/app/blog/posts";

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "img"; src: string; alt: string };

export interface DbPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: Block[];
  keywords: string[];
  cover_image: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
  /** Display date derived from created_at. */
  date: string;
  /** Estimated read time from content length. */
  readTime: string;
}

function enrich(row: Record<string, unknown>): DbPost {
  const content = Array.isArray(row.content) ? (row.content as Block[]) : [];
  const words = content
    .map((b) =>
      b.type === "ul" ? b.items.join(" ") : b.type === "img" ? "" : b.text
    )
    .join(" ")
    .split(/\s+/).length;
  const mins = Math.max(2, Math.round(words / 200));
  const created = String(row.created_at ?? "");
  return {
    id: String(row.id ?? ""),
    slug: String(row.slug ?? ""),
    title: String(row.title ?? ""),
    excerpt: String(row.excerpt ?? ""),
    content,
    keywords: Array.isArray(row.keywords) ? (row.keywords as string[]) : [],
    cover_image: (row.cover_image as string) || null,
    published: row.published !== false,
    created_at: created,
    updated_at: String(row.updated_at ?? ""),
    date: created
      ? new Date(created).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "",
    readTime: `${mins} min read`,
  };
}

/** Convert hardcoded post to DbPost shape (build-time fallback). */
function fallbackToDbPost(p: (typeof FALLBACK_POSTS)[number], i: number): DbPost {
  // Fixed date for build-time determinism (no new Date() in prerender)
  const fixedDate = "2026-10-08T00:00:00.000Z";
  return {
    id: `fallback-${i}`,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content as Block[],
    keywords: p.keywords,
    cover_image: null,
    published: true,
    created_at: fixedDate,
    updated_at: fixedDate,
    date: p.date,
    readTime: p.readTime,
  };
}

/** All published posts, newest first (public read). Falls back to hardcoded posts if DB unavailable. */
export async function getPublishedPosts(): Promise<DbPost[]> {
  const supabase = createPublicClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });
    if (!error && data && data.length > 0) return data.map(enrich);
  }
  // Fallback: hardcoded posts (ensures build succeeds and site works pre-seed)
  return FALLBACK_POSTS.map(fallbackToDbPost);
}

/** Single published post by slug (public read). */
export async function getPostBySlug(slug: string): Promise<DbPost | null> {
  const supabase = createPublicClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .single();
    if (!error && data) {
      // If DB content is short/placeholder, use full fallback content
      const contentLen = JSON.stringify(data.content || "").length;
      if (contentLen >= 500) return enrich(data);
    }
  }
  // Fallback: hardcoded posts (full content)
  const p = FALLBACK_POSTS.find((x) => x.slug === slug);
  if (!p) return null;
  return fallbackToDbPost(p, FALLBACK_POSTS.indexOf(p));
}
