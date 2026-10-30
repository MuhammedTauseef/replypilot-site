import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  mergeBusinessIntoConfig,
  sanitizeBusinessFields,
} from "@/lib/agent-business";

async function getOwnClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in.", status: 401 } as const;
  const { data: client } = await supabase
    .from("clients")
    .select(
      "id, agent_config, agent_status, business_name, industry, website, business_description, whatsapp_number, services, faqs"
    )
    .eq("user_id", user.id)
    .single();
  if (!client) return { error: "No client profile.", status: 404 } as const;
  return { supabase, client } as const;
}

interface ClientRow {
  id: string;
  agent_config?: Record<string, unknown> | null;
  agent_status?: string;
  business_name?: string | null;
  industry?: string | null;
  website?: string | null;
  business_description?: string | null;
  whatsapp_number?: string | null;
  services?: unknown;
  faqs?: unknown;
}

/** The editable business fields, from the clients row (config as fallback). */
function businessOf(client: ClientRow) {
  const cfg = client.agent_config || {};
  return {
    business_name: client.business_name || (cfg.business_name as string) || "",
    industry: client.industry || (cfg.industry as string) || "",
    website: client.website || "",
    business_description: client.business_description || "",
    whatsapp_number: client.whatsapp_number || (cfg.whatsapp_number as string) || "",
    services: Array.isArray(client.services)
      ? client.services
      : Array.isArray(cfg.services)
        ? cfg.services
        : [],
    faqs: Array.isArray(client.faqs)
      ? client.faqs
      : Array.isArray(cfg.faqs)
        ? cfg.faqs
        : [],
  };
}

/** GET /api/agent-config — get own agent config (authenticated owner only). */
export async function GET() {
  const auth = await getOwnClient();
  if ("error" in auth)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const client = auth.client as ClientRow;
  return NextResponse.json({
    agent_config: client.agent_config || {},
    agent_status: client.agent_status || "draft",
    business: businessOf(client),
  });
}

/** PATCH /api/agent-config — update own agent config (authenticated owner only).
 * Allowed keys: agent_name, greeting, tone, language, business_hours, auto_reply.
 * agent_status can only move draft→preview→ready (never directly to live/building).
 */
const ALLOWED_KEYS = ["agent_name", "greeting", "tone", "language", "business_hours", "auto_reply"] as const;
const ALLOWED_TONES = ["friendly", "professional", "playful", "formal"];
const ALLOWED_STATUS = ["draft", "preview", "ready"];

export async function PATCH(req: NextRequest) {
  const auth = await getOwnClient();
  if ("error" in auth)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const current = ((auth.client as { agent_config?: Record<string, unknown> }).agent_config || {});
  let next: Record<string, unknown> = { ...current };

  for (const key of ALLOWED_KEYS) {
    if (body[key] !== undefined) {
      const val = String(body[key]).trim().slice(0, 1000);
      if (key === "tone" && !ALLOWED_TONES.includes(val.toLowerCase())) {
        return NextResponse.json(
          { error: `tone must be one of: ${ALLOWED_TONES.join(", ")}` },
          { status: 400 }
        );
      }
      next[key] = val;
    }
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  // Business details (the onboarding fields) are editable here too: they are
  // written back to the clients columns AND folded into agent_config with a
  // rebuilt system prompt, so the live agent answers from the new details.
  const BUSINESS_KEYS = [
    "business_name",
    "industry",
    "website",
    "business_description",
    "whatsapp_number",
    "services",
    "faqs",
  ] as const;
  if (BUSINESS_KEYS.some((k) => body[k] !== undefined)) {
    const result = sanitizeBusinessFields(body);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    const f = result.fields;
    next = mergeBusinessIntoConfig(next, f);
    updates.business_name = f.business_name;
    updates.industry = f.industry;
    updates.website = f.website || null;
    updates.business_description = f.business_description || null;
    updates.whatsapp_number = f.whatsapp_number;
    updates.services = f.services;
    updates.faqs = f.faqs;
  }

  updates.agent_config = next;

  // Status transitions: only forward within draft→preview→ready.
  if (body.agent_status !== undefined) {
    const target = String(body.agent_status);
    const order = ["draft", "preview", "ready"];
    const currentStatus = (auth.client as { agent_status?: string }).agent_status || "draft";
    if (!ALLOWED_STATUS.includes(target)) {
      return NextResponse.json({ error: "Invalid agent_status." }, { status: 400 });
    }
    if (order.indexOf(target) < order.indexOf(currentStatus)) {
      return NextResponse.json({ error: "Cannot move agent status backwards." }, { status: 400 });
    }
    updates.agent_status = target;
  }

  const { error } = await auth.supabase
    .from("clients")
    .update(updates)
    .eq("id", (auth.client as { id: string }).id);

  if (error) {
    console.error("[agent-config] update failed:", error.message.slice(0, 200));
    return NextResponse.json({ error: "Failed to save configuration." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, agent_config: next, agent_status: updates.agent_status });
}

/**
 * DELETE /api/agent-config — reset the caller's own agent configuration:
 * clears agent_config and returns the status to draft. Business details on
 * the clients row are kept, so the settings page can rebuild the agent from
 * them; documents, conversations and billing are not touched.
 */
export async function DELETE() {
  const auth = await getOwnClient();
  if ("error" in auth)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { error } = await auth.supabase
    .from("clients")
    .update({
      agent_config: {},
      agent_status: "draft",
      updated_at: new Date().toISOString(),
    })
    .eq("id", (auth.client as { id: string }).id);

  if (error) {
    console.error("[agent-config] reset failed:", error.message.slice(0, 200));
    return NextResponse.json({ error: "Failed to reset configuration." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
