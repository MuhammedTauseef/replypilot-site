import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { getPublishedPosts } from "@/lib/blog";
import { safeJsonLd } from "@/lib/json-ld";

export const metadata: Metadata = {
  title: "Blog — AI Automation Tips for Small Businesses | ReplyPilot",
  description:
    "Practical, education-first guides on AI automation for small businesses: WhatsApp automation, Instagram DM automation, AI chatbots, e-commerce assistants, lead capture, and n8n workflows.",
  keywords: [
    "AI automation blog",
    "WhatsApp automation",
    "Instagram DM automation",
    "AI chatbot guide",
    "n8n workflow automation",
    "ReplyPilot",
  ],
  alternates: {
    canonical: "https://replypilot-site.vercel.app/blog",
  },
  openGraph: {
    url: "https://replypilot-site.vercel.app/blog",
    images: [
      {
        url: "https://replypilot-site.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ReplyPilot — AI Sales Agents for Small Business",
      },
    ],
  },
};

/** /blog — listing of all posts. */
export default async function BlogPage() {
  const posts = await getPublishedPosts();
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "ReplyPilot Blog",
    url: "https://replypilot-site.vercel.app/blog",
    description:
      "Practical guides for small business owners on AI automation — no jargon, no hype, just what works.",
    inLanguage: "en",
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(blogSchema) }}
      />
      <PageHeader />
      <main>
        <section className="hero" style={{ padding: 0 }}>
          <div
            className="wrap hero-inner"
            style={{ paddingTop: 72, paddingBottom: 56 }}
          >
            <span className="eyebrow">ReplyPilot Blog</span>
            <h1
              className="hero-statement"
              style={{ fontSize: "clamp(2.4rem,6vw,4.4rem)" }}
            >
              AI automation, explained simply<span className="dot">.</span>
            </h1>
            <p className="hero-sub" style={{ maxWidth: "38ch" }}>
              Practical guides for small business owners — no jargon, no hype,
              just what works.
            </p>
          </div>
        </section>

        <section className="block" style={{ paddingTop: 64 }}>
          <div className="wrap">
            <div className="blog-grid">
              {posts.map((post, i) => {
                const imgBlock = post.content.find((b) => b.type === "img");
                const thumb =
                  imgBlock && imgBlock.type === "img" ? imgBlock.src : null;
                return (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="blog-card"
                  >
                    {thumb && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumb}
                        alt={post.title}
                        style={{
                          width: "100%",
                          height: 180,
                          objectFit: "cover",
                          borderRadius: 8,
                          marginBottom: 16,
                          display: "block",
                        }}
                        loading="lazy"
                      />
                    )}
                    <span className="service-num">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3>{post.title}</h3>
                    <p>{post.excerpt}</p>
                    <div className="blog-meta">
                      <span>{post.date}</span>
                      <span>·</span>
                      <span>{post.readTime}</span>
                    </div>
                    <span className="blog-read">Read article →</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
