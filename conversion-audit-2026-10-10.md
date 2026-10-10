# Conversion Audit — ReplyPilot Site
**Date:** 2026-10-10 | **Type:** Read-only diagnosis (no changes made)

## Current conversion flow

1. **Homepage** → Hero CTA "Get Your AI Agent — $249" → scrolls to `#contact` (contact form at page bottom)
2. **Blog article** → End-of-article "Get a free demo" button → `/#contact` (leaves article, loads homepage, jumps to contact)
3. **Demo pages** → `/demo` has 13 live interactive demos
4. **Pricing** → $249 one-time shown clearly on homepage

## GA reality check
- 0 key events / 0 conversions recorded (last 30 days)
- 325 page views, ~270 real (excluding admin) → 0 leads

## Friction points (ranked by impact)

### 🔴 HIGH IMPACT
1. **Blog → lead requires leaving the article.** Reader finishes a 2,500-word article, clicks "Get a free demo", gets dumped on the homepage contact section. Two context switches kill intent. Fix: inline contact/demo CTA within the article itself, or a sticky bottom bar.
2. **No WhatsApp click-to-chat anywhere.** A business selling WhatsApp automation has no `wa.me` link. This is the single most ironic conversion gap — visitors interested in WhatsApp automation expect to start a WhatsApp chat.
3. **No lead magnet.** No free download, ROI calculator, checklist, or email capture. 100% of conversion depends on a contact form ("send a short note"). Most blog readers aren't ready to write a message — they'd trade an email for value.

### 🟡 MEDIUM IMPACT
4. **No social proof near CTAs.** No testimonials, client logos, review counts, or "trusted by" near the contact form or pricing. The $249 ask has no trust reinforcement at the decision point.
5. **Blog articles don't link to relevant demos.** A dental article should link to a dental demo (`/demo/...`), not a generic contact form. The 13 live demos are underutilized as conversion assets.
6. **Contact form is at the bottom of a long homepage.** Even from the hero CTA, the user scrolls past all sections. A dedicated `/contact` page or modal would reduce friction.

### 🟢 LOW IMPACT / POLISH
7. No urgency or scarcity near pricing (limited slots, etc.)
8. No FAQ near the contact form addressing "how fast", "what do you need from me"
9. `/#contact` anchor links break if the homepage layout changes

## Recommended fix order (when authorized)
1. Add WhatsApp click-to-chat button (floating + in-article)
2. Inline article CTA: topic-matched demo link + short contact form embed
3. Lead magnet: "Missed-call revenue calculator" as email capture
4. Testimonials section near pricing/contact
5. Link each article to its most relevant `/demo` page

## Not changed
Per task instructions: diagnosis only. No code modified for conversion flow.
