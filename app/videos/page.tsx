import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Demo Videos — AI Agents in Action | ReplyPilot",
  description:
    "Watch ReplyPilot's AI sales agents in action: 30-second demos for boutiques, restaurants, salons, real estate, dental clinics, gyms, and blogs — WhatsApp, Instagram, website, and e-commerce automation.",
  keywords: [
    "AI agent demo videos",
    "WhatsApp automation demo",
    "Instagram DM automation demo",
    "AI chatbot demo",
    "website chatbot for blogs",
    "guest posting automation",
    "ReplyPilot",
  ],
};

interface DemoVideo {
  file: string;
  poster?: string;
  niche: string;
  channel: string;
  title: string;
  description: string;
}

const videos: DemoVideo[] = [
  {
    file: "/videos/demo-boutique-whatsapp.mp4",
    niche: "Boutique",
    channel: "WhatsApp DM automation",
    title: "Never Miss a Customer Again",
    description:
      "Meet Noor — a demo AI sales agent for boutiques. It shares the price list instantly, answers sizing and stock questions, and keeps shoppers engaged around the clock.",
  },
  {
    file: "/videos/demo-restaurant-whatsapp.mp4",
    niche: "Restaurant",
    channel: "WhatsApp DM automation",
    title: "Never Miss a Table Again",
    description:
      "Meet Remy — a demo AI booking agent for restaurants. It confirms tables in seconds, answers menu and hours questions, and sends reminders that cut no-shows.",
  },
  {
    file: "/videos/demo-salon-whatsapp.mp4",
    poster: "/videos/demo-salon-whatsapp.png",
    niche: "Salon & Spa",
    channel: "WhatsApp DM automation",
    title: "Never Miss Another Booking",
    description:
      "Meet Glam — a demo AI receptionist for salons and spas. It books appointments instantly, quotes services and prices, and follows up so clients rebook.",
  },
  {
    file: "/videos/demo-realestate-website.mp4",
    poster: "/videos/demo-realestate-website.png",
    niche: "Real Estate",
    channel: "Website chatbot",
    title: "Never Lose Another Listing",
    description:
      "Meet Ridge — a demo AI chatbot for real-estate websites. It answers listing questions instantly, captures buyer details, and books viewings while you sleep.",
  },
  {
    file: "/videos/demo-dental-instagram.mp4",
    poster: "/videos/demo-dental-instagram.png",
    niche: "Dental Clinic",
    channel: "Instagram DM automation",
    title: "Never Miss Another Appointment",
    description:
      "Meet Clara — a demo AI assistant for dental clinics. It answers treatment and pricing questions in Instagram DMs, books appointments automatically, and sends reminders.",
  },
  {
    file: "/videos/demo-gym-ecommerce.mp4",
    poster: "/videos/demo-gym-ecommerce.png",
    niche: "Gym & Fitness",
    channel: "E-commerce store assistant",
    title: "Turn Browsers Into Members",
    description:
      "Meet Bolt — a demo AI store assistant for gyms. It compares membership plans, matches supplements to fitness goals, and guides shoppers to checkout.",
  },
  {
    file: "/videos/demo-blog-website.mp4",
    poster: "/videos/demo-blog-website.png",
    niche: "Blog & Content",
    channel: "Website chatbot",
    title: "Never Miss Another Contributor",
    description:
      "Meet Bridge — a demo AI website chatbot for blog submissions. It answers guest-posting pricing, dofollow-link policy, and word-count questions instantly, filters off-topic pitches, and captures contributor details while you sleep. Watch how a 24/7 AI chatbot turns your submission page into a contributor pipeline.",
  },
];

/** /videos — gallery of 30-second AI agent demo videos. */
export default function VideosPage() {
  return (
    <>
      <PageHeader />
      <main>
        <section className="hero" style={{ padding: 0 }}>
          <div
            className="wrap hero-inner"
            style={{ paddingTop: 72, paddingBottom: 56 }}
          >
            <span className="eyebrow">Demo videos</span>
            <h1
              className="hero-statement"
              style={{ fontSize: "clamp(2.4rem,6vw,4.4rem)" }}
            >
              Watch the agents work<span className="dot">.</span>
            </h1>
            <p className="hero-sub" style={{ maxWidth: "40ch" }}>
              30-second concept demos of the AI sales agents ReplyPilot builds
              for real businesses. Demos are fictional portfolio samples.
            </p>
          </div>
        </section>

        <section className="block" style={{ paddingTop: 64 }}>
          <div className="wrap">
            <div className="video-grid">
              {videos.map((v) => (
                <div key={v.file} className="video-card">
                  <video
                    controls
                    preload="none"
                    playsInline
                    poster={v.poster}
                    src={v.file}
                    aria-label={`${v.niche} AI agent demo video`}
                  />
                  <div className="video-body">
                    <small>{v.channel}</small>
                    <h3>
                      {v.niche} — {v.title}
                    </h3>
                    <p>{v.description}</p>
                    <Link href="/#contact" className="btn btn-navy">
                      Get one for my business
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
