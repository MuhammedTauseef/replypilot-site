import type { Metadata } from "next";
import Link from "next/link";
import { getStaticPage } from "@/lib/pages";
import type { Block } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Privacy Policy — ReplyPilot",
  description:
    "How ReplyPilot collects, uses, and protects your data. Contact-form data is stored in Supabase; we never sell your data.",
};

const fallbackBlocks: Block[] = [
  { type: "p", text: "Last updated: October 2026" },
  { type: "h2", text: "Who we are" },
  { type: "p", text: "ReplyPilot is an AI automation studio run by Muhammad Tauseef." },
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

/** /privacy — plain-language privacy policy. Content editable via admin. */
export default async function PrivacyPage() {
  const page = await getStaticPage("privacy");
  const blocks = page?.content?.length ? page.content : fallbackBlocks;

  return (
    <main>
      <section className="block">
        <div className="wrap" style={{ maxWidth: 760 }}>
          <span className="eyebrow">Privacy Policy</span>
          <h1 className="display" style={{ marginBottom: 12 }}>
            Your data, handled with care.
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
