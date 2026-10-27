import { timingSafeEqual } from "crypto";

/**
 * Cron authentication for the auto-publisher.
 *
 * Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` automatically when
 * the CRON_SECRET env var exists in the project. Manual calls may use the
 * `x-cron-secret` header instead. Comparison is timing-safe.
 */
export function cronSecretMatches(
  provided: string | null | undefined,
  expected: string | undefined
): boolean {
  if (!expected || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function extractCronSecret(req: {
  headers: { get(name: string): string | null };
}): string | null {
  const auth = req.headers.get("authorization");
  if (auth && auth.toLowerCase().startsWith("bearer ")) {
    return auth.slice("bearer ".length).trim();
  }
  return req.headers.get("x-cron-secret");
}
