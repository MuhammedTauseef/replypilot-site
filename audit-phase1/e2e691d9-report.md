Audit complete. Here is the structured findings report:

---

# Security Audit: ReplyPilot Auth + Admin APIs

**Scope:** `proxy.ts`, 11 admin API routes, `lib/supabase/`, admin pages, login/signup pages
**Mode:** Read-only. No code changed.

## 1. requireAdmin() coverage — ALL ADMIN API ROUTES PROTECTED ✅

Every admin API route enforces admin authorization. 9 use a named `requireAdmin()` helper; 2 use equivalent inline checks:

| Route file | Methods | Auth check |
|---|---|---|
| `app/api/admin/blog/route.ts` | GET, POST, PUT, DELETE | `requireAdmin()` ✅ |
| `app/api/admin/blog/[id]/route.ts` | GET, PUT, DELETE | `requireAdmin()` ✅ |
| `app/api/admin/demos/route.ts` | GET, POST, PUT, DELETE | `requireAdmin()` ✅ |
| `app/api/admin/demos/[id]/route.ts` | GET, PUT, DELETE | `requireAdmin()` ✅ |
| `app/api/admin/videos/route.ts` | GET, POST, PUT, DELETE | `requireAdmin()` ✅ |
| `app/api/admin/videos/[id]/route.ts` | GET, PUT, DELETE | `requireAdmin()` ✅ |
| `app/api/admin/pages/route.ts` | GET, PUT, DELETE | `requireAdmin()` ✅ |
| `app/api/admin/settings/route.ts` | GET, PUT | `requireAdmin()` ✅ |
| `app/api/admin/users/route.ts` | GET | `requireAdmin()` ✅ |
| `app/api/admin/send-email/route.ts` | POST | `requireAdmin()` ✅ |
| `app/api/admin/delete/route.ts` | POST | inline check (lines 13–24) ✅ |
| `app/api/admin/upload/route.ts` | POST | inline check (lines 30–43) ✅ |

The check pattern is correct: server-side `supabase.auth.getUser()` (validates JWT against Supabase, not trusting cookies) + `profiles.role === "admin"` DB lookup. **No missing checks.**

## 2. proxy.ts — protects pages, but NOT API routes ⚠️

**What works:**
- `/admin/*` (except `/admin/login`) → requires signed-in user with `role='admin'`, redirects others to `/dashboard`
- `/dashboard/*`, `/onboarding/*` → requires any signed-in user
- Fails closed when Supabase env vars missing
- `app/admin/page.tsx:290-293` and `app/dashboard/page.tsx:42-53` add server-side defense-in-depth

**Gaps found:**
- **GAP-1 (notable):** The matcher (`proxy.ts:config`) is `["/admin/:path*", "/dashboard/:path*", "/onboarding/:path*", "/login", "/signup"]` — **`/api/*` is not matched.** API routes get zero proxy protection; security rests 100% on per-route checks (which all exist — see §1). No defense-in-depth for APIs.
- **GAP-2 (minor):** `/forgot-password` and `/reset-password` are listed in `PUBLIC_AUTH_PAGES` (proxy.ts:17-23) but are NOT in the matcher, so the "bounce signed-in users away from auth pages" logic never fires for them. Cosmetic only.
- **GAP-3 (documentation):** `app/api/admin/delete/route.ts:8-9` comment claims "proxy.ts already redirects non-admins away from /admin/*" — false for API routes (see GAP-1). The inline check makes it safe, but the comment reveals a wrong mental model.

## 3. Hardcoded secrets — NONE FOUND ✅

- Grep for `sk-`, `whsec_`, `ghp_`, `AIza`, private keys: only false positive (CSS `mask-image`).
- `SUPABASE_SERVICE_ROLE_KEY` used in 3 files, always via `process.env`, always server-side:
  - `app/api/admin/users/route.ts:30` — behind `requireAdmin()` ✅
  - `app/api/admin/send-email/route.ts:96` — behind `requireAdmin()` ✅
  - `app/api/webhooks/whop/route.ts:28` — behind HMAC signature verification ✅

## 4. SQL injection — NONE FOUND ✅

- No raw SQL anywhere. All queries use Supabase query builder (parameterized).
- One `.rpc("match_kb_documents", {...})` in `app/api/kb/search/route.ts:46` — parameterized RPC, safe pattern.
- `app/api/admin/delete/route.ts:38` table selection uses a whitelist ternary (`"lead"→leads`, `"booking"→bookings`, else null) — not injectable.

## 5. XSS — 4 `dangerouslySetInnerHTML` usages, all low-risk ⚠️

| Location | Content | Risk |
|---|---|---|
| `app/layout.tsx:62` | Hardcoded theme script string | None |
| `app/layout.tsx:68` | `JSON.stringify()` of hardcoded schema | None |
| `app/blog/[slug]/page.tsx:162` | `JSON.stringify(articleSchema)` | **Low** — see note |
| `app/faq/page.tsx:75` | `JSON.stringify(schema)` | **Low** — see note |

**Note:** `JSON.stringify` does not escape `<`/`>`. If a blog title/FAQ contained `</script>`, it could break out of the JSON-LD script tag. Only admins can create this content (self-XSS at worst). Recommend a `<` → `\u003c` escape as hardening, not urgent.

## 6. Session management — delegated to Supabase Auth ✅

- `@supabase/ssr` cookie-based sessions; proxy refreshes on each protected request.
- Every protected route calls `getUser()` server-side (JWT validated, not cookie-trusted).
- Login: `signInWithPassword` (`app/login/page.tsx:27`) + Google OAuth (`app/login/page.tsx:74`, `app/signup/page.tsx:67`).
- Signup: `supabase.auth.signUp` (`app/signup/page.tsx:42`).
- No custom session tokens; logout via Supabase.

## Additional observations (auth-adjacent)

- **No rate limiting on `/login`, `/signup`, `/admin/login`** — brute-force protection relies solely on Supabase's built-in auth rate limits. No app-level lockout or CAPTCHA.
- **Rate limiter is in-memory per serverless instance** (`lib/rate-limit.ts` — the file itself documents this). Chat (30/min/IP) and leads (5/min/IP) are rate-limited; kb and dashboard are not.
- **Webhook security is solid:** HMAC-SHA256 with `crypto.timingSafeEqual` (`whop/route.ts:99`), 5-min replay tolerance, idempotency via stored webhook-id.
- **Tenant isolation correct:** `app/api/dashboard/route.ts` scopes all queries to `user.id` / client's own `business_name`.
- **`/api/admin/users` exposes all user emails** — intended admin functionality, properly gated.

## Verdict

**No critical vulnerabilities.** All 12 admin API route files enforce admin auth with a correct server-side pattern. No hardcoded secrets, no SQL injection, no exploitable XSS. Main hardening opportunities: (a) extend proxy matcher or add middleware-level API guard for defense-in-depth, (b) app-level rate limiting on login endpoints, (c) `<` escaping in JSON-LD blocks.