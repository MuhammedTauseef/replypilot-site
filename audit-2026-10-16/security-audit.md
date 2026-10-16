# Security Audit Report — ReplyPilot Website
**Scope:** `~/workspace/replypilot-site` (Next.js 16, React 19, TypeScript strict, Supabase backend)
**Date:** 2026-10-16 | **Mode:** Read-only code review (no modifications, no live/production testing)
**Prior audit cross-check:** `audit-phase1/FINAL-AUDIT-REPORT.md` (2026-10-09)

## 1. Authentication/Authorization Matrix (all 27 API routes)

| Route group | Auth requirement | Verified |
|---|---|---|
| `/api/admin/*` (14 routes) | Signed-in + `profiles.role='admin'` (401/403) | ✅ VERIFIED |
| `/api/chat` POST | Login required; per-user rate limit 30/min; 30s timeout | ✅ VERIFIED |
| `/api/kb` GET/POST/DELETE | Login + client profile; upload 20/day per user | ✅ VERIFIED |
| `/api/kb/search` | Login required; IP rate limit 20/min | ✅ VERIFIED |
| `/api/onboarding*` | Login required | ✅ VERIFIED |
| `/api/profile`, `/api/dashboard`, `/api/conversations`, `/api/agent-config` | Login required | ✅ VERIFIED |
| `/api/leads` POST | Public by design; validated, honeypot, 5/min IP limit | ✅ VERIFIED |
| `/api/client-booking` GET/POST | Public by design; validated, rate-limited | ✅ VERIFIED |
| `/api/webhooks/whop` POST | HMAC-SHA256, 5-min replay window, idempotency, fails closed | ✅ VERIFIED |

**proxy.ts** protects `/admin/*` (admin role), `/dashboard/*`, `/onboarding/*` (login); fails closed when Supabase env missing.

## 2. Findings

### SEC-001 — Hardcoded seed token in source (committed to git)
- **Severity:** Medium | **Status:** VERIFIED
- **File:** `app/api/admin/blog/seed/route.ts:6`
- **Fix:** Delete token fallback, require admin session only. Disclose to buyer.

### SEC-002 — Public availability check cannot see booked slots (double-booking risk)
- **Severity:** Medium | **Status:** VERIFIED
- **Files:** `app/api/client-booking/route.ts:182-210`
- **Fix:** Add narrow RLS policy for anon SELECT of slot_start/status, or SECURITY DEFINER function.

### SEC-003 — In-memory rate limiter bypassable on serverless
- **Severity:** Medium | **Status:** VERIFIED (mitigated via userKey on authed routes)
- **Fix:** Upstash Redis for public anonymous endpoints (recommended pre-sale).

### SEC-004 — No Content-Security-Policy header — Low
### SEC-005 — No HSTS header — Low
### SEC-006 — `javascript:` URL possible in blog markdown links — Low
### SEC-007 — KB upload extension check bypassable — Low
### SEC-008 — Missing `.env.example` — Low (sale-readiness)

## 3. Positive controls verified
- Secrets hygiene good (only SEED_TOKEN exception)
- Input validation with zod schemas, length caps
- XSS posture good (safeJsonLd escapes, React-escaped rendering)
- RLS comprehensive across all tables
- Proxy fails closed

## 4. Could NOT verify
1. Vercel env vars presence — needs dashboard
2. Resend domain verification — needs Resend dashboard
3. Live DB drift — needs SQL editor check
4. Dependency vulnerabilities — npm audit not run
5. Build/typecheck/tests — Phase 5 scope
