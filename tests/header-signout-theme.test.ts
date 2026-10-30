import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const root = join(__dirname, "..");
function src(p: string): string {
  return readFileSync(join(root, p), "utf-8");
}

/** Body of the first CSS rule whose selector matches `selector` exactly. */
function ruleBody(css: string, selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = css.match(new RegExp(escaped + "\\{([^}]*)\\}"));
  if (!m) throw new Error(`CSS rule not found: ${selector}`);
  return m[1];
}

/**
 * Regression guard for the 2026-10-30 owner report: "Sign out button's
 * colour is not visible in night mode."
 *
 * Root cause: the header sign-out is a <button class="nav-link">, but the
 * resting text colour was only ever declared for anchors
 * (`.site-nav a.nav-link{color:var(--muted)}`). The button rule set
 * background/border/font/padding and NO colour, so the button fell back
 * to the UA `ButtonText` colour — near-black, because the site never
 * declares `color-scheme`. On the dark header that is black on
 * near-black (measured 1.12:1 in Chromium); in light mode the same
 * fallback happens to be visible, which is why only night mode broke.
 * The dark-mode hover rule already existed, so the button only appeared
 * while hovered. The fix gives the button the anchors' exact treatment:
 * var(--muted) resting (flips light in dark mode), var(--navy) hover,
 * var(--gold-soft) dark hover.
 *
 * The mobile-menu sign-out was checked the same day and is NOT affected:
 * its rule declares color:var(--ink), which flips with the theme
 * (measured 14.75:1 dark / 17.74:1 light) — guarded here so it stays so.
 */
describe("header sign-out button keeps a theme-aware colour", () => {
  const css = src("app/globals.css");

  it("desktop sign-out button declares the anchors' resting colour var(--muted)", () => {
    expect(ruleBody(css, ".site-nav button.nav-link")).toContain("color:var(--muted)");
  });

  it("desktop sign-out button declares the anchors' light hover colour var(--navy)", () => {
    expect(ruleBody(css, ".site-nav button.nav-link:hover")).toContain("color:var(--navy)");
  });

  it("desktop sign-out button keeps the dark hover colour var(--gold-soft)", () => {
    expect(ruleBody(css, '[data-theme="dark"] .site-nav button.nav-link:hover')).toContain(
      "color:var(--gold-soft)"
    );
  });

  it("mobile-menu sign-out keeps its explicit theme colour var(--ink)", () => {
    expect(ruleBody(css, '.mobile-menu button[role="menuitem"]')).toContain("color:var(--ink)");
  });
});

/**
 * Regression guard for the 2026-10-30 admin QA finding: the /admin top
 * navigation linked Blog posts, Buffer Queue, Videos, Demos, Settings,
 * Pages and Payments but not FAQs or Users, although /admin/faqs and
 * /admin/users exist and load fine by direct URL.
 */
describe("admin top navigation links every admin section", () => {
  const page = src("app/admin/page.tsx");

  it("links to FAQs", () => {
    expect(page).toContain('href="/admin/faqs"');
  });

  it("links to Users", () => {
    expect(page).toContain('href="/admin/users"');
  });
});
