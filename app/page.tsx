import RotatingWord from "@/components/RotatingWord";
import ContactForm from "@/components/ContactForm";
import DemoRequestButton from "@/components/DemoRequestButton";
import ChatWidget from "@/components/ChatWidget";
import ThemeToggle from "@/components/ThemeToggle";
import AuthNav from "@/components/AuthNav";
import PriceValue from "@/components/PriceValue";
import CheckoutButton from "@/components/CheckoutButton";
import MobileNav from "@/components/MobileNav";
import Image from "next/image";
import { DEMO_GROUPS } from "@/lib/demos";
import { getPublishedDemos } from "@/lib/demos-db";
import { getPublishedFaqs, getSetting } from "@/lib/settings";

const SERVICES = [
  {
    n: "01",
    title: "AI sales agents",
    text: "Helpful, brand-aware assistants for websites, Instagram, and WhatsApp that answer common questions, guide buyers, and pass serious enquiries to a person.",
    tag: "Chat · Lead capture",
  },
  {
    n: "02",
    title: "WhatsApp automation",
    text: "Familiar chat journeys for order questions, bookings, and service enquiries on the app your customers already use — with human handoff built in.",
    tag: "Orders · Bookings",
  },
  {
    n: "03",
    title: "Instagram DM automation",
    text: "DM conversations that qualify social leads and guide them to the next step, day or night — so no comment or message goes unanswered.",
    tag: "Social · Qualification",
  },
  {
    n: "04",
    title: "Workflow automation",
    text: "n8n workflows that connect the tools you already use, reduce manual admin, and keep customer information moving to the right place.",
    tag: "n8n · Integrations",
  },
  {
    n: "05",
    title: "Review follow-up systems",
    text: "Thoughtful post-purchase follow-up that makes it easier for happy customers to leave feedback — without turning the experience into spam.",
    tag: "Reputation · Care",
  },
  {
    n: "06",
    title: "Custom demos",
    text: "A focused demo using your own products, services, and customer questions — so you can judge the idea in your business context before committing.",
    tag: "Free · No pressure",
  },
];

const STEPS = [
  { n: "Step 01", t: "Understand", p: "Pinpoint the slow, repetitive, or revenue-critical part of your current process." },
  { n: "Step 02", t: "Prototype", p: "Create a tailored flow around your offers, brand voice, and customer questions." },
  { n: "Step 03", t: "Test", p: "Check responses, edge cases, human handoff, and the experience on the channels you use." },
  { n: "Step 04", t: "Improve", p: "Refine the system using real conversations and keep the workflow useful as needs change." },
];

const ENGAGE = [
  { t: "Free custom demo", s: "for your business" },
  { t: "50% upfront", s: "to begin the build" },
  { t: "Built & tested", s: "within 48 hours" },
  { t: "You approve", s: "every response & flow" },
  { t: "50% on go-live", s: "when it's working" },
];

