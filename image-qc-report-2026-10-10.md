# Image QC Report — All 47 Article Images
**Date:** 2026-10-10 | **Standard:** user-locked format (confirmed via screenshot 2026-10-10)

## Locked format
1. Realistic photograph (natural, non-cinematic)
2. Dark bottom strip INSIDE the image
3. White centered text in the strip (correct spelling, no grammar errors)
4. No text over the photographic area
5. Character fully visible (not cropped)
6. Caption below image (gray text, from posts.ts)

## Summary
- **PASS: 26/47**
- **FAIL: 21/47** — all failures are the same defect: **no dark bottom strip** (the photo just continues to the bottom edge; no text bar at all)

## Method
- All 47 image files verified present in `public/blog/` (0 missing)
- All 47 `img` blocks in `app/blog/posts.ts` have captions (0 missing)
- Bottom-strip presence checked two ways: programmatic brightness analysis of the bottom 12% of each image, then visual confirmation via contact sheets of all 47 bottom strips (each strip visually inspected for dark bar + text)
- All 26 passing strips read for spelling/grammar — **0 errors found**
- 6 full images spot-checked (bakeries, wedding-planners, whatsapp-api-setup, interior-designers, pharmacies, car-rental-services): realistic style, dark strip, correct text, no text over photo, characters fully visible

---

## ✅ PASS (26)

| # | Image | Strip text (verified) |
|---|---|---|
| 1 | ai-chatbot-barbershops.jpg | "Mid-cut with clippers in hand — booking messages go unanswered." |
| 2 | ai-chatbot-coffee-shops.jpg | "Steaming milk in the morning rush while customer messages pile up." |
| 3 | ai-chatbot-home-cleaning-services.jpg | "Scrubbing a kitchen while missed calls stack up on the phone." |
| 4 | ai-chatbot-language-schools.jpg | "Empty classroom at night — enrolment messages waiting till morning." |
| 5 | ai-chatbot-physiotherapy-clinics.jpg | "Juggling a ringing phone and a full waiting room at once." |
| 6 | ai-chatbot-travel-agencies.jpg | "On a call while holiday package enquiries pile up on the second phone." |
| 7 | ai-chatbot-veterinary-clinics.jpg | "A pet emergency at night — when no one picks up, owners call the next clinic." |
| 8 | ai-chatbot-yoga-studios.jpg | "Teaching an evening class while the front desk phone fills with unread messages." |
| 9 | ai-phone-receptionist.jpg | "AI Phone Receptionist for Small Business" |
| 10 | bakeries.jpg | "Hands covered in dough, phone ringing — orders slip away during the morning rush." |
| 11 | best-ai-chatbots.jpg | "7 Best AI Chatbots for Small Business" |
| 12 | boutiques.jpg | "Dozens of unread WhatsApp messages — size, price, stock questions piling up while she serves one customer." |
| 13 | car-detailing.jpg | "Hands busy polishing the car — booking enquiries pile up unanswered." |
| 14 | car-rental-services.jpg | "A ringing phone no one answers — every missed call is a lost booking." |
| 15 | flower-shops.jpg | "Surrounded by bouquets, staring at same-day delivery requests she cannot answer mid-arrangement." |
| 16 | guesthouses.jpg | "Small guesthouse owner overwhelmed by unread booking messages." |
| 17 | interior-designers.jpg | "Holding fabric samples at a client site while new enquiries wait." |
| 18 | law-firms.jpg | "Empty office at night — missed client enquiry calls on the phone." |
| 19 | n8n-whatsapp-bot.jpg | "n8n WhatsApp Automation Tutorial" |
| 20 | pet-groomers.jpg | "Mid-groom with clippers in hand — the ringing phone and the messy appointment book both wait." |
| 21 | tutoring.jpg | "Parent messaging a tutoring centre at night — the owner misses the enquiry." |
| 22 | wedding-planners.jpg | "Checking client enquiries at a live event — every unread message is a wedding going to a competitor." |
| 23 | whatsapp-api-setup.jpg | "WhatsApp Business API Setup Guide 2026" |
| 24 | whatsapp-automation-furniture-stores.jpg | "Salesperson busy with one family while another couple waits." |
| 25 | whatsapp-automation-pharmacies.jpg | "Counting tablets while refill questions pile up unread." |
| 26 | whatsapp-broadcast.jpg | "WhatsApp Broadcast Marketing Playbook" |

---

## ❌ FAIL (21) — no dark bottom strip

These images are realistic photos but **end at the photo edge with no text bar**. They predate the locked format (older batch).

| # | Image | Article slug |
|---|---|---|
| 1 | ai-chatbot-gyms-fitness-studios.jpg | ai-chatbot-gyms-fitness-studios |
| 2 | ai-chatbot-photographers.jpg | ai-chatbot-photographers |
| 3 | ai-chatbot-plumbers-home-services.jpg | ai-chatbot-plumbers-home-services |
| 4 | ai-chatbot-real-estate-agents.jpg | ai-chatbot-real-estate-agents |
| 5 | ai-chatbots-dental-clinics.jpg | ai-chatbots-dental-clinics |
| 6 | ecommerce-store-assistants.jpg | ecommerce-store-assistants |
| 7 | instagram-dm-automation-dance-studios.jpg | instagram-dm-automation-dance-studios |
| 8 | instagram-dm-automation-dog-trainers.jpg | instagram-dm-automation-dog-trainers |
| 9 | instagram-dm-automation-makeup-artists.jpg | instagram-dm-automation-makeup-artists |
| 10 | instagram-dm-automation-nail-salons.jpg | instagram-dm-automation-nail-salons |
| 11 | instagram-dm-automation-salons.jpg | instagram-dm-automation-salons |
| 12 | instagram-dm-automation-tattoo-studios.jpg | instagram-dm-automation-tattoo-studios |
| 13 | lead-capture-automation.jpg | lead-capture-automation |
| 14 | n8n-workflow-automation-small-business.jpg | n8n-workflow-automation-small-business |
| 15 | whatsapp-automation-car-dealerships.jpg | whatsapp-automation-car-dealerships |
| 16 | whatsapp-automation-car-wash.jpg | whatsapp-automation-car-wash |
| 17 | whatsapp-automation-juice-bars.jpg | whatsapp-automation-juice-bars |
| 18 | whatsapp-automation-laundry-services.jpg | whatsapp-automation-laundry-services |
| 19 | whatsapp-automation-pizza-restaurants.jpg | whatsapp-automation-pizza-restaurants |
| 20 | whatsapp-automation-restaurants.jpg | whatsapp-automation-restaurants |
| 21 | whatsapp-automation-tailoring-shops.jpg | whatsapp-automation-tailoring-shops |

**Fix required:** regenerate these 21 images in the locked format (realistic photo + dark bottom strip with white centered topic text). Per task instructions, images were NOT regenerated — report only.

---

## Notes
- All strip texts on passing images are spelling- and grammar-clean.
- Two strip-text styles exist among passes: descriptive scene captions (older locked-format batch) and title text (5 newest gap articles). Both satisfy the locked format (white centered text in dark strip, topic-relevant).
- Captions below images are handled in code (posts.ts `caption` field → page renderer); all 47 present.
