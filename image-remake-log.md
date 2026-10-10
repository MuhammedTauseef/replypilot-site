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

## Batch 4 — 2026-10-10 (approved realistic style, batch 1 of remaining)

User APPROVED the realistic style (car rental, vet clinics, bakeries). Continuing remaining in same style.

| # | Article slug | File | Description | Status |
|---|---|---|---|---|
| 4 | whatsapp-automation-clothing-boutiques | public/blog/boutiques.jpg | Boutique owner stressed looking at phone full of WhatsApp messages, dress racks, natural daylight | ✅ Done — realistic, clean, no text/lines |
| 5 | ai-chatbot-wedding-planners | public/blog/wedding-planners.jpg | Wedding planner at candlelit venue at night checking phone with unread notifications | ✅ Done — realistic, clean, no text/lines |
| 6 | whatsapp-automation-flower-shops | public/blog/flower-shops.jpg | Florist surrounded by bouquets staring at phone with messages, natural shop light | ✅ Done — realistic, clean, no text/lines |
| 7 | ai-chatbot-pet-groomers | public/blog/pet-groomers.jpg | Groomer mid-groom with clippers, ringing phone + messy appointment book on counter | ✅ Done — realistic, clean, no text/lines |

STATUS: awaiting user approval of Batch 4 before continuing. Remaining: tutoring, guesthouses, car-detailing, interior-designers, law-firms, photographers (mismatched fix), coffee-shops, yoga-studios, home-cleaning-services, physiotherapy-clinics.

## Batch 5 — 2026-10-10 (final 10, LOCKED final style)

User LOCKED final style: realistic photo + text bar at BOTTOM INSIDE the picture (dark strip rgb 30,30,30, ~16% height, white centered wrapped text). Photo stays clean above. No HTML captions (removed from posts.ts).

All 10 existing images were already realistic/clean/content-relevant — no regeneration needed. Added bottom text bars via PIL per locked spec. Visually verified sample (tutoring, physiotherapy): realistic, no text on photo, bar readable, text not cut off.

| # | Article slug | File | Bar caption | Status |
|---|---|---|---|---|
| 8 | ai-chatbot-tutoring-businesses | public/blog/tutoring.jpg | "Parent messaging a tutoring centre at night — the owner misses the enquiry." | ✅ Done |
| 9 | whatsapp-automation-guesthouses | public/blog/guesthouses.jpg | "Small guesthouse owner overwhelmed by unread booking messages." | ✅ Done |
| 10 | ai-chatbot-car-detailing | public/blog/car-detailing.jpg | "Hands busy polishing the car — booking enquiries pile up unanswered." | ✅ Done |
| 11 | ai-chatbot-interior-designers | public/blog/interior-designers.jpg | "Holding fabric samples at a client site while new enquiries wait." | ✅ Done |
| 12 | ai-chatbot-law-firms | public/blog/law-firms.jpg | "Empty office at night — missed client enquiry calls on the phone." | ✅ Done |
| 13 | ai-chatbot-photographers | public/blog/photographers.jpg | "Mid-shoot with camera in hand — booking enquiries go unanswered." | ✅ Done |
| 14 | ai-chatbot-coffee-shops | public/blog/ai-chatbot-coffee-shops.jpg | "Steaming milk in the morning rush while customer messages pile up." | ✅ Done |
| 15 | ai-chatbot-yoga-studios | public/blog/ai-chatbot-yoga-studios.jpg | "Teaching an evening class while the front desk phone fills with unread messages." | ✅ Done |
| 16 | ai-chatbot-home-cleaning-services | public/blog/ai-chatbot-home-cleaning-services.jpg | "Scrubbing a kitchen while missed calls stack up on the phone." | ✅ Done |
| 17 | ai-chatbot-physiotherapy-clinics | public/blog/ai-chatbot-physiotherapy-clinics.jpg | "Juggling a ringing phone and a full waiting room at once." | ✅ Done |

NOTE on photographers "mismatch": investigated — the 5 images (barbershops/pharmacies/travel-agencies/furniture-stores/language-schools) are correctly placed in their OWN articles, not in the photographers article. The photographers article has 1 correct img block (photographers.jpg). No content bug; no posts.ts changes needed.

**ALL 17 article images now in locked final style.** (7 done by parent earlier: car-rental, vet-clinics, bakeries, boutiques, wedding-planners, flower-shops, pet-groomers + 10 here = 17 total.)

## Batch 6 — 2026-10-10 (final sweep: all remaining images)

Found 32 unique img srcs in posts.ts (count had grown past the earlier 22). 17 already had bars; 15 remained.

**5 missing files — generated fresh in realistic style (media pipeline):**
| File | Scene |
|---|---|
| ai-chatbot-barbershops.jpg | Barber doing skin fade, phone buzzing with booking messages on counter |
| whatsapp-automation-pharmacies.jpg | Pharmacist counting tablets, phone with WhatsApp refill questions |
| ai-chatbot-travel-agencies.jpg | Travel agent on call, second phone with holiday package enquiries |
| ai-chatbot-language-schools.jpg | Empty classroom at night, phone with enrolment messages on desk |
| whatsapp-automation-furniture-stores.jpg | Couple photographing sofa price tag, salesperson busy with another family |

**1 regenerated (was 3D render, violated realistic rule):**
| File | New scene |
|---|---|
| lead-capture.jpg | Business owner at night desk, laptop inbox full of unread customer enquiries |

**9 existing Oct-8 images — already realistic/clean, kept as-is:**
car-dealerships.jpg, dental-clinics.jpg, ecommerce.jpg, gyms.jpg, instagram-salons.jpg, n8n-workflows.jpg, plumbers.jpg, real-estate.jpg, whatsapp-restaurants.jpg

All 15 got bottom text bars via PIL per locked spec (dark strip rgb 30,30,30, 16% height, white centered wrapped text).

**FINAL VERIFICATION:** all 32 unique img srcs in posts.ts have bottom bars, zero missing files.

**PROJECT COMPLETE — all 32 article images in locked final style** (realistic photo + bottom text bar inside picture, photo clean above).
