import type { MetadataRoute } from "next";

/**
 * Public pages are crawlable; private areas are disallowed as a second
 * layer (the layouts also emit noindex meta tags).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/dashboard/", "/onboarding/", "/api/"],
      },
    ],
    sitemap: "https://replypilot-site.vercel.app/sitemap.xml",
  };
}
