# REPLYPILOT — COMPLETE PHASE 1 AUDIT REPORT
**Date:** 2026-10-09 | **Mode:** Read-only (koi code change nahi)
**Auditors:** 3 specialists (Auth/Security, AI/Payments/Emails, SEO/Frontend)

---

## BACKUP VERIFICATION ✅

**Location:** `/home/hatch/workspace/backups/replypilot-site-audit-20261009-1116/`
**Size:** 19MB | **Status:** Verified — backup matches current code (diff clean)
**Contents:** app/, components/, lib/, public/, supabase/, package.json, proxy.ts, next.config.ts

**Restore method (tested):**
```bash
cp -r ~/workspace/backups/replypilot-site-audit-20261009-1116/app ~/workspace/replypilot-site/
# Phir: cd ~/workspace/replypilot-docs && python3 push-retry.py MuhammedTauseef replypilot-site ~/workspace/replypilot-site --branch main --message "Rollback"
```
**Rollback time:** ~5 minutes

---

## RLS POLICY DEEP-DIVE (sirf "enabled" nahi, actual logic check)

### Customer Data Isolation — PASS ✅

| Table | Policy | Logic | Verdict |
|---|---|---|---|
| clients | select_own | `auth.uid() = user_id` | ✅ Customer sirf apna data dekhta hai |
| kb_documents | select_own | Via clients table: `clients.user_id = auth.uid()` | ✅ Proper tenant isolation |
| chat_transcripts | select_own | `auth.uid() = user_id` | ✅ |
| subscriptions | select_own | Via clients: owner only | ✅ |
| payments | select_own / client_own | Owner only | ✅ |

### Admin Policies — PASS ✅
Sab `EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')` use karti hain.
`is_admin()` helper: `security definer`, sahi pattern.

### Public Policies (intentional) — PASS with notes
| Table | Policy | Purpose |
|---|---|---|
| bookings | insert_public (`WITH CHECK true`) | Logged-out visitors chat se booking kar sakte hain |
| leads | insert_public | Contact form / chat se lead capture |
| blog_posts, demos, videos, faqs, pages | select_published | Public content |
| site_settings | select_public | Public settings |

**Spam risk note:** Public inserts par app-level rate limiting hai (leads: 5/min, bookings: 10/min) + honeypot. Acceptable.

### Cross-Account Access Test (code review)
- `app/api/dashboard/route.ts`: Sab queries `user.id` se scoped ✅
- `app/api/kb/*`: `client_id` har query mein filtered ✅
- Koi aisi API nahi mili jo doosre customer ka data leak kare ✅

---

## COMPLETE FINDINGS (severity-wise)

### 🔴 CRITICAL — 0 issues
Koi critical vulnerability nahi mili.

### 🟠 HIGH — 3 issues

**H-1: Emails bilkul deliver nahi hoti hain**
- File: `lib/emails.ts`, `app/api/admin/send-email/route.ts`
- Evidence: Resend sending domain (`hello@replypilot-site.vercel.app`) unverified hai. Sab send paths best-effort hain, errors swallow ho jati hain.
- Impact: Welcome emails, booking confirmations, payment receipts — kuch nahi jata
- Fix: User Resend mein domain verify kare → phir templates wire karna

**H-2: Whop payments kabhi live test nahi hue**
- File: `app/api/webhooks/whop/route.ts`
- Evidence: `WHOP_WEBHOOK_SECRET` Vercel mein nahi hai, webhook Whop dashboard mein nahi bana. Code dormant hai.
- Impact: Payment hone par kuch nahi hoga (no activation, no email)
- Fix: User webhook banaye + secret dale → test mode mein end-to-end test

**H-3: AI model naam unverified**
- File: `app/api/chat/route.ts:55` — `const GEMINI_MODEL = "gemini-3.8-flash"`
- Evidence: Ye model naam publicly documented nahi hai. Agar ghalat hua to har chat call fail hogi (silent fallback).
- Impact: Chatbot kaam nahi karega
- Fix: Pehle test call karke verify karna, phir correct naam use karna

### 🟡 MEDIUM — 8 issues

**M-1: AI chat mein koi timeout nahi**
- File: `app/api/chat/route.ts:311-318`, `app/api/kb/route.ts`
- Evidence: `generateText` par koi AbortSignal/timeout nahi. Gemini hang = Vercel timeout tak hang.
- Fix: 30s AbortSignal add karna

