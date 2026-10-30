/**
 * Whop checkout links for ReplyPilot payments.
 *
 * The user creates these manually in the Whop dashboard
 * (Developer → API Keys path was abandoned after 3 rejected keys).
 * When a new link arrives, paste it here and redeploy.
 */

export const WHOP_CHECKOUT = {
  /**
   * ReplyPilot Build — Deposit: one-time $125 (50% upfront).
   * History: the user first created this plan as RECURRING $125/month by
   * mistake and switched it to ONE-TIME on 2026-10-08. Re-verified live
   * 2026-10-30 before wiring the billing-page button: the public product
   * page shows a bare "$125" (the recurring Care Plan page shows
   * "$99 / month" by contrast), so the plan is one-time and safe to wire.
   */
  deposit:
    "https://whop.com/replypilot-site-ea3d/replypilot-build-deposit-cf",
  /** ReplyPilot Build — Go-Live: one-time $124 (50% on approval) */
  goLive:
    "https://whop.com/replypilot-site-ea3d/replypilot-build-go-live-01",
  /** ReplyPilot Care Plan: recurring $99/month */
  carePlan:
    "https://whop.com/replypilot-site-ea3d/replypilot-care-plan-a8",
} as const;

export type CheckoutKey = keyof typeof WHOP_CHECKOUT;

/** True when the link is filled in and safe to render. */
export function hasCheckout(key: CheckoutKey): boolean {
  return WHOP_CHECKOUT[key].length > 0;
}
