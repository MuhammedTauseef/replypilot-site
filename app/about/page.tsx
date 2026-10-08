import type { Metadata } from "next";
import Link from "next/link";
import { getStaticPage } from "@/lib/pages";
import type { Block } from "@/lib/blog";

export const dynamic = "force-dynamic";



export const metadata: Metadata = {
  title: "About — ReplyPilot",
  description:
    "ReplyPilot is an AI automation studio by Muhammad Tauseef — building practical AI sales agents and workflow automations for growing businesses.",
};

/** Fallback content if DB is unavailable. */
const fallbackBlocks: Block[] = [
  { type: "h2", text: "What we do" },
  { type: "p", text: "We build AI sales agents and workflow automations that help small and growing businesses respond faster, capture more leads, and save hours every week." },
  { type: "h2", text: "How we work" },
  { type: "p", text: "Every build starts with understanding your business. Then we design, build, and launch a custom AI agent, usually within 48 hours." },
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
      // eslint-disable-next-line @next/next/no-img-element
      return <img key={i} src={block.src} alt={block.alt} style={{ maxWidth: "100%", borderRadius: 8 }} />;
    default:
      return <p key={i}>{block.text}</p>;
  }
}

/** /about — who we are, what we do. Content editable via admin. */
export default async function AboutPage() {
  const page = await getStaticPage("about");
  const blocks = page?.content?.length ? page.content : fallbackBlocks;
  const title = page?.title || "About — ReplyPilot";

  return (
    <main>
      <section className="block">
        <div className="wrap" style={{ maxWidth: 760 }}>
          <span className="eyebrow">About</span>
          <h1 className="display" style={{ marginBottom: 12 }}>
            Practical AI for real businesses.
          </h1>
          <p style={{ color: "#4b5563" }}>
            ReplyPilot is an AI automation studio run by Muhammad Tauseef.
          </p>

          <div className="legal-body">
            {blocks.map(renderBlock)}
            <p style={{ marginTop: 24 }}>
              Want to see what an AI agent could do for your business?{" "}
              <Link href="/contact">Contact us</Link> or try a{" "}
              <Link href="/demo">live demo</Link> — it takes two minutes.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
