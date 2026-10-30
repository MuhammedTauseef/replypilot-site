"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Wayfinding bar for the signed-in user area. Sits under the site
 * header on every /dashboard/* and /onboarding/* page so a signed-in
 * user can always get to the website homepage, back to the dashboard
 * overview, and across to the other user pages (agent, billing,
 * profile…) — the pages previously had no navigation at all.
 */
const LINKS: { label: string; href: string }[] = [
  // "Home" is the public website homepage — the owner's explicit ask:
  // a clearly-labelled way out of the account area, first in the bar,
  // visible at every width without opening the hamburger menu.
  { label: "Home", href: "/" },
  { label: "Overview", href: "/dashboard" },
  { label: "My agent", href: "/dashboard/client" },
  { label: "Agent settings", href: "/dashboard/client/agent" },
  { label: "Conversations", href: "/dashboard/client/conversations" },
  { label: "Documents", href: "/dashboard/client/documents" },
  { label: "Billing", href: "/dashboard/client/billing" },
  { label: "Profile", href: "/dashboard/client/profile" },
];

export default function DashboardSubNav() {
  const pathname = usePathname();

  return (
    <nav className="dash-subnav" aria-label="Your account">
      <div className="wrap dash-subnav-inner">
        {LINKS.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`dash-subnav-link${active ? " active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              {l.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