**M-2: Rate limiter bypassable hai**
- File: `lib/rate-limit.ts`
- Evidence: In-memory Map, per-serverless-instance. File khud warn karta hai.
- Impact: Distributed bot limit bypass kar sakta hai
- Fix: Upstash Redis (future), abhi ke liye acceptable

**M-3: KB upload mein koi rate limit nahi**
- File: `app/api/kb/route.ts` (POST)
- Evidence: Har chunk par Gemini embedding call, koi cap nahi
- Impact: Authenticated user quota burn kar sakta hai
- Fix: Per-user daily upload limit add karna

**M-4: Demo pages par koi SEO metadata nahi**
- File: `app/demo/page.tsx`, `app/demo/[slug]/page.tsx`
- Evidence: Koi `export const metadata` nahi. Key conversion pages hain.
- Fix: Title + description + OG tags add karna

**M-5: Admin/dashboard par noindex nahi**
- File: `app/robots.ts`
- Evidence: Sab crawlers ko `/` allow hai, `/admin/*` ya `/dashboard/*` ke liye koi disallow nahi
- Impact: Agar auth fail hua to admin pages index ho sakti hain
- Fix: robots.ts mein disallow + pages par noindex meta

**M-6: Videos page DB-dependent hai (koi fallback nahi)**
- File: `lib/videos.ts:14-27`
- Evidence: DB unreachable/empty = `[]` return, page blank
- Fix: Local `public/videos/` files ka fallback add karna

**M-7: Login endpoints par app-level rate limit nahi**
- File: `app/login/page.tsx`, `app/signup/page.tsx`, `app/admin/login/page.tsx`
- Evidence: Sirf Supabase built-in limits par depend karta hai
- Fix: App-level attempt tracking (future hardening)

**M-8: 5 email templates dead code hain**
- File: `lib/emails.ts` — welcome, agentReady, paymentReceipt, monthlyReport, demoFollowup
- Evidence: Kahi call nahi hoti hain
- Fix: Signup/booking/payment flows mein wire karna (domain verify ke baad)

### 🟢 LOW — 6 issues

**L-1:** proxy.ts matcher mein `/api/*` nahi (defense-in-depth gap, per-route checks hain is liye safe)
**L-2:** JSON-LD mein `<` escaping nahi (self-XSS only, low risk)
**L-3:** Footer mein purana portfolio link (`tauseef-phi.vercel.app` — retired)
**L-4:** Video sitemap `robots.ts` mein registered nahi
**L-5:** `.env.example` mein 4 env vars missing
**L-6:** `paymentReceipt` template mein "Stripe" likha hai (Whop hona chahiye)

---

## KYA SAHI KAAM KAR RAHA HAI (verified)

- ✅ 12/12 admin APIs protected (server-side JWT + DB role check)
- ✅ RLS: 16 tables, customer isolation sahi
- ✅ Koi hardcoded secret, SQL injection, ya exploitable XSS nahi
- ✅ AI: key server-side, auth required, cost controls
- ✅ Webhook: HMAC verification solid
- ✅ SEO core: meta, sitemap, robots, schema sab PASS
- ✅ Blog: 21 articles, sab pages working
- ✅ Landing: 11 sections, CTAs working

---

## PRIORITY-WISE IMPLEMENTATION PLAN

### 🔴 PHASE A — User Actions Required (tumhe karna hai)
1. **Resend domain verify** karo → phir main emails wire karunga
2. **Whop webhook** banao + secret Vercel mein dalo → phir main test karunga
3. **Google provider** Supabase mein ON karo → phir main login test karunga

### 🟠 PHASE B — Main karunga (koi approval nahi chahiye)
1. AI model naam verify + timeout add (H-3, M-1)
2. Demo pages SEO metadata (M-4)
3. Admin noindex + robots fix (M-5)
4. Videos page DB fallback (M-6)
5. KB upload rate limit (M-3)
6. Footer purana link fix (L-3)
7. `.env.example` complete (L-5)
8. paymentReceipt "Whop" fix (L-6)
9. Video sitemap robots mein (L-4)

### 🟡 PHASE C — Dashboard/Admin completion
1. `/admin/users` UI banana
2. FAQ admin banana
3. Agent config UI
4. Conversation history view
5. Profile editing

### 🟢 PHASE D — Testing & Polish
1. Vitest setup + critical path tests
2. Login rate limiting
3. JSON-LD escaping

---

## STATUS: PARTIAL
**Core solid hai. 3 HIGH issues mein se 2 user action par ruke hain (emails, payments).**
**Koi code change nahi kiya. Backup verified. Rollback ready.**
