import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — ReplyPilot",
  description:
    "The terms for using the ReplyPilot website and engaging ReplyPilot's AI automation services.",
};

/** /terms — plain-language terms of service for the ReplyPilot site. */
export default function TermsPage() {
  return (
    <main>
      <section className="block">
        <div className="wrap" style={{ maxWidth: 760 }}>
          <span className="eyebrow">Terms of Service</span>
          <h1 className="display" style={{ marginBottom: 12 }}>
            Fair terms, in plain language.
          </h1>
          <p style={{ color: "#4b5563" }}>Last updated: October 2026</p>

          <div className="legal-body">
            <h2>Using this website</h2>
            <p>
              By using this site you agree to these terms. ReplyPilot is an AI
              automation studio operated by Muhammad Tauseef. The content here
              — including the 13 demo concepts — describes what ReplyPilot can
              build; the demo businesses are fictional samples, not real
              clients or results.
            </p>

            <h2>The AI assistant</h2>
            <p>
              The on-site chat assistant answers questions about
              ReplyPilot&apos;s services. It can save your contact details as a
              lead or book a demo slot if you ask it to. It does not give
              legal, financial, or medical advice, and while it tries to be
              accurate, you should confirm important details by email at{" "}
              <a href="mailto:muhammadtauseef714@gmail.com">
                muhammadtauseef714@gmail.com
              </a>
              .
            </p>

            <h2>Services &amp; pricing</h2>
            <ul>
              <li>
                <strong>Setup:</strong> $249 one-time per AI agent, with 50%
                ($125) due upfront and 50% ($124) on go-live.
              </li>
              <li>
                <strong>Ongoing care:</strong> $99/month for hosting, updates,
                and support, cancellable anytime.
              </li>
              <li>
                <strong>Delivery:</strong> first build targeted within 48 hours
                of the upfront payment; you approve before go-live.
              </li>
              <li>
                <strong>Risk reversal:</strong> the second 50% is only due once
                the agent is live and working as agreed.
              </li>
            </ul>
            <p>
              Exact scope, timelines, and any third-party costs (for example
              WhatsApp or platform fees, paid directly by the client) are
              confirmed in writing before work starts.
            </p>

            <h2>Acceptable use</h2>
            <ul>
              <li>Don&apos;t abuse the contact form, chat, or booking tools.</li>
              <li>
                Don&apos;t attempt to break, overload, or bypass this
                site&apos;s security.
              </li>
              <li>
                Don&apos;t use the demos or content here to misrepresent
                ReplyPilot&apos;s work as your own.
              </li>
            </ul>

            <h2>Liability</h2>
            <p>
              This site and its demos are provided &ldquo;as is&rdquo;. To the
              extent allowed by law, ReplyPilot is not liable for indirect or
              consequential losses from using the site. Nothing here limits
              rights you have under applicable consumer law.
            </p>

            <h2>Changes</h2>
            <p>
              These terms may be updated occasionally; the date at the top shows
              the latest version. Continued use of the site after changes means
              you accept them.
            </p>

            <p>
              <Link href="/">← Back to home</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
