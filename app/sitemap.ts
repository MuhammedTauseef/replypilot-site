import type { MetadataRoute } from "next";
import { posts } from "./blog/posts";

const BASE = "https://replypilot-site.vercel.app";

/** Public routes for search engines. Auth-gated pages stay out. */
export default function sitemap(): MetadataRoute.Sitemap {
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
