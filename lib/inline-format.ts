/**
 * Inline text formatting helpers for rendered article/page text.
 *
 * The blog renderer historically converted only [label](url) links and
 * passed everything else through raw, so articles whose stored content
 * uses markdown-style **bold** lead-ins (e.g. "**Time:** today or
 * tomorrow") showed the literal asterisks to readers (10 live articles,
 * 308 markers, all of them well-formed emphasis pairs — verified by a
 * full-catalogue crawl on 2026-10-30; zero occurrences in the other 76).
 *
 * splitBoldSegments is the pure core of the fix: text without "**"
 * returns a single non-bold segment carrying the ORIGINAL string, so the
 * renderer emits exactly what it emitted before for unaffected content.
 * Unbalanced "**" (no closing pair) never matches and also passes
 * through unchanged as one plain segment.
 */

export interface InlineSegment {
  text: string;
  bold: boolean;
}

export function splitBoldSegments(text: string): InlineSegment[] {
  if (!text.includes("**")) return [{ text, bold: false }];

  const segments: InlineSegment[] = [];
  const re = /\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      segments.push({ text: text.slice(last, m.index), bold: false });
    }
    segments.push({ text: m[1], bold: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    segments.push({ text: text.slice(last), bold: false });
  }
  // No well-formed pair found (e.g. a lone "**") — pass through untouched.
  if (!segments.some((s) => s.bold)) return [{ text, bold: false }];
  return segments;
}
