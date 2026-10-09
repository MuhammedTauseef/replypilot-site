import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import PriceValue from "@/components/PriceValue";
import { getPublishedPosts, getPostBySlug, type Block } from "@/lib/blog";

interface Props {
  params: Promise<{ slug: string }>;
}


export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found — ReplyPilot" };
  return {
    title: `${post.title} | ReplyPilot Blog`,
    description: post.excerpt,
    keywords: post.keywords,
    alternates: {
      canonical: `https://replypilot-site.vercel.app/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
    },
  };
}

/** Render paragraph/list text with [label](url) converted to real links. */
function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, j) => {
    const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (m) {
      const href = m[2];
      const external = /^https?:\/\//.test(href);
      return (
        <a
          key={`${keyPrefix}-${j}`}
          href={href}
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {m[1]}
        </a>
      );
    }
    return <span key={`${keyPrefix}-${j}`}>{part}</span>;
  });
}

function renderBlock(block: Block, i: number) {
  switch (block.type) {
    case "h2":
      return <h2 key={i}>{block.text}</h2>;
    case "ul":
      return (
        <ul key={i}>
          {block.items.map((item, j) => (
            <li key={j}>{renderInline(item, `ul${i}`)}</li>
          ))}
        </ul>
      );
    case "img":
      return (
        <figure key={i} style={{ margin: "32px 0" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.src}
            alt={block.alt}
            style={{
              width: "100%",
              height: "auto",
              borderRadius: 12,
              display: "block",
            }}
            loading="lazy"
          />
        </figure>
      );
    case "video":
      return (
        <figure key={i} style={{ margin: "32px 0" }}>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            src={block.src}
            poster={block.poster}
            controls
            preload="metadata"
            style={{
              width: "100%",
              height: "auto",
              borderRadius: 12,
              display: "block",
            }}
          />
          {block.caption && (
            <figcaption
              style={{
                marginTop: 10,
                fontSize: ".9rem",
                color: "#8b98b8",
                textAlign: "center",
              }}
            >
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    default:
      return <p key={i}>{renderInline(block.text, `p${i}`)}</p>;
  }
}

/** /blog/[slug] — full article page. */
export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const all = await getPublishedPosts();
  const related = all.filter((p) => p.slug !== slug).slice(0, 3);

  // Article schema — Neil Patel 2026 rule: schema markup so AI can scrape and cite content
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    url: `https://replypilot-site.vercel.app/blog/${post.slug}`,
    datePublished: post.date,
    author: {
      "@type": "Organization",
      name: "ReplyPilot",
      url: "https://replypilot-site.vercel.app",
    },
    publisher: {
      "@type": "Organization",
      name: "ReplyPilot",
      url: "https://replypilot-site.vercel.app",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://replypilot-site.vercel.app/blog/${post.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <PageHeader />
      <main>
        <section className="article-hero">
          <div
            className="wrap hero-inner"
            style={{ paddingTop: 64, paddingBottom: 48, maxWidth: 860 }}
          >
            <Link
              href="/blog"
              style={{
                color: "var(--gold-soft)",
                fontWeight: 700,
                fontSize: ".9rem",
                textDecoration: "none",
              }}
            >
              ← All articles
            </Link>
            <h1
              className="hero-statement"
              style={{
                fontSize: "clamp(2rem,5vw,3.4rem)",
                marginTop: 20,
              }}
            >
              {post.title}
            </h1>
            <div
              className="blog-meta"
              style={{ color: "#b9c6e2", marginTop: 16 }}
            >
              <span>{post.date}</span>
              <span>·</span>
              <span>{post.readTime}</span>
            </div>
          </div>
        </section>

        <section className="block" style={{ paddingTop: 56 }}>
          <div className="wrap" style={{ maxWidth: 760 }}>
            <article className="article-body">
              {post.content.map(renderBlock)}
            </article>

            <div className="article-cta">
              <div>
                <h3>Want this working in your business?</h3>
                <p>
                  ReplyPilot builds custom AI agents and automations around
                  your services, your FAQs, and your booking flow — with a free
                  custom demo before you decide.
                </p>
              </div>
              <div
                style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
              >
                <Link href="/#contact" className="btn btn-gold">
                  Get a free demo
                </Link>
                <span
                  style={{
                    alignSelf: "center",
                    color: "#b9c6e2",
                    fontSize: ".95rem",
                    fontWeight: 600,
                  }}
                >
                  Pricing: <PriceValue>visible after login</PriceValue>
                </span>
              </div>
            </div>

            {related.length > 0 && (
              <div style={{ marginTop: 64 }}>
                <h2
                  className="display"
                  style={{ fontSize: "1.8rem", marginBottom: 24 }}
                >
                  Keep reading
                </h2>
                <div className="blog-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
                  {related.map((r) => (
                    <Link
                      key={r.slug}
                      href={`/blog/${r.slug}`}
                      className="blog-card"
                      style={{ padding: "24px 22px" }}
                    >
                      <h3 style={{ fontSize: "1.05rem" }}>{r.title}</h3>
                      <div className="blog-meta">
                        <span>{r.readTime}</span>
                      </div>
                      <span className="blog-read">Read →</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
