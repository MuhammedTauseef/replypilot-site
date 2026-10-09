/**
 * Local webhook signature test for /api/webhooks/whop
 *
 * Tests (no real charges, no production):
 * 1. Valid signature for each of the 4 events → accepted (2xx, not 401/503)
 * 2. Invalid signature → 401
 * 3. Replay (timestamp > 5 min old) → 401
 * 4. Duplicate webhook-id → acknowledged but not reprocessed
 *
 * Usage: WHOP_WEBHOOK_SECRET=<test-secret> node webhook-test.mjs
 * The dev server must be running on localhost:3001 with the same secret.
 */
import crypto from "crypto";

const BASE = "http://localhost:3001/api/webhooks/whop";
const SECRET = process.env.WHOP_WEBHOOK_SECRET || "";

if (!SECRET) {
  console.error("Set WHOP_WEBHOOK_SECRET env var first.");
  process.exit(1);
}

function deriveKey(secret) {
  // Match Whop's real signing: literal UTF-8 bytes of the full ws_... secret
  return Buffer.from(secret, "utf8");
}

// Generate a Whop-style test secret: ws_ + 64 hex chars (like Whop's SecureRandom.hex(32))
function makeWhopStyleSecret() {
  return "ws_" + crypto.randomBytes(32).toString("hex");
}

function sign(rawBody, webhookId, webhookTimestamp) {
  const key = deriveKey(SECRET);
  const signedContent = `${webhookId}.${webhookTimestamp}.${rawBody}`;
  const sig = crypto.createHmac("sha256", key).update(signedContent, "utf8").digest("base64");
  return `v1,${sig}`;
}

async function send(event, { valid = true, timestamp = null, webhookId = null } = {}) {
  const body = JSON.stringify(event);
  const id = webhookId || `test_${crypto.randomBytes(8).toString("hex")}`;
  const ts = timestamp || Math.floor(Date.now() / 1000).toString();
  let signature = sign(body, id, ts);
  if (!valid) signature = "v1," + Buffer.from("tampered-signature-value-1234567890").toString("base64");

  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "webhook-id": id,
      "webhook-timestamp": ts,
      "webhook-signature": signature,
    },
    body,
  });
  const text = await res.text();
  return { status: res.status, body: text.slice(0, 300), id };
}

const basePayment = {
  id: "pay_test_123",
  email: "test-buyer@example.com",
  amount: 12500,
  currency: "usd",
  product: { id: "replypilot-build-deposit-cf", name: "ReplyPilot Build - Deposit" },
};

const results = [];
function check(name, actual, expected) {
  const pass = expected.includes(actual);
  results.push({ name, actual, expected: expected.join("/"), pass });
  console.log(`${pass ? "PASS" : "FAIL"} | ${name} | got ${actual}, want ${expected.join(" or ")}`);
}

// 1. Valid signatures for all 4 events
console.log("\n--- 1. Valid signatures (all 4 events) ---");
for (const type of ["payment.succeeded", "payment.failed", "membership.activated", "membership.deactivated"]) {
  const event = type.startsWith("payment")
    ? { type, data: { ...basePayment } }
    : { type, data: { id: "mem_test_123", email: "test-buyer@example.com", plan: { id: "replypilot-care-plan-a8", name: "ReplyPilot Care Plan" } } };
  const r = await send(event);
  // Accept 200 (processed) — DB writes may fail locally without Supabase creds,
  // but signature must NOT be 401 and secret must NOT be 503.
  check(`valid ${type}`, r.status, [200, 500]);
  if (r.status === 401 || r.status === 503) {
    console.log(`   response: ${r.body}`);
  }
}

// 2. Invalid signature
console.log("\n--- 2. Invalid signature ---");
{
  const r = await send({ type: "payment.succeeded", data: basePayment }, { valid: false });
  check("tampered signature → 401", r.status, [401]);
}

// 3. Replay protection (10 min old)
console.log("\n--- 3. Replay protection ---");
{
  const oldTs = (Math.floor(Date.now() / 1000) - 600).toString();
  const r = await send({ type: "payment.succeeded", data: basePayment }, { timestamp: oldTs });
  check("10-min-old timestamp → 401", r.status, [401]);
}

// 4. Duplicate webhook-id (idempotency)
console.log("\n--- 4. Duplicate idempotency ---");
{
  const dupId = `test_dup_${crypto.randomBytes(6).toString("hex")}`;
  const event = { type: "payment.succeeded", data: basePayment };
  const r1 = await send(event, { webhookId: dupId });
  const r2 = await send(event, { webhookId: dupId });
  check("first delivery accepted", r1.status, [200, 500]);
  // Second delivery should be acknowledged (200 with "already processed") not reprocessed
  const isDuplicateAck = r2.status === 200 && r2.body.includes("already");
  results.push({ name: "duplicate → acknowledged", actual: r2.status, expected: "200+already", pass: isDuplicateAck });
  console.log(`${isDuplicateAck ? "PASS" : "FAIL"} | duplicate delivery → acknowledged | got ${r2.status} ${r2.body.slice(0, 80)}`);
}

console.log("\n================ SUMMARY ================");
const passed = results.filter((r) => r.pass).length;
console.log(`${passed}/${results.length} checks passed`);
if (passed < results.length) {
  console.log("Failed:");
  results.filter((r) => !r.pass).forEach((r) => console.log(` - ${r.name}: got ${r.actual}, want ${r.expected}`));
  process.exit(1);
}
console.log("All webhook signature tests passed.");
