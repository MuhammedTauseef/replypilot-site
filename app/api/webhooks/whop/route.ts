import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

/**
 * Whop webhook receiver — payment verification with zero compromise.
 *
 * Security:
 * - Every request is signature-verified using the Standard Webhooks spec
 *   (HMAC-SHA256 over "{webhook-id}.{webhook-timestamp}.{raw_body}").
 * - Replay protection: events older than 5 minutes are rejected.
 * - Idempotency: webhook-id is stored; duplicates are acknowledged but not reprocessed.
 * - Service-role client is used ONLY here (server-side), never exposed.
 *
 * Setup:
 * 1. Whop Dashboard → Developer → Webhooks → Create webhook
 *    URL: https://replypilot-site.vercel.app/api/webhooks/whop
 *    Events: payment.succeeded, payment.failed, membership.activated,
 *            membership.deactivated, invoice.paid
 * 2. Copy the webhook secret → Vercel env var WHOP_WEBHOOK_SECRET
 */

const WEBHOOK_SECRET = process.env.WHOP_WEBHOOK_SECRET || "";
const REPLAY_TOLERANCE_MS = 5 * 60 * 1000;

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

/** Derive the HMAC key from a `ws_...` secret per Standard Webhooks spec. */
function deriveKey(secret: string): Buffer {
  const withoutPrefix = secret.startsWith("ws_") ? secret.slice(3) : secret;
  return Buffer.from(withoutPrefix, "base64");
}

function verifySignature(
  rawBody: string,
  webhookId: string,
  webhookTimestamp: string,
  webhookSignature: string
): boolean {
  if (!WEBHOOK_SECRET) return false;
  try {
    const ts = Number(webhookTimestamp);
    if (!Number.isFinite(ts)) return false;
    // Whop sends seconds; tolerate both seconds and ms
    const tsMs = ts < 1e12 ? ts * 1000 : ts;
    if (Math.abs(Date.now() - tsMs) > REPLAY_TOLERANCE_MS) return false;

    const key = deriveKey(WEBHOOK_SECRET);
    const signedContent = `${webhookId}.${webhookTimestamp}.${rawBody}`;
    const expected = crypto
      .createHmac("sha256", key)
      .update(signedContent, "utf8")
      .digest("base64");

    // Whop sends signatures as "v1,<base64>"
    const sigs = webhookSignature.split(" ").flatMap((s) => s.split(","));
    for (const sig of sigs) {
      const clean = sig.startsWith("v1,") ? sig.slice(3) : sig.startsWith("v1_") ? sig.slice(3) : sig;
      const a = Buffer.from(clean);
      const b = Buffer.from(expected);
      if (a.length === b.length && crypto.timingSafeEqual(a, b)) return true;
    }
    return false;
  } catch {
    return false;
  }
}

/** Map a Whop plan/product to our internal payment type + plan key. */
function classifyProduct(productId: string | undefined, amountCents: number): {
  type: "upfront" | "go_live" | "monthly";
  planKey: string;
} {
  const id = (productId || "").toLowerCase();
  // $99 recurring = care plan (monthly)
  if (id.includes("care") || amountCents === 9900) {
    return { type: "monthly", planKey: "care_plan" };
  }
  // $125 one-time = deposit (upfront)
  if (id.includes("deposit") || id.includes("ff") || amountCents === 12500) {
    return { type: "upfront", planKey: "build_deposit" };
  }
  // $124 one-time = go-live
  return { type: "go_live", planKey: "build_go_live" };
}

