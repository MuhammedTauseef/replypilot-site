import { describe, it, expect } from "vitest";
import { cronSecretMatches, extractCronSecret } from "@/lib/cron-auth";

function reqWith(headers: Record<string, string>) {
  return {
    headers: {
      get: (k: string) => headers[k.toLowerCase()] ?? null,
    },
  };
}

describe("cronSecretMatches", () => {
  it("accepts the exact secret", () => {
    expect(cronSecretMatches("s3cr3t-value", "s3cr3t-value")).toBe(true);
  });

  it("rejects a wrong secret", () => {
    expect(cronSecretMatches("wrong-value", "s3cr3t-value")).toBe(false);
  });

  it("rejects different-length values without throwing", () => {
    expect(cronSecretMatches("short", "a-much-longer-secret")).toBe(false);
    expect(cronSecretMatches("a-much-longer-secret", "short")).toBe(false);
  });

  it("rejects missing provided or expected values", () => {
    expect(cronSecretMatches(null, "s3cr3t-value")).toBe(false);
    expect(cronSecretMatches(undefined, "s3cr3t-value")).toBe(false);
    expect(cronSecretMatches("", "s3cr3t-value")).toBe(false);
    expect(cronSecretMatches("s3cr3t-value", undefined)).toBe(false);
    expect(cronSecretMatches("s3cr3t-value", "")).toBe(false);
  });
});

describe("extractCronSecret", () => {
  it("reads the Bearer token Vercel Cron sends", () => {
    const req = reqWith({ authorization: "Bearer abc123" });
    expect(extractCronSecret(req)).toBe("abc123");
  });

  it("falls back to the x-cron-secret header", () => {
    const req = reqWith({ "x-cron-secret": "xyz789" });
    expect(extractCronSecret(req)).toBe("xyz789");
  });

  it("prefers the Authorization header when both are present", () => {
    const req = reqWith({
      authorization: "Bearer primary",
      "x-cron-secret": "secondary",
    });
    expect(extractCronSecret(req)).toBe("primary");
  });

  it("returns null when no credential is present", () => {
    expect(extractCronSecret(reqWith({}))).toBeNull();
  });
});
