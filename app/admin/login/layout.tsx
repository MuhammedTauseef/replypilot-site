import type { Metadata } from "next";

/**
 * /admin/login metadata — the login page is a client component and cannot
 * export metadata itself; without this layout it inherited the homepage's
 * title + description verbatim (audit 2026-10-30).
 */
export const metadata: Metadata = {
  title: "Admin Sign In — ReplyPilot",
  description: "Sign in to the ReplyPilot admin panel.",
  robots: { index: false, follow: false },
};

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
