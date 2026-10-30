import { describe, expect, it } from "vitest";
import {
  buildSystemPrompt,
  mergeBusinessIntoConfig,
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
