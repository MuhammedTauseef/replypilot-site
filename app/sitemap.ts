import type { MetadataRoute } from "next";

const BASE = "https://replypilot-site.vercel.app";

/** Public routes for search engines. Auth-gated pages stay out. */
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "/",
    "/demo",
    "/blog",
    "/videos",
    "/blog/whatsapp-automation-restaurants",
    "/blog/instagram-dm-automation-salons",
    "/blog/ai-chatbots-dental-clinics",
    "/blog/ecommerce-store-assistants",
    "/blog/lead-capture-automation",
    "/blog/n8n-workflow-automation-small-business",
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
    priority:
      path === "/"
        ? 1
        : path === "/demo" || path === "/blog" || path === "/videos"
          ? 0.9
          : 0.5,
  }));
}
