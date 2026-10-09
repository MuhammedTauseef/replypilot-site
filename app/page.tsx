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
