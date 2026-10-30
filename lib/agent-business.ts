/**
 * Business details the client enters at onboarding (business name, industry,
 * services, FAQs, WhatsApp number…). They live on the `clients` row and are
 * baked into `agent_config.system_prompt`, which the live agent chat reads —
 * so editing them must rebuild the prompt, exactly like onboarding does.
 *
 * This module holds the pure logic (sanitising + prompt building + config
 * merge) so it can be unit-tested without a database. Sanitising caps mirror
 * app/api/onboarding/route.ts exactly.
 */

export interface ServiceItem {
  name: string;
  price: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface BusinessFields {
  business_name: string;
  industry: string;
  website: string;
  business_description: string;
  whatsapp_number: string;
  services: ServiceItem[];
  faqs: FaqItem[];
}

const str = (v: unknown, max: number): string =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

/**
 * Validate + sanitise a business-fields payload. Returns the clean fields,
 * or an error message when a required field is missing.
 */
export function sanitizeBusinessFields(
  body: Record<string, unknown>
): { fields: BusinessFields } | { error: string } {
  const arr = (v: unknown, maxItems: number): unknown[] =>
    Array.isArray(v) ? v.slice(0, maxItems) : [];

  const fields: BusinessFields = {
    business_name: str(body.business_name, 120),
    industry: str(body.industry, 120),
    website: str(body.website, 200),
    business_description: str(body.business_description, 2000),
    whatsapp_number: str(body.whatsapp_number, 40),
    services: arr(body.services, 50)
      .map((s) => {
        const item = (s ?? {}) as Record<string, unknown>;
        return { name: str(item.name, 120), price: str(item.price, 60) };
      })
      .filter((s) => s.name || s.price),
    faqs: arr(body.faqs, 50)
      .map((f) => {
        const item = (f ?? {}) as Record<string, unknown>;
        return { q: str(item.q, 300), a: str(item.a, 1000) };
      })
      .filter((f) => f.q || f.a),
  };

  if (!fields.business_name || !fields.industry || !fields.whatsapp_number) {
    return {
      error: "Business name, industry, and WhatsApp number are required.",
    };
  }
  return { fields };
}

/** The agent system prompt — template identical to onboarding's builder. */
export function buildSystemPrompt(data: BusinessFields): string {
  const servicesText = data.services
    .map((s) => `- ${s.name}${s.price ? ` (${s.price})` : ""}`)
    .join("\n");
  const faqsText = data.faqs.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n");

  return `You are the AI assistant for ${data.business_name}, a ${data.industry} business.
${data.business_description ? `About: ${data.business_description}` : ""}
${data.website ? `Website: ${data.website}` : ""}

SERVICES & PRICES:
${servicesText || "Ask the business for details."}

FREQUENTLY ASKED QUESTIONS:
${faqsText || "Answer helpfully based on the business info above."}

RULES:
- Be warm, friendly, and concise — like a helpful team member.
- Answer ONLY from the business info above. Never invent prices, services, or policies.
- If you don't know something, say so honestly and offer to have the team follow up.
- When someone wants to book or buy, collect their name and contact, confirm details, and say the team will confirm shortly.
- Keep replies short (2-4 sentences) unless the customer asks for detail.
- Never mention you are AI unless asked.`;
}

/**
 * Fold edited business fields into an existing agent_config: the prompt,
 * services and FAQs are rebuilt from the new fields, while unrelated keys
 * the settings page manages separately (agent_name, greeting, tone,
 * language, business_hours, auto_reply, …) are preserved untouched.
 */
export function mergeBusinessIntoConfig(
  existing: Record<string, unknown>,
  fields: BusinessFields
): Record<string, unknown> {
  return {
    ...existing,
    business_name: fields.business_name,
    industry: fields.industry,
    system_prompt: buildSystemPrompt(fields),
    whatsapp_number: fields.whatsapp_number,
    services: fields.services,
    faqs: fields.faqs,
    generated_at: new Date().toISOString(),
  };
}

/** A clients row (or any object carrying the same fields) as a prompt source. */
export interface ClientPromptSource {
  business_name?: unknown;
  industry?: unknown;
  website?: unknown;
  business_description?: unknown;
  whatsapp_number?: unknown;
  services?: unknown;
  faqs?: unknown;
  agent_config?: Record<string, unknown> | null;
}

/**
 * Business fields from a clients row: row columns first, agent_config as
 * fallback — the same precedence /api/agent-config uses. Values are
 * re-sanitised with the same caps as sanitizeBusinessFields.
 */
export function businessFieldsFromClient(
  client: ClientPromptSource
): BusinessFields {
  const cfg = (client.agent_config ?? {}) as Record<string, unknown>;
  const pick = (row: unknown, fromCfg: unknown, max: number): string =>
    str(typeof row === "string" && row.trim() ? row : fromCfg, max);
  const list = (row: unknown, fromCfg: unknown): unknown[] =>
    Array.isArray(row) ? row : Array.isArray(fromCfg) ? fromCfg : [];

  return {
    business_name: pick(client.business_name, cfg.business_name, 120),
    industry: pick(client.industry, cfg.industry, 120),
    website: pick(client.website, cfg.website, 200),
    business_description: pick(
      client.business_description,
      cfg.business_description,
      2000
    ),
    whatsapp_number: pick(client.whatsapp_number, cfg.whatsapp_number, 40),
    services: list(client.services, cfg.services)
      .map((s) => {
        const item = (s ?? {}) as Record<string, unknown>;
        return { name: str(item.name, 120), price: str(item.price, 60) };
      })
      .filter((s) => s.name || s.price),
    faqs: list(client.faqs, cfg.faqs)
      .map((f) => {
        const item = (f ?? {}) as Record<string, unknown>;
        return { q: str(item.q, 300), a: str(item.a, 1000) };
      })
      .filter((f) => f.q || f.a),
  };
}

/**
 * The system prompt a client's preview/live chat should run with:
 *  1. the stored agent_config.system_prompt, when one exists (unchanged
 *     behaviour for fully generated agents);
 *  2. otherwise — e.g. after "Start again" reset agent_config to {} while
 *     the business details stayed saved — a prompt rebuilt on the fly from
 *     those saved business fields, so the preview still answers as the
 *     client's own business instead of a generic assistant;
 *  3. null when neither exists (caller falls back to its generic prompt).
 */
export function resolveAgentSystemPrompt(
  client: ClientPromptSource
): string | null {
  const cfg = (client.agent_config ?? {}) as Record<string, unknown>;
  const stored = cfg.system_prompt;
  if (typeof stored === "string" && stored.trim()) return stored;

  const fields = businessFieldsFromClient(client);
  if (!fields.business_name || !fields.industry || !fields.whatsapp_number) {
    return null;
  }
  return buildSystemPrompt(fields);
}
