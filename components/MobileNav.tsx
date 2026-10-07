"use client";

import { useEffect, useState } from "react";

/**
 * Mobile hamburger menu (3 lines). Opens a dropdown panel with all the
 * important links — same destinations as the footer — so phone visitors
 * can reach everything without scrolling to the bottom.
 */
const LINKS: { label: string; href: string; external?: boolean }[] = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Live demos", href: "#demos" },
  { label: "Process", href: "#process" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact form", href: "#contact" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/muhammadtauseef9", external: true },
  { label: "Previous portfolio", href: "https://tauseef-phi.vercel.app/", external: true },
  { label: "Log in", href: "/login" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open ]);

  return (
    <div className="mobile-nav">
      <button
        type="button"
        className={`burger${open ? " open" : ""}`}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>
      {open && (
        <div className="mobile-menu" role="menu">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              {...(l.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contact"
            className="btn btn-gold mobile-cta"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Get Your AI Agent — $200
          </a>
        </div>
      )}
    </div>
  );
}
