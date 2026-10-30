import { describe, it, expect } from "vitest";
import { splitBoldSegments } from "@/lib/inline-format";

describe("splitBoldSegments", () => {
  it("returns plain text untouched when there are no markers", () => {
    const text = "Just a normal sentence about WhatsApp automation.";
    expect(splitBoldSegments(text)).toEqual([{ text, bold: false }]);
  });

  it("returns an empty string as a single plain segment", () => {
    expect(splitBoldSegments("")).toEqual([{ text: "", bold: false }]);
  });

  it("converts a lead-in label pair (the pattern live on the 10 affected articles)", () => {
    expect(
      splitBoldSegments("**Time:** today or tomorrow, morning or afternoon")
    ).toEqual([
      { text: "Time:", bold: true },
      { text: " today or tomorrow, morning or afternoon", bold: false },
    ]);
  });

  it("converts multiple pairs in one paragraph", () => {
    expect(
      splitBoldSegments("**Product:** flyers. **Size:** A5 or A4.")
    ).toEqual([
      { text: "Product:", bold: true },
      { text: " flyers. ", bold: false },
      { text: "Size:", bold: true },
      { text: " A5 or A4.", bold: false },
    ]);
  });

  it("converts a fully-bold paragraph (the old FAQ question format)", () => {
    expect(splitBoldSegments("**How much does it cost?**")).toEqual([
      { text: "How much does it cost?", bold: true },
    ]);
  });

  it("handles bold in the middle of a sentence", () => {
    expect(splitBoldSegments("reply in **under a minute** every time")).toEqual([
      { text: "reply in ", bold: false },
      { text: "under a minute", bold: true },
      { text: " every time", bold: false },
    ]);
  });

  it("leaves an unbalanced marker completely untouched", () => {
    const text = "One stray ** marker with no closing pair";
    expect(splitBoldSegments(text)).toEqual([{ text, bold: false }]);
  });

  it("leaves an empty pair untouched", () => {
    const text = "Nothing between the markers: **** here";
    expect(splitBoldSegments(text)).toEqual([{ text, bold: false }]);
  });

  it("does not treat a single asterisk as bold", () => {
    const text = "5 * 3 = 15, and *this* is not bold either";
    expect(splitBoldSegments(text)).toEqual([{ text, bold: false }]);
  });

  it("preserves the exact original string when segments are re-joined (minus markers only around bold)", () => {
    const samples = [
      "No markers at all.",
      "**Client intake:** questions asked and answered automatically",
      "Prices **start at $249** — see **the FAQ** for details.",
    ];
    for (const s of samples) {
      const joined = splitBoldSegments(s)
        .map((seg) => seg.text)
        .join("");
      expect(joined).toBe(s.replace(/\*\*([^*]+)\*\*/g, "$1"));
    }
  });
});
