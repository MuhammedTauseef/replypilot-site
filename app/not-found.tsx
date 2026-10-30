import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Page Not Found — ReplyPilot",
  description:
    "The page you are looking for does not exist. Head back to the ReplyPilot home page or browse the blog.",
  robots: { index: false, follow: true },
};

/**
 * Site-wide 404 — rendered with the standard header so a dead end
 * always has a way back Home (or to the Blog).
 */
export default function NotFound() {
  return (
    <>
      <PageHeader />
      <main>
        <section className="block">
          <div className="wrap" style={{ maxWidth: 760, textAlign: "center" }}>
            <span className="eyebrow">404 — Page not found</span>
            <h1 className="display" style={{ marginBottom: 12 }}>
              This page doesn&apos;t exist.
            </h1>
            <p style={{ color: "#4b5563", marginBottom: 28 }}>
              The link may be old, or the address may have a typo. No problem —
              here is the way back:
            </p>
            <p
              style={{
                display: "flex",
                gap: 16,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Link className="nav-cta" href="/">
                ← Back to Home
              </Link>
              <Link className="nav-link" href="/blog">
                Browse the Blog
              </Link>
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
