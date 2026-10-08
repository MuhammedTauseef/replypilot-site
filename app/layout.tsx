import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReplyPilot — AI Automation by Muhammad Tauseef",
  description:
    "ReplyPilot builds practical AI sales agents and workflow automations for growing businesses. Free custom demo.",
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
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  name: "ReplyPilot",
                  url: "https://replypilot-site.vercel.app/",
                  description:
                    "ReplyPilot builds practical AI sales agents and workflow automations for growing businesses.",
                  founder: { "@type": "Person", name: "Muhammad Tauseef" },
                  sameAs: [],
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
      <body>{children}</body>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-1QP894DHB3"
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-1QP894DHB3');`}
      </Script>
    </html>
  );
}
