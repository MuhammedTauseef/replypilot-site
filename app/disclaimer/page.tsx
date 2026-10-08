import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer | ReplyPilot",
  description:
    "ReplyPilot disclaimer — educational content, no guarantees, affiliate and advertising disclosure.",
};

/** /disclaimer — AdSense + trust requirement. */
export default function DisclaimerPage() {
  return (
    <main>
      <section className="block">
        <div className="wrap legal-body" style={{ maxWidth: 760 }}>
          <span className="eyebrow">Legal</span>
          <h1 className="display">Disclaimer</h1>
          <p>Last updated: October 8, 2026</p>

          <h2>General information</h2>
          <p>
            The content on ReplyPilot — including blog articles, guides, demo
            videos, and AI chat responses — is provided for general
            information and educational purposes only. While we work hard to
            keep everything accurate and helpful, we make no guarantees about
            completeness, reliability, or suitability for your specific
            situation.
          </p>

          <h2>No professional advice</h2>
          <p>
            Nothing on this website constitutes legal, financial, or
            professional business advice. Always consult a qualified
            professional before making business decisions based on anything
            you read here.
          </p>

          <h2>AI-generated assistance</h2>
          <p>
            Some content on this site is created with the assistance of AI
            tools and reviewed by humans before publishing. Demo conversations
            are illustrative examples, not records of real client
            interactions.
          </p>

          <h2>Advertising disclosure</h2>
          <p>
            This website may display third-party advertisements (including
            Google AdSense). We do not control the content of these ads, and
            their appearance here is not an endorsement of the advertised
            products or services.
          </p>

          <h2>External links</h2>
          <p>
            We link to external websites we find useful or trustworthy. We
            are not responsible for the content, accuracy, or practices of
            those sites.
          </p>

          <h2>Results vary</h2>
          <p>
            Any discussion of automation benefits or business outcomes is
            illustrative. Individual results depend on many factors, and we
            do not promise specific results.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about this disclaimer:{" "}
            <a href="/contact">contact us</a>.
          </p>
        </div>
      </section>
    </main>
  );
}
