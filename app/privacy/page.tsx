import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — ReplyPilot",
  description:
    "How ReplyPilot collects, uses, and protects your data. Contact-form data is stored in Supabase; we never sell your data.",
};

/** /privacy — plain-language privacy policy for the ReplyPilot site. */
export default function PrivacyPage() {
  return (
    <main>
      <section className="block">
        <div className="wrap" style={{ maxWidth: 760 }}>
          <span className="eyebrow">Privacy Policy</span>
          <h1 className="display" style={{ marginBottom: 12 }}>
            Your data, handled with care.
          </h1>
          <p style={{ color: "#4b5563" }}>Last updated: October 2026</p>

          <div className="legal-body">
            <h2>Who we are</h2>
            <p>
              ReplyPilot is an AI automation studio run by Muhammad Tauseef.
              This policy explains what data this website collects and how it
              is used. If you have questions, email{" "}
              <a href="mailto:muhammadtauseef714@gmail.com">
                muhammadtauseef714@gmail.com
              </a>
              .
            </p>

            <h2>What we collect</h2>
            <ul>
              <li>
                <strong>Contact form:</strong> your name, email address, and
                anything you write in the message field.
              </li>
              <li>
                <strong>Chat conversations:</strong> messages you send to the
                on-site AI assistant, so it can reply and — only if you share
                your details — save your enquiry as a lead.
              </li>
              <li>
                <strong>Account data:</strong> if you create an account, your
                email address and the enquiries tied to it.
              </li>
              <li>
                <strong>Theme preference:</strong> whether you chose dark or
                light mode, stored only in your own browser (localStorage).
              </li>
            </ul>

            <h2>Where your data lives</h2>
            <p>
              Form submissions, leads, bookings, and account data are stored in
              a Supabase (PostgreSQL) database with row-level security, so each
              client can only see their own enquiries. Passwords are handled
              entirely by Supabase Auth and are never stored in plain text on
              this site.
            </p>

            <h2>AI chat</h2>
            <p>
              The on-site assistant is powered by Google Gemini. Messages you
              send in chat are processed by Google&apos;s API to generate
              replies, under Google&apos;s own terms. We do not use your chat
              messages for advertising.
            </p>

            <h2>Cookies</h2>
            <p>
              This site does not use tracking or advertising cookies. The only
              thing stored in your browser is your dark/light theme preference
              (localStorage), which never leaves your device.
            </p>

            <h2>What we never do</h2>
            <ul>
              <li>We never sell, rent, or share your personal data.</li>
              <li>We never send marketing emails you didn&apos;t ask for.</li>
              <li>
                We never publish your enquiries — the demo businesses on this
                site are fictional samples, not client case studies.
              </li>
            </ul>

            <h2>Your rights</h2>
            <p>
              You can ask at any time to see, correct, or delete the personal
              data we hold about you — just email{" "}
              <a href="mailto:muhammadtauseef714@gmail.com">
                muhammadtauseef714@gmail.com
              </a>{" "}
              and it will be handled personally.
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
