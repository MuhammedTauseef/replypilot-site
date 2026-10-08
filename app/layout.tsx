import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReplyPilot — AI Automation by Muhammad Tauseef",
  description:
    "ReplyPilot builds practical AI sales agents and workflow automations for growing businesses. Get your AI agent for $249. Free custom demo.",
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
      "Turn your website into an AI sales & support agent. Get your AI agent for $249.",
    type: "website",
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
      </head>
      <body>{children}</body>
    </html>
  );
}
