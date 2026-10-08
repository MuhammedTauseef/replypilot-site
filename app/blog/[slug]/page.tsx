import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import PriceValue from "@/components/PriceValue";
import { posts, type Block } from "../posts";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) return { title: "Post not found — ReplyPilot" };
  return {
    title: `${post.title} | ReplyPilot Blog`,
    description: post.excerpt,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
    },
  };
}

function renderBlock(block: Block, i: number) {
  switch (block.type) {
    case "h2":
      return <h2 key={i}>{block.text}</h2>;
    case "ul":
      return (
        <ul key={i}>
          {block.items.map((item, j) => (
            <li key={j}>{item}</li>
          ))}
        </ul>
      );
    default:
      return <p key={i}>{block.text}</p>;
  }
}

/** /blog/[slug] — full article page. */
export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  const related = posts.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <>
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
