import type { MetadataRoute } from "next";

const BASE = "https://replypilot-site.vercel.app";

/** Public routes for search engines. Auth-gated pages stay out. */
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "/",
    "/demo",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/privacy",
    "/terms",
  ];
  return routes.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path === "/demo" ? 0.9 : 0.5,
  }));
}
