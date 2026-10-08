import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — ReplyPilot",
  description:
    "Contact ReplyPilot — email us about AI sales agents, WhatsApp automation, and workflow automation for your business.",
};

/** /contact — simple contact page. */
export default function ContactPage() {
  return (
    <main>
      <section className="block">
        <div className="wrap" style={{ maxWidth: 760 }}>
          <span className="eyebrow">Contact</span>
          <h1 className="display" style={{ marginBottom: 12 }}>
            Let&apos;s talk about your business.
          </h1>
          <p style={{ color: "#4b5563" }}>
            The fastest way to reach us is email. We reply within one business
            day.
          </p>

          <div className="legal-body">
            <h2>Email</h2>
            <p>
              <a href="mailto:muhammadtauseef714@gmail.com">
                muhammadtauseef714@gmail.com
              </a>
            </p>

            <h2>What to include</h2>
            <p>
              Tell us a little about your business and what you&apos;d like to
              automate — for example:
            </p>
            <ul>
              <li>What kind of business you run</li>
              <li>Where you lose leads today (missed DMs? slow replies?)</li>
              <li>Which channel matters most (WhatsApp, Instagram, website)</li>
            </ul>

            <h2>Prefer to explore first?</h2>
            <p>
              Try a live demo, read the blog, or watch how the demos work — no
              signup needed to look around.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
