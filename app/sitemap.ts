import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/blog";

const BASE = "https://replypilot-site.vercel.app";

/** Public routes for search engines. Auth-gated pages stay out. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts().catch(() => []);
  const routes = [
    "/",
    "/demo",
    "/blog",
    "/videos",
    ...posts.map((p) => `/blog/${p.slug}`),
    "/about",
    "/contact",
    "/faq",
    "/privacy",
    "/terms",
    "/disclaimer",
  ];
  return routes.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority:
      path === "/"
        ? 1
        : path === "/demo" || path === "/blog" || path === "/videos"
          ? 0.9
          : 0.5,
  }));
}
