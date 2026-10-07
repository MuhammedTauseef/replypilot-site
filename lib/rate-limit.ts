/**
 * Tiny in-memory sliding-window rate limiter.
 *
 * Good enough as a first line of defence for low-traffic forms/APIs
 * (slows down bots and abuse). On serverless platforms each instance
 * keeps its own counters — for heavier needs use a shared store
 * (e.g. Upstash Redis), the call sites are already isolated for that.
 */

const hits = new Map<string, number[]>();
const MAX_KEYS = 5000;

function prune(now: number, windowMs: number) {
  if (hits.size <= MAX_KEYS) return;
  for (const [key, times] of hits) {
    if (times.length === 0 || now - times[times.length - 1] > windowMs) {
      hits.delete(key);
    }
    if (hits.size <= MAX_KEYS) break;
  }
}

/** Returns true when the request is allowed, false when rate-limited. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const times = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (times.length >= limit) {
    hits.set(key, times);
    return false;
  }
  times.push(now);
  hits.set(key, times);
  prune(now, windowMs);
  return true;
}

/** Best-effort client IP (works behind Vercel / proxies). */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}
