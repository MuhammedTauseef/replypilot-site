import type { MetadataRoute } from "next";

/** Allow all crawlers on public pages. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: "https://replypilot-site.vercel.app/sitemap.xml",
  };
}
