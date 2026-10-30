import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const root = join(__dirname, "..");
function src(p: string): string {
  return readFileSync(join(root, p), "utf-8");
}
/** Remove block + line comments so doc text can't trip the call-pattern checks. */
function codeOnly(p: string): string {
  return src(p)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

/**
 * Regression guard for the 2026-10-30 repair.
 *
 * The bundle's destructive client controls gated their actions on the
 * browser-native `confirm()` dialog. In environments that never present
 * JS modal dialogs (browser automation, Android WebViews without a
 * JS-dialog handler, cross-origin iframes) `confirm()` returns `false`
 * invisibly, so Delete/Reset clicks looked completely dead in a real
 * signed-in browser while unit tests of the API layer kept passing.
 * Destructive client actions must use the in-page ConfirmDialog instead.
 */
describe("client destructive actions use the in-page ConfirmDialog, never native confirm()", () => {
  const gatedFiles = [
    "app/dashboard/client/documents/page.tsx",
    "app/dashboard/client/agent/page.tsx",
    "app/dashboard/client/conversations/page.tsx",
    "components/DeleteEnquiryButton.tsx",
  ];

  for (const file of gatedFiles) {
    it(`${file} has no native confirm gate and renders ConfirmDialog`, () => {
      const code = codeOnly(file);
      expect(code).not.toMatch(/(?<![\w.])confirm\s*\(/);
      expect(code).not.toContain("window.confirm");
      expect(src(file)).toContain("ConfirmDialog");
    });
  }

  it("ConfirmDialog is a DOM dialog (alertdialog), not a native-dialog wrapper", () => {
    const code = codeOnly("components/ConfirmDialog.tsx");
    expect(code).toContain('role="alertdialog"');
    expect(code).not.toMatch(/(?<![\w.])confirm\s*\(/);
    expect(code).not.toContain("window.confirm");
    // Both a safe cancel path and the destructive confirm path exist.
    expect(code).toContain("Cancel");
    expect(code).toContain("onConfirm");
    expect(code).toContain("onCancel");
  });
});

describe("client sign-out lands on /login from the dashboard header only", () => {
  it("AuthNav and MobileNav default to / but accept a redirect override", () => {
    for (const file of ["components/AuthNav.tsx", "components/MobileNav.tsx"]) {
      const code = src(file);
      expect(code).toContain('signOutRedirect = "/"');
      expect(code).toContain("window.location.href = signOutRedirect");
    }
  });

  it("DashboardHeader passes /login; public headers keep the default", () => {
    expect(src("components/DashboardHeader.tsx")).toContain('signOutRedirect="/login"');
    expect(src("components/PageHeader.tsx")).not.toContain("signOutRedirect");
    expect(src("app/page.tsx")).not.toContain("signOutRedirect");
  });
});
