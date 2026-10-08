import Link from "next/link";
import DemoPlayground from "@/components/DemoPlayground";

/**
 * /demo — full-page live AI demo with all 13 demo businesses.
 * Pick a business → the agent roleplays as that business's assistant.
 * Powered by /api/chat (keys stay server-side).
 */
export default function DemoPage() {
  return (
    <main>
      <section className="hero" style={{ padding: 0 }}>
        <div
          className="wrap hero-inner"
          style={{ paddingTop: 64, paddingBottom: 48 }}
        >
          <span className="eyebrow">Live demo</span>
          <h1
            className="hero-statement"
            style={{ fontSize: "clamp(2.4rem,6vw,4.4rem)" }}
          >
            Try the AI agent<span className="dot">.</span>
          </h1>
          <p className="hero-sub" style={{ maxWidth: "36ch" }}>
            Pick any of the 13 demo businesses and chat with its AI assistant —
            the same kind of agent we build for real businesses.
          </p>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 56 }}>
        <div className="wrap" style={{ maxWidth: 860 }}>
          <DemoPlayground />

          <div
            style={{
              marginTop: 36,
              background: "#0a172a",
              color: "#fff",
              borderRadius: 18,
              padding: "clamp(28px,4vw,44px)",
              display: "grid",
              gap: 18,
              alignItems: "center",
            }}
          >
            <h2
              style={{ margin: 0, fontSize: "1.7rem", letterSpacing: "-.02em" }}
            >
              Like what you see? Get one for your business — $249.
            </h2>
            <p style={{ margin: 0, color: "#b9c6e2" }}>
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
