import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { getPublishedVideos } from "@/lib/videos";

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


/** /videos — gallery of 30-second AI agent demo videos. */
export default async function VideosPage() {
  const videos = await getPublishedVideos();
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
                    poster={v.poster || undefined}
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
