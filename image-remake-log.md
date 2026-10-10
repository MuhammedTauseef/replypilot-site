# Image Remake Log — ReplyPilot Blog

**Started:** 2026-10-10
**Standard:** Custom-made, human-feeling, content-relevant, problem/solution showing, designed text on image (infographic-style). No stock, no robotic AI look.
**Tools:** media.generate_image (base visuals) + PIL text overlays (Canva AI credits exhausted — quota 100% used, cannot use create-design/generate-image until reset)
**Note:** `/blog/car-rental-services.jpg` was referenced in posts.ts but the file did not exist — created fresh.

## Batch 1 — DONE (3 images, approved quality)

| # | Article slug | File | Headline text | Subtext | Status |
|---|---|---|---|---|---|
| 1 | ai-chatbot-car-rental-services | public/blog/car-rental-services.jpg | "2 AM. Flight landed. No one answers." | "Every missed call is a booking your competitor gets." | ✅ Done — cinematic night airport, traveler on phone, ringing desk phone foreground |
| 2 | ai-chatbot-veterinary-clinics | public/blog/ai-chatbot-veterinary-clinics.jpg | "Midnight emergency. No one answers." | "Worried pet owners can't wait till morning." | ✅ Done — worried owner holding sick dog at night, clinic window behind |
| 3 | ai-chatbot-bakeries | public/blog/bakeries.jpg | "Hands full of flour. Phone keeps ringing." | "Every missed call is a cake order lost." | ✅ Done — baker kneading dough, flour hands, phone buzzing on counter |

All 3 filenames match existing posts.ts src values — no code changes needed.

## Remaining (18 img blocks)

- whatsapp-automation-clothing-boutiques → /blog/boutiques.jpg
- ai-chatbot-wedding-planners → /blog/wedding-planners.jpg
- whatsapp-automation-flower-shops → /blog/flower-shops.jpg
- ai-chatbot-pet-groomers → /blog/pet-groomers.jpg
- ai-chatbot-tutoring-businesses → /blog/tutoring.jpg
- whatsapp-automation-guesthouses → /blog/guesthouses.jpg
- ai-chatbot-car-detailing → /blog/car-detailing.jpg
- ai-chatbot-interior-designers → /blog/interior-designers.jpg
- ai-chatbot-law-firms → /blog/law-firms.jpg
- ai-chatbot-photographers → 5 img blocks with MISMATCHED srcs (barbershops, pharmacies, travel-agencies, furniture-stores, language-schools images inside photographers article — content bug, needs fixing)
- ai-chatbot-coffee-shops → /blog/ai-chatbot-coffee-shops.jpg
- ai-chatbot-yoga-studios → /blog/ai-chatbot-yoga-studios.jpg
- ai-chatbot-home-cleaning-services → /blog/ai-chatbot-home-cleaning-services.jpg
- ai-chatbot-physiotherapy-clinics → /blog/ai-chatbot-physiotherapy-clinics.jpg

## Issues found
1. **Missing file:** car-rental-services.jpg was referenced but absent — now created.
2. **Mismatched images:** ai-chatbot-photographers article contains 5 img blocks pointing at barbershops/pharmacies/travel-agencies/furniture-stores/language-schools images. These don't match article content — recommend replacing with photographer-relevant images or removing extras.
3. **Canva AI quota exhausted** (resets per quota_usage.resets_at=1793491200) — using media pipeline + PIL overlays instead. Same quality standard maintained.

## REDO Batch 1 — 2026-10-10 (corrected rules)
User REJECTED first batch: text/lines overlaid on pictures. NEW LOCKED RULES applied:
- CLEAN IMAGES: zero text, zero lines/bands/strips/gradient overlays on the picture
- PROFESSIONAL LEVEL: professional photographer quality — premium lighting, composition, finish
- Text goes as caption BELOW the image, never on top (CLEAN IMAGE RULE)
- Every batch shown to user for approval before continuing (IMAGE APPROVAL RULE)

1. car-rental-services.jpg — REDONE. Clean professional photo: car keys on hooks + counter, smartphone glowing with incoming call, empty counter, warm evening light. No text, no overlays. (overwritten)
2. ai-chatbot-veterinary-clinics.jpg — REDONE. Clean professional photo: worried woman holding unwell dog in blanket at night, checking smartphone, blue night window light. No text, no overlays. (overwritten)
3. bakeries.jpg — REDONE. Clean professional food photo: baker's flour-covered hands kneading dough, smartphone ringing on bench with green call glow, warm bakery light, fresh loaves. No text, no overlays. (overwritten)

Tool: media pipeline (Nano Banana model). All 3 verified visually: no text, no lines, clean, content-relevant, professional finish.
STATUS: awaiting user approval of this batch before doing remaining 18.

## Batch 3 — 2026-10-10 (REALISTIC direction, single image first)
- `car-rental-services.jpg` — REDONE realistic style: car keys on hooks, phone with incoming call screen on wooden counter, natural daylight, snapshot feel. No text, no overlays. Awaiting user approval before continuing.
- vet + bakeries: NOT started (waiting for single-image approval per user).
