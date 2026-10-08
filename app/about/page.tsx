import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — ReplyPilot",
  description:
    "ReplyPilot is an AI automation studio by Muhammad Tauseef — building practical AI sales agents and workflow automations for growing businesses.",
};

/** /about — who we are, what we do. */
export default function AboutPage() {
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
            <h2>What we do</h2>
            <p>
              We build AI sales agents and workflow automations that help small
              and growing businesses respond faster, capture more leads, and
              save hours every week. That includes:
            </p>
            <ul>
              <li>WhatsApp DM automation that answers customers instantly</li>
              <li>Instagram DM automation for bookings and enquiries</li>
              <li>Website chatbots that qualify and capture leads 24/7</li>
              <li>E-commerce store assistants that reduce cart abandonment</li>
              <li>Custom n8n workflow automations for repetitive tasks</li>
            </ul>

            <h2>How we work</h2>
            <p>
              Every build starts with understanding your business — how you get
              customers today, where leads slip through, and what eats your
              time. Then we design, build, and launch a custom AI agent for
              your business, usually within 48 hours. You see a working demo
              before you pay anything beyond the upfront split.
            </p>

            <h2>Why ReplyPilot</h2>
            <p>
              Most AI tools are generic. We build for one business at a time —
              your services, your tone, your customers. No templates pretending
              to be custom. And we stay after launch: the monthly care plan
              keeps your agent improving as your business grows.
            </p>

            <h2>Get in touch</h2>
            <p>
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
