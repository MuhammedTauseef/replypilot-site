import type { Metadata } from "next";
import Link from "next/link";
import { getStaticPage } from "@/lib/pages";
import type { Block } from "@/lib/blog";

export const dynamic = "force-dynamic";



export const metadata: Metadata = {
  title: "Privacy Policy — ReplyPilot",
  description:
    "How ReplyPilot collects, uses, and protects your data. Contact-form data is stored in Supabase; we never sell your data.",
  alternates: {
    canonical: "https://replypilot-site.vercel.app/privacy",
  },
  openGraph: {
    url: "https://replypilot-site.vercel.app/privacy",
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
  { type: "h2", text: "Who we are" },
  { type: "p", text: "ReplyPilot is an AI automation studio run by Muhammad Tauseef. This policy explains what data we collect when you use our website and how we handle it." },
  { type: "h2", text: "Data we collect" },
  { type: "ul", items: [
    "Account data: when you sign up with email and password, we store your email address and name.",
    "Google sign-in: if you choose 'Continue with Google', Google shares your name, email address, and profile picture with us (scopes: openid, email, profile). We use this only to create and identify your account — we do not access your Google Drive, contacts, or any other Google data.",
    "Contact and demo requests: name, email, and business details you submit through our forms.",
    "Usage data: pages visited and basic analytics to improve the website.",
  ] },
  { type: "h2", text: "How we use your data" },
  { type: "ul", items: [
    "To create and manage your account and provide our services.",
    "To respond to enquiries and demo requests.",
    "To improve the website. We never sell your personal data.",
  ] },
  { type: "h2", text: "Where your data is stored" },
  { type: "p", text: "Your data is stored securely in Supabase (our database provider). Authentication is handled by Supabase Auth. We do not share your data with third parties except as required to operate the service." },
  { type: "h2", text: "Your rights" },
  { type: "p", text: "You can request a copy of your data or ask us to delete your account at any time by emailing muhammadtauseef714@gmail.com." },
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
