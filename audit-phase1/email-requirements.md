# Real Email Sending — Requirements Checklist
**Status:** Dev/test mode active. Koi real email nahi jati.

## Tumhe karna hai (jab custom domain ho):
1. ☐ Domain khareedo (jaise replypilot.com)
2. ☐ Resend dashboard → Domains → Add domain
3. ☐ DNS records add karo (SPF, DKIM, DMARC) — Resend guide dega
4. ☐ Resend mein domain "Verified" hone ka intezar karo
5. ☐ Vercel mein `RESEND_FROM` set karo: `ReplyPilot <hello@tumharadomain.com>`
6. ☐ Test email bhejo (admin panel se)

## Main karunga (domain verify ke baad):
1. ☐ Welcome email signup flow mein wire karna
2. ☐ Admin notifications (naye lead/booking par tumhe email)
3. ☐ Payment receipt webhook se wire karna
4. ☐ End-to-end test (real email bhejna + verify)

## Abhi kya safe hai:
- ✅ App crash nahi hoti (dev-mode mein log hota hai)
- ✅ Koi fake "sent" report nahi (honest 'dev-mode' status)
- ✅ Templates test ho gaye (11/11 pass)
- ✅ TypeScript clean
- ✅ Secrets safe (sirf env vars, koi hardcode nahi)

## Kya change kiya:
- `lib/emails.ts`: `Promise<boolean>` → `Promise<EmailResult>` (honest status)
- `app/api/webhooks/whop/route.ts`: sendEmail ab status return karta hai
- `paymentReceipt`: "Stripe" → "Whop" fix
- `scripts/test-emails.ts`: naya test (11 tests, sab pass)
