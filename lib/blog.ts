import { createClient } from "@/lib/supabase/server";

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

/** All published posts, newest first (public read). */
export async function getPublishedPosts(): Promise<DbPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(enrich);
}

/** Single published post by slug (public read). */
export async function getPostBySlug(slug: string): Promise<DbPost | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  if (error || !data) return null;
  return enrich(data);
}
