import { describe, expect, it } from "vitest";
import { baseFilename, groupKbRows, parseContentHash } from "@/lib/kb-groups";

describe("parseContentHash", () => {
  it("splits the chunk suffix", () => {
    expect(parseContentHash("abcdef0123456789-2")).toEqual({
      key: "abcdef0123456789",
      index: 2,
    });
  });
  it("treats a bare hash as a single-chunk document", () => {
    expect(parseContentHash("abcdef")).toEqual({ key: "abcdef", index: 0 });
  });
  it("handles a missing hash", () => {
    expect(parseContentHash(null)).toEqual({ key: "", index: 0 });
  });
});

describe("baseFilename", () => {
  it("strips the part suffix", () => {
    expect(baseFilename("Prices.txt (part 3)")).toBe("Prices.txt");
    expect(baseFilename("Prices.txt")).toBe("Prices.txt");
  });
});

describe("groupKbRows", () => {
  const rows = [
    { id: "r2", filename: "Guide (part 2)", content_hash: "h1-1", content: "second", created_at: "2026-10-01T10:00:01Z" },
    { id: "r1", filename: "Guide (part 1)", content_hash: "h1-0", content: "first", created_at: "2026-10-01T10:00:00Z" },
    { id: "r3", filename: "Hours", content_hash: "h2", content: "9 to 5", created_at: "2026-10-02T09:00:00Z" },
  ];

  it("groups chunks into one document, ordered by chunk index", () => {
    const groups = groupKbRows(rows);
    expect(groups).toHaveLength(2);
    const guide = groups.find((g) => g.key === "h1");
    expect(guide?.filename).toBe("Guide");
    expect(guide?.parts).toBe(2);
    expect(guide?.ids).toEqual(["r1", "r2"]);
    expect(guide?.contents).toEqual(["first", "second"]);
  });

  it("keeps a bare-hash row as its own document", () => {
    const groups = groupKbRows(rows);
    const hours = groups.find((g) => g.key === "h2");
    expect(hours?.parts).toBe(1);
    expect(hours?.ids).toEqual(["r3"]);
  });

  it("sorts newest document first", () => {
    const groups = groupKbRows(rows);
    expect(groups[0].key).toBe("h2");
  });
});
