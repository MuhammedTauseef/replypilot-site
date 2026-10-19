import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import CookieConsent from "@/components/CookieConsent";
import { safeJsonLd } from "@/lib/json-ld";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://replypilot-site.vercel.app"),
  title: "ReplyPilot — AI Automation by Muhammad Tauseef",
  description:
    "ReplyPilot builds practical AI sales agents and workflow automations for growing businesses. WhatsApp, Instagram & website agents. Free custom demo.",
  verification: {
    google: "jXx7jWarPskM3UN7e2YihwpzUjZAzKJim_fvKRz-kw8",
  },
  keywords: [
    "AI sales agent",
    "AI agent for small business",
    "WhatsApp automation",
    "Instagram DM automation",
    "workflow automation",
    "n8n",
    "AI chatbot for business",
    "ReplyPilot",
    "Muhammad Tauseef",
  ],
  openGraph: {
    title: "ReplyPilot — AI Automation by Muhammad Tauseef",
    description:
      "Turn your website into an AI sales & support agent. Free custom demo.",
    type: "website",
    url: "https://replypilot-site.vercel.app",
    siteName: "ReplyPilot",
    images: [
      {
        url: "https://replypilot-site.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ReplyPilot — AI Sales Agents for Small Business",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ReplyPilot — AI Automation by Muhammad Tauseef",
    description:
      "Turn your website into an AI sales & support agent. Free custom demo.",
    images: ["https://replypilot-site.vercel.app/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("replypilot-theme");if(!t){t="dark"}document.documentElement.dataset.theme=t}catch(e){}})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  name: "ReplyPilot",
                  alternateName:
                    "ReplyPilot AI Agents for Small Business Messaging",
                  url: "https://replypilot-site.vercel.app/",
                  // No logo field: no square logo asset exists (logo.png is a 404).
                  // Do not re-add without a real, publicly reachable logo file.
                  description:
                    "ReplyPilot builds AI sales agents and workflow automations for small businesses: automated WhatsApp replies, Instagram DM handling, and website chat agents that qualify leads, follow up, book appointments, and hand off to humans. A product of independent founder Muhammad Tauseef. Distinct from the unrelated ReplyPilot Chrome extension for drafting social media replies.",
                  founder: { "@type": "Person", name: "Muhammad Tauseef" },
                  foundingDate: "2024",
                  knowsAbout: [
                    "AI sales agents",
                    "WhatsApp business automation",
                    "Instagram DM automation",
                    "AI chatbots for small business",
                    "lead qualification automation",
                    "appointment booking automation",
                  ],
                  sameAs: [
                    "https://www.linkedin.com/in/muhammadtauseef9",
                  ],
                },
                {
                  "@type": "WebSite",
                  name: "ReplyPilot",
                  url: "https://replypilot-site.vercel.app/",
                  inLanguage: "en",
                },
              ],
            }),
          }}
        />
      </head>
      <body>
        {children}
        <CookieConsent />
        <Analytics />
      </body>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-1QP894DHB3"
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
// Consent Mode v2: default denied until the visitor chooses.
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied'
});
try {
  if (localStorage.getItem('replypilot-cookie-consent') === 'accepted') {
    gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted'
    });
  }
} catch (e) {}
gtag('js', new Date());
gtag('config', 'G-1QP894DHB3');`}
      </Script>
    </html>
  );
}
