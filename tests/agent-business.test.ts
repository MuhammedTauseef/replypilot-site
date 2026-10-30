import { describe, expect, it } from "vitest";
import {
  buildSystemPrompt,
  businessFieldsFromClient,
  mergeBusinessIntoConfig,
  resolveAgentSystemPrompt,
  sanitizeBusinessFields,
} from "@/lib/agent-business";

const validBody = {
  business_name: "Akbar Autos",
  industry: "Car repair",
  website: "https://akbar.example",
  business_description: "Family-run garage.",
  whatsapp_number: "+92 300 0000000",
  services: [
    { name: "Oil change", price: "Rs 5,000" },
    { name: "", price: "" },
  ],
  faqs: [{ q: "Do you open Sundays?", a: "No, closed Sundays." }],
};

describe("sanitizeBusinessFields", () => {
  it("accepts a valid payload and drops fully-empty rows", () => {
    const r = sanitizeBusinessFields(validBody);
    expect("fields" in r).toBe(true);
    if ("fields" in r) {
      expect(r.fields.services).toHaveLength(1);
      expect(r.fields.services[0].name).toBe("Oil change");
      expect(r.fields.faqs).toHaveLength(1);
    }
  });

  it("rejects a missing required field", () => {
    const r = sanitizeBusinessFields({ ...validBody, whatsapp_number: " " });
    expect("error" in r).toBe(true);
  });

  it("caps over-long strings like onboarding does", () => {
    const r = sanitizeBusinessFields({
      ...validBody,
      business_name: "x".repeat(500),
    });
    if ("fields" in r) expect(r.fields.business_name).toHaveLength(120);
  });
});

describe("buildSystemPrompt", () => {
  it("includes the business, services and FAQs", () => {
    const r = sanitizeBusinessFields(validBody);
    if (!("fields" in r)) throw new Error("expected fields");
    const prompt = buildSystemPrompt(r.fields);
    expect(prompt).toContain("Akbar Autos");
    expect(prompt).toContain("- Oil change (Rs 5,000)");
    expect(prompt).toContain("Q: Do you open Sundays?");
  });
});

describe("mergeBusinessIntoConfig", () => {
  it("rebuilds the prompt but preserves unrelated settings keys", () => {
    const r = sanitizeBusinessFields(validBody);
    if (!("fields" in r)) throw new Error("expected fields");
    const merged = mergeBusinessIntoConfig(
      {
        agent_name: "Ak",
        tone: "formal",
        greeting: "Custom hello",
        language: "Urdu",
        business_hours: "9-5",
        auto_reply: "Back soon",
        system_prompt: "OLD PROMPT",
        services: [],
      },
      r.fields
    );
    expect(merged.agent_name).toBe("Ak");
    expect(merged.tone).toBe("formal");
    expect(merged.greeting).toBe("Custom hello");
    expect(merged.language).toBe("Urdu");
    expect(merged.system_prompt).toContain("Oil change");
    expect(merged.system_prompt).not.toBe("OLD PROMPT");
    expect(merged.services).toHaveLength(1);
  });
});

describe("businessFieldsFromClient / resolveAgentSystemPrompt (empty-config preview)", () => {
  const row = {
    business_name: "Test Dental Clinic",
    industry: "dental clinic",
    website: "",
    business_description: "",
    whatsapp_number: "+92 300 1112222",
    services: [{ name: "Teeth whitening", price: "$120" }],
    faqs: [{ q: "Do you open Saturdays?", a: "Yes, 9am-2pm." }],
  };

  it("stored config prompt always wins, verbatim", () => {
    const p = resolveAgentSystemPrompt({
      ...row,
      agent_config: { system_prompt: "STORED PROMPT" },
    });
    expect(p).toBe("STORED PROMPT");
  });

  it("empty config {} (post-reset) rebuilds the prompt from the saved business row", () => {
    const p = resolveAgentSystemPrompt({ ...row, agent_config: {} });
    expect(p).not.toBeNull();
    expect(p).toContain("Test Dental Clinic");
    expect(p).toContain("dental clinic");
    expect(p).toContain("Teeth whitening");
    expect(p).toContain("$120");
    expect(p).toContain("Do you open Saturdays?");
  });

  it("null config also rebuilds from the row", () => {
    const p = resolveAgentSystemPrompt({ ...row, agent_config: null });
    expect(p).toContain("Test Dental Clinic");
  });

  it("blank stored prompt is treated as missing and rebuilt", () => {
    const p = resolveAgentSystemPrompt({
      ...row,
      agent_config: { system_prompt: "   " },
    });
    expect(p).toContain("Test Dental Clinic");
  });

  it("returns null when the business row is incomplete (caller keeps generic fallback)", () => {
    expect(
      resolveAgentSystemPrompt({ agent_config: {}, business_name: "Only Name" })
    ).toBeNull();
    expect(resolveAgentSystemPrompt({})).toBeNull();
  });

  it("falls back to config-carried services/faqs when row columns are empty", () => {
    const fields = businessFieldsFromClient({
      business_name: "Row Name",
      industry: "salon",
      whatsapp_number: "+1 555",
      services: null,
      faqs: null,
      agent_config: {
        services: [{ name: "Haircut", price: "$25" }],
        faqs: [{ q: "Walk-ins?", a: "Yes." }],
      },
    });
    expect(fields.services).toHaveLength(1);
    expect(fields.services[0].name).toBe("Haircut");
    expect(fields.faqs[0].q).toBe("Walk-ins?");
  });
});