export default async function Home() {
  const allDemos = await getPublishedDemos();
  const faqs = await getPublishedFaqs();
  const heroSub = await getSetting("hero_sub", "Practical AI systems that turn customer interest into action.");
  const announcement = await getSetting("announcement_bar", "");
  const contactEmail = await getSetting("contact_email", "muhammadtauseef714@gmail.com");
  const demosByGroup = (group: "website" | "whatsapp" | "instagram") =>
    allDemos.filter((d) => d.group === group);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      {announcement && (
        <div style={{ background: "#f59e0b", color: "#111827", textAlign: "center", padding: "8px 16px", fontSize: ".9rem", fontWeight: 600 }}>
          {announcement}
        </div>
      )}

      <header className="site-header">
        <div className="wrap">
          <a className="brand" href="#top" aria-label="ReplyPilot home">
            <span className="brand-mark">R</span>REPLYPILOT
          </a>
          <nav className="site-nav" aria-label="Primary navigation">
            <a className="nav-link" href="/about" target="_blank" rel="noopener">About</a>
            <a className="nav-link" href="#services">Services</a>
            <a className="nav-link" href="#demos">Demos</a>
            <a className="nav-link" href="/videos">Videos</a>
            <a className="nav-link" href="/blog">Blog</a>
            <a className="nav-link" href="#process">Process</a>
            <a className="nav-link" href="#pricing">Pricing</a>
            <a className="nav-link" href="#faq">FAQ</a>
            <AuthNav />
            <a className="nav-cta" href="#contact">
              Get Your AI Agent<PriceValue> — $249</PriceValue>
            </a>
            <ThemeToggle />
            <MobileNav />
          </nav>
        </div>
      </header>

      <main id="main">
        {/* HERO — v2 branded (navy/gold, animated, mobile-first) */}
        <section className="hero-v2" id="top" aria-labelledby="hero-v2-title">
          <div className="hero-v2-bubble hero-v2-b1" aria-hidden="true" />
          <div className="hero-v2-bubble hero-v2-b2" aria-hidden="true" />
          <div className="hero-v2-bubble hero-v2-b3" aria-hidden="true" />
          <div className="hero-v2-bubble hero-v2-b4" aria-hidden="true" />
          <div className="wrap hero-v2-inner">
            <span className="hero-v2-eyebrow">AI Automation Studio</span>
            <h1 className="hero-v2-title" id="hero-v2-title">
              Every customer answered in <span className="hero-v2-gold">5 seconds</span> — 24/7, no staff needed.
            </h1>
            <p className="hero-v2-sub">
              ReplyPilot builds AI sales agents for your website, WhatsApp and
              Instagram. They reply instantly, book appointments and capture
              leads while you sleep.
            </p>
            <div className="hero-v2-actions">
              <a className="hero-v2-btn hero-v2-btn-gold" href="#contact">
                Get Free Demo <span aria-hidden="true">→</span>
              </a>
              <a className="hero-v2-btn hero-v2-btn-ghost" href="/demo">
                See Live Demos
              </a>
            </div>
            <p className="hero-v2-trust">
              13 live demos <span className="hero-v2-dot">•</span> 48-hour
              delivery <span className="hero-v2-dot">•</span> Free custom demo
            </p>
          </div>
        </section>

        {/* STATS */}
        <div className="stats" role="region" aria-label="ReplyPilot at a glance">
          <div className="wrap stats-grid">
            <div className="stat">
              <strong>13</strong>
              <span>Live demo concepts you can explore</span>
            </div>
            <div className="stat">
              <strong>4</strong>
              <span>Automation channels — website, WhatsApp, Instagram, workflows</span>
            </div>
            <div className="stat">
              <strong>48h</strong>
              <span>Focused first build, tested before handoff</span>
            </div>
            <div className="stat">
              <strong><PriceValue>$249</PriceValue></strong>
              <span>Clear one-time starting price, no surprises</span>
            </div>
          </div>
        </div>

        {/* ABOUT */}
        <section className="block" id="about" aria-labelledby="about-title">
          <div className="wrap split">
            <div>
              <div className="kicker">About ReplyPilot</div>
              <h2 className="display" id="about-title">
                An automation studio built for growing businesses.
              </h2>
              <p className="lead">
                Big companies have whole teams answering customers. Small
                businesses have you — and you&rsquo;re busy.
              </p>
              <p>
                ReplyPilot gives owner-run businesses the same responsiveness:
                an AI assistant that answers instantly, qualifies interest, and
                hands over to a human at exactly the right moment. One person
                builds it, tests it, and supports it — no agency layers, no
                templates pretending to be custom.
              </p>
            </div>
            <div className="purpose-visual" aria-hidden="true">
              <div className="chat-mock">
                <div className="chat-mock-head">
                  <span className="ava">R</span> ReplyPilot assistant
                </div>
                <div className="chat-mock-body">
                  <div className="bubble bot">
                    Hi! Looking for something in particular today?
                    <span className="t">now</span>
                  </div>
                  <div className="bubble user">
                    Do you have this in medium? Need it before Friday.
                    <span className="t">now</span>
                  </div>
                  <div className="bubble bot">
                    Yes — medium is in stock, and express delivery reaches you
                    by Thursday. Shall I reserve one?
                    <span className="t">now</span>
                  </div>
                </div>
              </div>
              <span className="purpose-badge">Replies in seconds, 24/7</span>
            </div>
          </div>
        </section>

        {/* PURPOSE */}
        <section
          className="block"
          id="purpose"
          aria-labelledby="purpose-title"
          style={{ paddingTop: 0 }}
        >
          <div className="wrap">
            <div className="section-head">
              <div>
                <div className="kicker">Our purpose</div>
                <h2 className="display" id="purpose-title">
                  Every customer answered. Every time.
                </h2>
              </div>
              <p className="section-intro">
                Slow replies lose sales every day. ReplyPilot exists so no
                customer ever waits hours for an answer a business could give
                in seconds — with a human always in reach when judgment
                matters.
              </p>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section
          className="block services-sec"
          id="services"
          aria-labelledby="services-title"
        >
          <div className="wrap">
            <div className="section-head">
              <div>
                <div className="kicker">Our services</div>
                <h2 className="display" id="services-title">
                  Useful automation, not automation for its own sake.
                </h2>
              </div>
              <p className="section-intro">
                Each system is shaped around a real bottleneck: unanswered
                questions, missed leads, repetitive follow-up, or disconnected
                tools.
              </p>
            </div>
            <div className="services-grid">
              {SERVICES.map((s) => (
                <div className="service-card" key={s.n}>
                  <div className="service-num">{s.n}</div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  <div className="service-tag">{s.tag}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DEMOS */}
        <section className="block" id="demos" aria-labelledby="demos-title">
          <div className="wrap">
            <div className="section-head">
              <div>
                <div className="kicker">Live demos</div>
                <h2 className="display" id="demos-title">
                  See the customer experience before we talk.
                </h2>
              </div>
              <p className="section-intro">
                Thirteen concept demos across three channels. Tap any of them —
                the contact form below fills itself in and you can request a
                walkthrough in one tap.
              </p>
            </div>

            {DEMO_GROUPS.map((g) => (
              <div className="demo-group" key={g.key}>
                <div className="demo-group-head">
                  <h3>{g.heading}</h3>
                  <span>{g.sub}</span>
                </div>
                <div className="demo-cards">
                  {demosByGroup(g.key).map((c) => (
                    <div className="demo-card" key={c.name}>
                      <small>{c.tag}</small>
                      <h4>{c.name}</h4>
                      <p>{c.text}</p>
                      <a className="demo-open" href={`/demo/${c.slug}`}>
                        Open live demo{" "}
                        <span className="arrow" aria-hidden="true">
                          →
                        </span>
                      </a>
                      <DemoRequestButton demoName={c.name} />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="honesty">
              <strong>An honest note:</strong> these 13 demos are fictional
              samples showing the quality standard — not client case studies or
              performance claims. Your free custom demo will use your own
              products, prices, customer questions, and brand voice.
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section
          className="block process-sec"
          id="process"
          aria-labelledby="process-title"
        >
          <div className="wrap">
            <div className="section-head">
              <div>
                <div className="kicker">Process</div>
                <h2 className="display" id="process-title">
                  A short path from problem to working system.
                </h2>
              </div>
              <p className="section-intro">
                No oversized discovery phase. We identify the customer moment
                that matters, build around it, test it, and make handoff
                clear.
              </p>
            </div>
            <div className="steps">
              {STEPS.map((s) => (
                <div className="step" key={s.n}>
                  <small>{s.n}</small>
                  <h3>{s.t}</h3>
                  <p>{s.p}</p>
                </div>
              ))}
            </div>
            <div className="engage">
              <h3>How engagement works</h3>
              <div className="engage-steps">
                {ENGAGE.map((e) => (
                  <div className="engage-step" key={e.t}>
                    <strong>{e.t}</strong>
                    <span>{e.s}</span>
                  </div>
                ))}
              </div>
              <div className="risk">
                <small>Risk reversal</small>
                <p>
                  You don&rsquo;t pay the second 50% until it&rsquo;s live and
                  working. If I can&rsquo;t deliver, you don&rsquo;t pay.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="block" id="pricing" aria-labelledby="pricing-title">
          <div className="wrap">
            <div className="pricing-copy" style={{ maxWidth: 760 }}>
              <div className="kicker">Pricing</div>
              <h2 className="display" id="pricing-title">
                Clear enough to decide. Flexible enough to fit.
              </h2>
              <p style={{ marginTop: 24 }}>
                For a focused sales-agent or automation project, this is the
                standard starting point. I confirm the exact scope before work
                begins — no hidden setup surprises.
              </p>
            </div>
            <div className="price-cards">
              <div className="price-card">
                <div className="price-tag">Standard</div>
                <div className="price-line">
                  <span>One-time build</span>
                  <strong><PriceValue>$249</PriceValue></strong>
                </div>
                <div className="price-line">
                  <span>Ongoing care</span>
                  <strong>
                    <PriceValue>$99 <em>/ month</em></PriceValue>
                  </strong>
                </div>
                <ul className="included">
                  <li>
                    <span className="check">✓</span>Business-specific setup and
                    conversation flow
                  </li>
                  <li>
                    <span className="check">✓</span>Testing, revisions, and
                    human-handoff logic
                  </li>
                  <li>
                    <span className="check">✓</span>Ongoing monitoring and
                    practical improvements
                  </li>
                </ul>
                <a
                  className="btn btn-gold"
                  style={{ width: "100%" }}
                  href="#contact"
                >
                  Request a custom demo{" "}
                  <span className="arrow" aria-hidden="true">→</span>
                </a>
                <div style={{ marginTop: 12 }}>
                  <CheckoutButton
                    linkKey="deposit"
                    label={
                      <>
                        Pay <PriceValue>$125</PriceValue> deposit
                      </>
                    }
                    note="50% upfront to start your build. The remaining $124 is due when you approve the finished agent."
                  />
                </div>
              </div>
              <div className="price-card">
                <div className="price-tag">Custom build</div>
                <div className="price-line">
                  <span>Project build</span>
                  <strong>
                    Custom <em>quote</em>
                  </strong>
                </div>
                <div className="price-line">
                  <span>Ongoing care</span>
                  <strong>
                    <PriceValue>$150+ <em>/ month</em></PriceValue>
                  </strong>
                </div>
                <ul className="included">
                  <li>
                    <span className="check">✓</span>Multi-channel or complex
                    workflows
                  </li>
                  <li>
                    <span className="check">✓</span>Custom integrations — CRM,
                    booking, payments
                  </li>
                  <li>
                    <span className="check">✓</span>Dedicated build with
                    priority support
                  </li>
                </ul>
                <a
                  className="btn btn-ghost"
                  style={{ width: "100%" }}
                  href="#contact"
                >
                  Discuss your project{" "}
                  <span className="arrow" aria-hidden="true">→</span>
                </a>
              </div>
            </div>
            <p className="fine" style={{ maxWidth: 760 }}>
              Fixed pricing means fixed pricing: <PriceValue>$249 one-time, $99/month</PriceValue> for
              the standard agent. Your AI API usage and WhatsApp Business
              messaging charges (if used) are billed separately by those
              providers. I estimate everything for you during the free demo.
            </p>
          </div>
        </section>

        {/* MEET */}
        <section
          className="block"
          id="meet"
          aria-labelledby="meet-title"
          style={{ paddingTop: 0 }}
        >
          <div className="wrap" style={{ maxWidth: 780 }}>
            <div className="meet-copy">
              <div className="kicker">Meet Tauseef</div>
              <h2 className="display" id="meet-title" style={{ marginBottom: 28 }}>
                One person accountable, from first demo to go-live.
              </h2>
              <blockquote>
                <span className="q">&ldquo;</span>The best automation feels less
                like software — and more like a dependable member of your team.
                <span className="q">&rdquo;</span>
              </blockquote>
              <p>
                I focus on clear customer experiences, honest expectations, and
                systems your team can understand. The goal is not to replace
                human judgment. It is to remove delays, improve consistency,
                and give your people more time for the conversations that need
                them.
              </p>
              <p>
                You work directly with me — Tauseef. I research the business,
                build the system, test the customer journey, and support it
                after launch. No invented team, no handoff to an anonymous
                agency, and no gap between the person you speak with and the
                person responsible for the work.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section
          className="block"
          id="faq"
          aria-labelledby="faq-title"
          style={{ paddingTop: 0 }}
        >
          <div className="wrap">
            <div className="section-head">
              <div>
                <div className="kicker">FAQ</div>
                <h2 className="display" id="faq-title">
                  Straight answers before you decide.
                </h2>
              </div>
              <p className="section-intro">
                The system is built to make customer response simpler — not to
                add another technical burden.
              </p>
            </div>
            <div className="faq">
              {faqs.map((f) => (
                <details key={f.question}>
                  <summary>{f.question}</summary>
                  <p>{f.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section
          className="block contact-sec"
          id="contact"
          aria-labelledby="contact-title"
        >
          <div className="wrap contact-grid">
            <div className="contact-copy">
              <div className="kicker">Reach out to us</div>
              <h2 className="display" id="contact-title">
                Let&rsquo;s make your next enquiry easier to win.
              </h2>
              <p style={{ marginTop: 24 }}>
                Send a short note about your business and the process you want
                to improve. Your message is saved instantly — no email app
                needed — and Tauseef replies within 24 hours.
              </p>
              <ul className="contact-list">
                <li>
                  <span className="ic">✉</span>
                  <span>
                    <strong>Email</strong>
                    <br />
                    {contactEmail}
                  </span>
                </li>
                <li>
                  <span className="ic">◷</span>
                  <span>
                    <strong>Response time</strong>
                    <br />
                    Within 24 hours, usually much faster
                  </span>
                </li>
                <li>
                  <span className="ic">✓</span>
                  <span>
                    <strong>Free custom demo</strong>
                    <br />
                    Built around your own products — no strings attached
                  </span>
                </li>
              </ul>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div className="foot-brand">
              <a className="brand" href="#top" aria-label="ReplyPilot home">
                <span className="brand-mark">R</span>REPLYPILOT
              </a>
              <p>
                ReplyPilot — AI automation by Muhammad Tauseef. Available
                remotely, worldwide.
              </p>
            </div>
            <div className="foot-col">
              <h4>Explore</h4>
              <a href="/about" target="_blank" rel="noopener">About</a>
              <a href="#services">Services</a>
              <a href="#demos">Live demos</a>
              <a href="/videos">Demo videos</a>
              <a href="/blog">Blog</a>
              <a href="#process">Process</a>
              <a href="#pricing">Pricing</a>
            </div>
            <div className="foot-col">
              <h4>Contact</h4>
              <a href="#contact">Contact form</a>
              <a
                href="https://www.linkedin.com/in/muhammadtauseef9"
                target="_blank"
                rel="noopener"
              >
                LinkedIn
              </a>
              <a
                href="https://tauseef-phi.vercel.app/"
                target="_blank"
                rel="noopener"
              >
                Previous portfolio
              </a>
            </div>
          </div>
          <div className="foot-base">
            <span>© 2026 ReplyPilot · Muhammad Tauseef. Built with care.</span>
            <span className="foot-legal">
              <a href="/privacy">Privacy</a>
              <a href="/terms">Terms</a>
            </span>
            <span>Demos are fictional samples, not client case studies.</span>
          </div>
        </div>
      </footer>

      {/* AI agent — answers as ReplyPilot */}
      <ChatWidget />
    </>
  );
}