async function findClientByEmail(supabase: any, email: string) {
  const { data } = await supabase
    .from("clients")
    .select("id, user_id, business_name, subscription_status")
    .eq("user_id", (
      // look up via a direct email match on auth.users is not possible with anon key;
      // we match clients whose linked auth user has this email via a best-effort query.
      // Fallback: match on nothing and leave client_id null for manual review.
      ""
    ));
  return data;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const webhookId = request.headers.get("webhook-id") || "";
  const webhookTimestamp = request.headers.get("webhook-timestamp") || "";
  const webhookSignature = request.headers.get("webhook-signature") || "";

  const supabase = getServiceClient();

  let event: any = null;
  let eventType = "unknown";
  try {
    event = JSON.parse(rawBody);
    eventType = event.type || event.action || "unknown";
  } catch {
    // invalid JSON — log and reject
  }

  const signatureValid =
    webhookId &&
    webhookTimestamp &&
    webhookSignature &&
    event !== null &&
    verifySignature(rawBody, webhookId, webhookTimestamp, webhookSignature);

  // Always audit-log the delivery attempt
  try {
    await supabase.from("webhook_events").insert({
      provider: "whop",
      webhook_id: webhookId || `no-id-${Date.now()}`,
      event_type: eventType,
      payload: event || { raw: rawBody.slice(0, 2000) },
      signature_valid: !!signatureValid,
      processed: false,
    });
  } catch {
    // table may not exist yet — continue; signature check below still protects us
  }

  if (!signatureValid) {
    console.warn("[whop-webhook] Invalid signature", { webhookId, eventType });
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  // Idempotency: skip already-processed webhook IDs
  try {
    const { data: existing } = await supabase
      .from("webhook_events")
      .select("id, processed")
      .eq("provider", "whop")
      .eq("webhook_id", webhookId)
      .maybeSingle();
    if (existing?.processed) {
      return NextResponse.json({ ok: true, deduped: true });
    }
  } catch {
    /* continue */
  }

  try {
    const data = event.data || {};
    const buyerEmail =
      data.user?.email || data.email || data.customer_email || null;
    const buyerName =
      data.user?.name || data.user?.username || data.name || null;
    const whopPaymentId =
      data.id || data.payment_id || data.invoice_id || webhookId;
    const amountCents = Math.round(Number(data.amount || data.total || 0));
    // Whop amounts are usually in dollars; normalize common shapes
    const normalizedCents =
      amountCents > 0 && amountCents < 1000 ? amountCents * 100 : amountCents;
    const currency = (data.currency || "usd").toLowerCase();
    const productId =
      data.product_id || data.plan_id || data.line_items?.[0]?.product_id;

    const markProcessed = async (error?: string) => {
      try {
        await supabase
          .from("webhook_events")
          .update({ processed: !error, error: error || null })
          .eq("provider", "whop")
          .eq("webhook_id", webhookId);
      } catch {
        /* ignore */
      }
    };

    // --- Match buyer email to a client (best effort) ---
    let clientId: string | null = null;
    if (buyerEmail) {
      // clients.user_id -> auth.users; we resolve via service role
      const { data: users } = await supabase.auth.admin.listUsers();
      const match = (users?.users || []).find(
        (u: any) => (u.email || "").toLowerCase() === buyerEmail.toLowerCase()
      );
      if (match) {
        const { data: client } = await supabase
          .from("clients")
          .select("id")
          .eq("user_id", match.id)
          .maybeSingle();
        if (client) clientId = client.id;
      }
    }

    const normalizedType = eventType.replace(/\./g, "_").toLowerCase();

    if (
      normalizedType === "payment_succeeded" ||
      normalizedType === "payment_succeeded" ||
      normalizedType === "invoice_paid"
    ) {
      const { type, planKey } = classifyProduct(productId, normalizedCents);
      const { error } = await supabase.from("payments").upsert(
        {
          client_id: clientId,
          whop_payment_id: String(whopPaymentId),
          whop_event_id: webhookId,
          buyer_email: buyerEmail,
          buyer_name: buyerName,
          amount_cents: normalizedCents,
          currency,
          type,
          plan_key: planKey,
          status: "succeeded",
          paid_at: new Date().toISOString(),
          verified_at: new Date().toISOString(),
          metadata: data,
        },
        { onConflict: "whop_payment_id" }
      );
      if (error) throw error;

      // Activate subscription status for the matched client
      if (clientId) {
        const subStatus = type === "monthly" ? "active" : "active";
        await supabase
          .from("clients")
          .update({
            subscription_status: subStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("id", clientId);
      }

      await markProcessed();
      console.log("[whop-webhook] payment.succeeded recorded", {
        whopPaymentId,
        buyerEmail,
        clientId,
        amountCents: normalizedCents,
      });
      return NextResponse.json({ ok: true });
    }

    if (
      normalizedType === "payment_failed" ||
      normalizedType === "payment_canceled" ||
      normalizedType === "payment_cancelled"
    ) {
      const { type, planKey } = classifyProduct(productId, normalizedCents);
      await supabase.from("payments").upsert(
        {
          client_id: clientId,
          whop_payment_id: String(whopPaymentId),
          whop_event_id: webhookId,
          buyer_email: buyerEmail,
          buyer_name: buyerName,
          amount_cents: normalizedCents,
          currency,
          type,
          plan_key: planKey,
          status: "failed",
          verified_at: new Date().toISOString(),
          metadata: data,
        },
        { onConflict: "whop_payment_id" }
      );
      await markProcessed();
      return NextResponse.json({ ok: true });
    }

    if (normalizedType === "membership_activated") {
      const membershipId = data.id || data.membership_id;
      if (clientId) {
        await supabase.from("subscriptions").upsert(
          {
            client_id: clientId,
            whop_subscription_id: String(membershipId),
            whop_plan_id: String(productId || ""),
            buyer_email: buyerEmail,
            plan: "care",
            amount_cents: normalizedCents,
            currency,
            status: "active",
            current_period_start: new Date().toISOString(),
          },
          { onConflict: "whop_subscription_id" }
        );
        await supabase
          .from("clients")
          .update({
            subscription_status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("id", clientId);
      }
      await markProcessed();
      return NextResponse.json({ ok: true });
    }

    if (normalizedType === "membership_deactivated") {
      const membershipId = data.id || data.membership_id;
      if (membershipId) {
        await supabase
          .from("subscriptions")
          .update({ status: "cancelled" })
          .eq("whop_subscription_id", String(membershipId));
      }
      await markProcessed();
      return NextResponse.json({ ok: true });
    }

    // Unknown event — acknowledged, logged, not processed
    await markProcessed();
    return NextResponse.json({ ok: true, unhandled: eventType });
  } catch (err: any) {
    console.error("[whop-webhook] handler error", err?.message || err);
    try {
      await supabase
        .from("webhook_events")
        .update({ processed: false, error: String(err?.message || err) })
        .eq("provider", "whop")
        .eq("webhook_id", webhookId);
    } catch {
      /* ignore */
    }
    // Return 200 anyway? No — return 500 so Whop retries a genuinely failed fulfillment.
    return NextResponse.json({ error: "handler failed" }, { status: 500 });
  }
}

// Whop only sends POST; be explicit for other methods.
export async function GET() {
  return NextResponse.json({ ok: true, service: "whop-webhook" });
}
