/**
 * SEO metadata for demo videos that exist as local files in public/videos/
 * but have no published Supabase row yet (the agent's Supabase service
 * credential is 401, so gallery rows are inserted later by hand or via the
 * admin CMS). getPublishedVideos() merges these in, deduped by file path,
 * so new videos show in the gallery with full SEO from the moment the
 * files deploy. Once a matching DB row exists, the DB row wins.
 */
export interface LocalVideoSeo {
  niche: string;
  channel: string;
  title: string;
  description: string;
  posterAlt: string;
}

/** Keyed by the exact public file path, e.g. "/videos/demo-pharmacy-whatsapp.mp4". */
export const videoSeoMeta: Record<string, LocalVideoSeo> = {
  "/videos/demo-pharmacy-whatsapp.mp4": {
    niche: "Pharmacy",
    channel: "WhatsApp",
    title: "Pharmacy AI WhatsApp Demo — Never Miss Another Prescription",
    description:
      "Watch Rhea, a demo AI WhatsApp agent for pharmacies, confirm prescription refills in seconds, answer opening-hours and medicine-stock questions instantly, and arrange home delivery around the clock. This 30-second demo shows WhatsApp automation running a pharmacy's customer service 24/7 — instant answers, zero missed refill requests, and staff free to focus on care instead of the inbox. Want one for your pharmacy? Get a free custom demo built around your medicines, opening hours, and delivery flow.",
    posterAlt: "Pharmacy AI WhatsApp agent demo — never miss another prescription",
  },
  "/videos/demo-lawfirm-website.mp4": {
    niche: "Law Firm",
    channel: "Website",
    title: "Law Firm AI Website Demo — Capture Every Case Lead",
    description:
      "Meet Sage, a demo AI website chatbot for law firms, greeting visitors after hours, answering practice-area questions, and capturing case details as qualified leads straight into the intake flow. This 30-second demo shows website chatbot automation turning midnight visitors into booked consultations — no enquiry ever waits for office hours. Want one for your firm? Get a free custom demo built around your practice areas and client intake process.",
    posterAlt: "Law firm AI website chatbot demo — capture every case lead",
  },
};
