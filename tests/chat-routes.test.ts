import { describe, expect, it, vi, beforeEach } from "vitest";
import { readFileSync } from "fs";
import path from "path";

/**
 * Chat-route regressions (2026-10-30):
 *  1. Both chat routes aborted slow-but-alive gemini-3.8-flash replies at
 *     30s while Google-side overload made 30–50s responses routine. The
 *     ceiling is now 55s inside an explicit maxDuration = 60.
 *  2. The preview chat must keep answering as the client's own business
 *     after "Start again" emptied agent_config — the route resolves its
 *     system prompt through lib/agent-business (stored prompt wins;
 *     otherwise rebuilt from the saved business row).
 */

const root = path.resolve(__dirname, "..");
const read = (p: string) => readFileSync(path.join(root, p), "utf8");

describe("chat route timeout ceilings", () => {
  for (const file of ["app/api/chat/route.ts", "app/api/onboarding/chat/route.ts"]) {
    it(`${file}: 55s abort inside maxDuration = 60, no 30s ceiling left`, () => {
      const src = read(file);
      expect(src).toContain("controller.abort(), 55_000");
      expect(src).toContain("export const maxDuration = 60");
      expect(src).not.toContain("30_000");
    });
  }

  it("onboarding chat resolves its prompt via lib/agent-business", () => {
    const src = read("app/api/onboarding/chat/route.ts");
    expect(src).toContain("resolveAgentSystemPrompt");
    expect(src).toContain("business_name, industry, website, business_description, whatsapp_number, services, faqs");
  });

  it("preview route fills identity from the clients row when config is empty", () => {
    const src = read("app/api/onboarding/preview/route.ts");
    expect(src).toContain("cfg.business_name = data.business_name");
    expect(src).toContain("cfg.greeting");
  });

  it("billing page offers the $125 deposit BEFORE the $124 go-live balance", () => {
    // The build is sold as deposit-first ($125 upfront, $124 on go-live);
    // the billing page previously rendered only the go-live card, so a
    // new unpaid client could never pay the deposit the funnel requires.
    const src = read("app/dashboard/client/billing/page.tsx");
    expect(src).toContain('linkKey="deposit"');
    expect(src).toContain("Pay $125 deposit");
    expect(src.indexOf('linkKey="deposit"')).toBeLessThan(
      src.indexOf('linkKey="goLive"')
    );
  });
});

/* ---- functional: the onboarding chat route with stubbed boundaries ---- */

const state = vi.hoisted(() => ({
  clientRow: null as Record<string, unknown> | null,
  lastGenerateArgs: null as Record<string, unknown> | null,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: "user-1" } } }) },
    from: () => ({
      select: () => ({
        eq: () => ({ single: async () => ({ data: state.clientRow }) }),
      }),
    }),
  }),
}));

vi.mock("@ai-sdk/google", () => ({
  createGoogleGenerativeAI: () => (model: string) => ({ modelId: model }),
}));

vi.mock("ai", () => ({
  generateText: async (args: Record<string, unknown>) => {
    state.lastGenerateArgs = args;
    return { text: "Stub reply from the agent." };
  },
}));

import { POST } from "@/app/api/onboarding/chat/route";
import { NextRequest } from "next/server";

function chatReq() {
  return new NextRequest("http://local/api/onboarding/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "How much is teeth whitening?", history: [] }),
  });
}

const businessRow = {
  business_name: "Test Dental Clinic",
  industry: "dental clinic",
  website: "",
  business_description: "",
  whatsapp_number: "+92 300 1112222",
  services: [{ name: "Teeth whitening", price: "$120" }],
  faqs: [],
};

describe("POST /api/onboarding/chat — empty-config state", () => {
  beforeEach(() => {
    state.lastGenerateArgs = null;
  });

  it("answers with a prompt rebuilt from the saved business row when agent_config is {}", async () => {
    state.clientRow = { ...businessRow, agent_config: {} };
    const res = await POST(chatReq());
    const body = await res.json();
    expect(body.reply).toBe("Stub reply from the agent.");
    const system = String(state.lastGenerateArgs?.system ?? "");
    expect(system).toContain("Test Dental Clinic");
    expect(system).toContain("Teeth whitening");
    expect(system).toContain("$120");
  });

  it("uses the stored system_prompt verbatim when a config exists (no behaviour change)", async () => {
    state.clientRow = {
      ...businessRow,
      agent_config: { system_prompt: "STORED PROMPT — do not rebuild" },
    };
    const res = await POST(chatReq());
    expect(res.status).toBe(200);
    expect(state.lastGenerateArgs?.system).toBe("STORED PROMPT — do not rebuild");
  });
});
