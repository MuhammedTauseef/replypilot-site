import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { getStaticPage } from "@/lib/pages";
import type { Block } from "@/lib/blog";

export const dynamic = "force-dynamic";



export const metadata: Metadata = {
  title: "Disclaimer | ReplyPilot",
  description:
    "ReplyPilot disclaimer — educational content, no guarantees, affiliate and advertising disclosure.",
  alternates: {
    canonical: "https://replypilot-site.vercel.app/disclaimer",
  },
  openGraph: {
    url: "https://replypilot-site.vercel.app/disclaimer",
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
  { type: "p", text: "Last updated: October 30, 2026" },
  { type: "h2", text: "General information" },
  {
    type: "p",
    text: "ReplyPilot is an AI automation service run by CEO Muhammad Tauseef. The guides, articles, videos, and other content published on this website are provided for general information and educational purposes only. They explain how AI chatbots, WhatsApp automation, and related tools work and how a small business might use them. Reading this content does not create a client relationship between you and ReplyPilot, and nothing on this site is a contract, a quote, or a promise of a particular service or result.",
  },
  { type: "h2", text: "No guarantee of results" },
  {
    type: "p",
    text: "AI agents can save time, answer customers faster, and help a business follow up on enquiries — but results depend on your business, your market, your offer, and how the agent is set up and used. We do not guarantee any specific outcome, including more sales, more bookings, more leads, higher revenue, or any particular return on investment. Examples, scenarios, and sample conversations shown on this site illustrate what an agent can do; they are not promises of what it will do for every business, and illustrated results do not predict future results for you.",
  },
  { type: "h2", text: "Accuracy of our content" },
  {
    type: "p",
    text: "We work to keep our guides accurate and up to date, but tools, platform rules, application programming interfaces (APIs), and prices change often — WhatsApp and Meta policies are a good example. Content may contain mistakes or become out of date without notice. Always check the official documentation of any platform you rely on, and confirm important details with us in writing before you make a decision based on something you read here.",
  },
  { type: "h2", text: "Demos and the on-site assistant" },
  {
    type: "p",
    text: "The live demos on this website feature fictional sample businesses created to show how an agent behaves. They are not real clients, and any names, prices, or conversations in a demo are illustrative only. The assistant on this site is an AI system: it can make mistakes, and its answers are general information, not professional advice and not a binding offer. A price, timeline, or commitment only counts when we confirm it to you in writing by email.",
  },
  { type: "h2", text: "Professional advice" },
  {
    type: "p",
    text: "Nothing on this website is legal, financial, medical, tax, or other professional advice. AI automation touches areas such as privacy law, messaging-consent rules, and consumer protection, and the right choice depends on your situation and your country. For questions in those areas, please consult a licensed professional — a lawyer, accountant, doctor, or other qualified adviser — before acting.",
  },
  { type: "h2", text: "External links" },
  {
    type: "p",
    text: "This website links to other websites and services for convenience and reference. We do not control those sites, we are not responsible for their content, accuracy, or practices, and a link is not an endorsement of everything a linked site publishes. When you leave ReplyPilot, the other site's own terms and privacy policy apply.",
  },
  { type: "h2", text: "Affiliate links and advertising" },
  {
    type: "p",
    text: "Some links on this site are affiliate links, which means we may earn a commission if you buy through them — at no extra cost to you. Commissions never buy a positive mention: our comparisons and recommendations reflect our honest assessment, and we say so when a tool has real limits. This site may also display advertising, including through Google AdSense; ads are provided by third parties and are not endorsements by ReplyPilot.",
  },
  { type: "h2", text: "Questions" },
  {
    type: "p",
    text: "If anything in this disclaimer is unclear, or you want to check a claim made anywhere on this site, email us at muhammadtauseef714@gmail.com and we will be glad to explain.",
  },
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

/** /disclaimer — AdSense + trust requirement. Content editable via admin. */
export default async function DisclaimerPage() {
  const page = await getStaticPage("disclaimer");
  const blocks = page?.content?.length ? page.content : fallbackBlocks;

  return (
    <>
      <PageHeader />
      <main>
      <section className="block">
        <div className="wrap legal-body" style={{ maxWidth: 760 }}>
          <span className="eyebrow">Legal</span>
          <h1 className="display">Disclaimer</h1>
          {blocks.map(renderBlock)}
        </div>
      </section>
      </main>
    </>
  );
}
