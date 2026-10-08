import Link from "next/link";
import { notFound } from "next/navigation";
import { DEMOS, getDemoBySlug } from "@/lib/demos";
import DemoPlayground from "@/components/DemoPlayground";

/**
 * /demo/[slug] — dedicated live demo page per business, like the old
 * portfolio's individual demo pages. Opens the chat pre-loaded as that
 * business's AI assistant, with a features rundown above it.
 */
export function generateStaticParams() {
  return DEMOS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const demo = getDemoBySlug(slug);
  return {
    title: demo ? `${demo.name} — Live AI Demo | ReplyPilot` : "Demo | ReplyPilot",
    description: demo
      ? `Try the live AI assistant for ${demo.name} (${demo.business}). ${demo.text}`
      : "Try a live ReplyPilot AI demo.",
  };
}

export default async function DemoDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const demo = getDemoBySlug(slug);
  if (!demo) notFound();

  return (
    <main>
      <section className="hero" style={{ padding: 0 }}>
        <div
          className="wrap hero-inner"
          style={{ paddingTop: 64, paddingBottom: 32 }}
        >
          <Link
            href="/demo"
            style={{
              color: "var(--gold-deep)",
              fontWeight: 700,
              fontSize: ".9rem",
              textDecoration: "none",
            }}
          >
            ← All demos
          </Link>
          <div style={{ height: 18 }} />
          <span className="eyebrow">
            Live demo · {demo.tag}
          </span>
          <h1
            className="hero-statement"
            style={{ fontSize: "clamp(2.2rem,5.5vw,3.8rem)" }}
          >
            {demo.name}
            <span className="dot">.</span>
          </h1>
          <p className="hero-sub" style={{ maxWidth: "44ch" }}>
            An AI assistant for {demo.business} — chat with it below, exactly
            like a real customer would.
          </p>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 40 }}>
        <div className="wrap" style={{ maxWidth: 860 }}>
          <div className="demo-detail-card">
            <div className="demo-detail-kicker">What this demo shows</div>
            <p>{demo.text}</p>
            <div className="demo-detail-kicker">How the agent behaves</div>
            <p>{demo.blurb}</p>
            <p className="demo-detail-note">
              Fictional sample for illustration — your free custom demo will
              use your own products, prices, and FAQs.
            </p>
          </div>

          <div style={{ height: 28 }} />

          <DemoPlayground initialDemo={demo} showPicker={false} />

          <div className="demo-cta-card">
            <h2>Want one like this for your business? — $249.</h2>
            <p>
              Trained on your products, your prices, your FAQs. Live in 48
              hours, with a free custom demo first.
            </p>
            <div>
              <Link href="/#contact" className="btn btn-gold">
                Get Your AI Agent — $249{" "}
                <span className="arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
