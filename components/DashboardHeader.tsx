import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import MobileNav from "@/components/MobileNav";
import AuthNav from "@/components/AuthNav";

/**
 * Site header for the signed-in user area (/dashboard/*).
 * Same chrome as the public pages (PageHeader / homepage header):
 * brand → home, the public nav destinations, the contact CTA,
 * plus AuthNav (Dashboard + Sign out for the signed-in user).
 * Reuses .site-header/.site-nav styles from globals.css, so the
 * responsive behaviour matches the rest of the site — below 1400px
 * the text links hand over to the MobileNav hamburger.
 */
export default function DashboardHeader() {
  return (
    <header className="site-header">
      <div className="wrap">
        <Link className="brand" href="/" aria-label="ReplyPilot home">
          <span className="brand-mark">R</span>REPLYPILOT
        </Link>
        <nav className="site-nav" aria-label="Primary navigation">
          <Link className="nav-link" href="/">
            Home
          </Link>
          <Link className="nav-link" href="/blog">
            Blog
          </Link>
          <Link className="nav-link" href="/videos">
            Videos
          </Link>
          <Link className="nav-link" href="/#pricing">
            Pricing
          </Link>
          <AuthNav />
          <Link className="nav-cta" href="/#contact">
            Get Your AI Agent
          </Link>
          <ThemeToggle />
          <MobileNav />
        </nav>
      </div>
    </header>
  );
}
