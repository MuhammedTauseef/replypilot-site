import type { Metadata } from "next";
import Link from "next/link";
import { getStaticPage } from "@/lib/pages";
import type { Block } from "@/lib/blog";

export const dynamic = "force-dynamic";



export const metadata: Metadata = {
  title: "Terms of Service — ReplyPilot",
  description:
    "The terms for using the ReplyPilot website and engaging ReplyPilot's AI automation services.",
  alternates: {
    canonical: "https://replypilot-site.vercel.app/terms",
  },
  openGraph: {
    url: "https://replypilot-site.vercel.app/terms",
    images: [
      {
        url: "https://replypilot-site.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ReplyPilot — AI Sales Agents for Small Business",
      },
    ],
  }
};

const fallbackBlocks: Block[] = [
  { type: "p", text: "Last updated: October 2026" },
  { type: "h2", text: "Using this website" },
  { type: "p", text: "By using this site you agree to these terms. ReplyPilot is an AI automation studio operated by Muhammad Tauseef." },
];

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
    case "img":
      return null; // images not used on static pages
    default:
      return <p key={i}>{(block as { text: string }).text}</p>;
  }
}

/** /terms — plain-language terms of service. Content editable via admin. */
export default async function TermsPage() {
  const page = await getStaticPage("terms");
  const blocks = page?.content?.length ? page.content : fallbackBlocks;

  return (
    <main>
      <section className="block">
        <div className="wrap" style={{ maxWidth: 760 }}>
          <span className="eyebrow">Terms of Service</span>
          <h1 className="display" style={{ marginBottom: 12 }}>
            Fair terms, in plain language.
          </h1>

          <div className="legal-body">
            {blocks.map(renderBlock)}
            <p>
              <Link href="/">← Back to home</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
