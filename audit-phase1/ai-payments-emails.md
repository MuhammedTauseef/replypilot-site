# Phase 1 Audit: AI Chatbot + Payments + Emails (2026-10-09)

## AI Chatbot (app/api/chat/route.ts)
- API key: server-side only — PASS
- Auth: login required — PASS
- Input validation: PASS (12 msg history cap, 800 char limit)
- Cost controls: PASS (400 tokens max, 4 tool steps)
- Error handling: PASS (no leak)
- MISSING: No request timeout (hang risk)
- UNVERIFIED: Model "gemini-3.8-flash" — if wrong name, all chats fail silently
- PARTIAL: Rate limit 30/min per IP but in-memory per-instance (bypassable on Vercel)
- KB upload route: ZERO rate limit (embedding cost abuse vector)

## Whop Webhook
- Signature verification: PASS (HMAC-SHA256, replay protection, timingSafeEqual)
- Idempotency: PASS
- Payment flows: logic PASS
- BROKEN: findClientByEmail dead code with broken query
- INCOMPLETE: Never tested live (secret not in Vercel, webhook not created)
- ISSUES: O(n) listUsers scan, fragile amount/product classification

## Checkout
- Flow: PASS (login-gated, Whop handles PCI)
- INCOMPLETE: No post-payment return page, no success UX

## Emails
- 6 templates, only 1 wired (bookingConfirmed)
- 5 dead code (welcome, agentReady, paymentReceipt, monthlyReport, demoFollowup)
- BROKEN: Zero emails deliver (Resend domain unverified)
- MISSING: No admin notification on new leads/bookings
- BUG: paymentReceipt mentions "Stripe" (should be Whop)
- .env.example missing 4 env vars
