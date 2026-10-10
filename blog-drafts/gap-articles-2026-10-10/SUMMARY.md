# Gap Articles Summary — 2026-10-10
**Status:** DRAFTS ONLY — NOT added to posts.ts (awaiting parent/user approval for integration)
**Location:** `~/workspace/replypilot-site/blog-drafts/gap-articles-2026-10-10/`

All 5 articles follow MASTER-CONTENT-OPERATING-SYSTEM.md locked rules:
- 2,500+ words each, simple human language (5th-grade level)
- "Jo aaye masla le kar, jo jaye hal le kar" — genuinely problem-solving
- 100% original content, no "100% AI" claims
- 5 niche-specific FAQ Q&As each (for FAQPage schema)
- 2+ internal links with descriptive anchor text
- Meta title ≤60 chars, excerpt ≤160 chars
- Image block with keyword-rich alt + caption (images to be generated, not yet created)

---

## Article 1: AI Phone Receptionist for Small Business
- **File:** [article-1-ai-phone-receptionist.ts](sandbox://workspace/replypilot-site/blog-drafts/gap-articles-2026-10-10/article-1-ai-phone-receptionist.ts)
- **Slug:** `ai-phone-receptionist-small-business` ✅ no duplicate
- **Title:** "AI Phone Receptionist for Small Business: 7 Wins" (48 chars)
- **Target keyword:** ai phone receptionist small business
- **Word count:** 3,420
- **Internal links (5):** lead-capture-automation, ai-chatbots-dental-clinics, ai-chatbot-physiotherapy-clinics, whatsapp-automation-restaurants, n8n-workflow-automation-small-business
- **Image:** `/blog/ai-phone-receptionist.jpg` — "Small business owner missing an important customer phone call while busy serving a client in person"
- **Sections:** What it is, missed-call costs, 7 things it does, AI vs human, pricing 2026, setup guide, who benefits most, real 90-day numbers, objections, integrations, getting started this week + 5 FAQs

## Article 2: WhatsApp Business API Setup Guide
- **File:** [article-2-whatsapp-api-setup.ts](sandbox://workspace/replypilot-site/blog-drafts/gap-articles-2026-10-10/article-2-whatsapp-api-setup.ts)
- **Slug:** `whatsapp-business-api-setup-guide` ✅ no duplicate
- **Title:** "WhatsApp Business API Setup: 2026 Small Business Guide" (54 chars)
- **Target keyword:** whatsapp business api setup small business
- **Word count:** 2,576
- **Internal links (2):** whatsapp-automation-clothing-boutiques, whatsapp-automation-restaurants
- **Image:** `/blog/whatsapp-api-setup.jpg` — "Small business owner setting up WhatsApp Business API on a laptop with phone showing business verification steps"
- **Sections:** App vs API difference, prerequisites, Step 1-5 (Meta Business Manager, BSP choice, number registration, templates, chatbot+inbox), real costs 2026, ban-avoidance mistakes, timeline + 5 FAQs

## Article 3: Best AI Chatbots Comparison (Honest)
- **File:** [article-3-best-ai-chatbots.ts](sandbox://workspace/replypilot-site/blog-drafts/gap-articles-2026-10-10/article-3-best-ai-chatbots.ts)
- **Slug:** `best-ai-chatbots-small-business-2026` ✅ no duplicate
- **Title:** "7 Best AI Chatbots for Small Business in 2026" (45 chars)
- **Target keyword:** best ai chatbot for small business
- **Word count:** 2,903
- **Internal links (6):** whatsapp-automation-restaurants, ai-chatbots-dental-clinics, whatsapp-business-api-setup-guide (new), instagram-dm-automation-salons, ai-phone-receptionist-small-business (new), n8n-whatsapp-automation-tutorial (new), lead-capture-automation
- **Image:** `/blog/best-ai-chatbots.jpg` — "Small business owner comparing different AI chatbot options on a laptop with comparison charts"
- **Sections:** Evaluation methodology, 7 categories (all-rounder, WhatsApp specialist, website lead bot, Instagram DM, voice AI, developer platform, automation glue), comparison table, 15-minute chooser, red flags, switching costs, honest truth about "best" lists + 5 FAQs
- **Note:** Cross-links to new gap articles (2, 4) — these resolve once all 5 are integrated into posts.ts

## Article 4: n8n WhatsApp Automation Tutorial
- **File:** [article-4-n8n-whatsapp-tutorial.ts](sandbox://workspace/replypilot-site/blog-drafts/gap-articles-2026-10-10/article-4-n8n-whatsapp-tutorial.ts)
- **Slug:** `n8n-whatsapp-automation-tutorial` ✅ no duplicate
- **Title:** "n8n WhatsApp Automation: Build a Bot in 30 Minutes" (50 chars)
- **Target keyword:** n8n whatsapp automation tutorial
- **Word count:** 2,500
- **Internal links (3):** whatsapp-business-api-setup-guide (new), lead-capture-automation, whatsapp-broadcast-marketing-playbook (new)
- **Image:** `/blog/n8n-whatsapp-bot.jpg` — "Visual n8n workflow canvas showing connected nodes automating WhatsApp customer messages for a small business"
- **Sections:** Prerequisites, workflow overview, Step 1-5 (trigger, extraction, AI brain, reply, logging), 3 upgrades, mistakes, costs, troubleshooting + 5 FAQs
- **Note:** Cross-link to new gap article 5 — resolves on integration

## Article 5: WhatsApp Broadcast Marketing Playbook
- **File:** [article-5-whatsapp-broadcast.ts](sandbox://workspace/replypilot-site/blog-drafts/gap-articles-2026-10-10/article-5-whatsapp-broadcast.ts)
- **Slug:** `whatsapp-broadcast-marketing-playbook` ✅ no duplicate
- **Title:** "WhatsApp Broadcast Marketing: 2026 Playbook" (43 chars)
- **Target keyword:** whatsapp broadcast marketing small business
- **Word count:** 2,500
- **Internal links (2):** whatsapp-automation-clothing-boutiques, whatsapp-automation-restaurants
- **Image:** `/blog/whatsapp-broadcast.jpg` — "Small business owner sending a WhatsApp broadcast campaign to hundreds of customers with high open rates on phone screen"
- **Sections:** Why broadcast beats everything, list building, templates, timing/frequency, 24-hour window, measurement, ban-proof rules, advanced segmentation, realistic results, 30-day plan + 5 FAQs

---

## Verification Results
- ✅ All 5 slugs unique (no duplicates against 42 existing posts.ts slugs, no duplicates among themselves)
- ✅ All 5 articles ≥2,500 words (2,500 / 2,500 / 2,576 / 2,903 / 3,420)
- ✅ All titles ≤60 chars, all excerpts ≤160 chars
- ✅ All have exactly 5 FAQ Q&As (h2 "Frequently Asked Questions" + 5× h3/p)
- ✅ All have 2+ internal links; all links resolve to valid slugs (existing + new gap articles)
- ✅ All have image blocks with alt text + caption
- ✅ TypeScript compiles cleanly (tsc --noEmit, exit 0)
- ✅ No "100% AI" claims, no fake testimonials, no copyrighted content

## Integration Notes (for parent agent)
1. Each file exports `post: Post` — import and append to `posts` array in `app/blog/posts.ts`
2. Cross-links between new articles (3→4, 4→5, 3→2) resolve once ALL 5 are added
3. Images (`/blog/ai-phone-receptionist.jpg`, `/blog/whatsapp-api-setup.jpg`, `/blog/best-ai-chatbots.jpg`, `/blog/n8n-whatsapp-bot.jpg`, `/blog/whatsapp-broadcast.jpg`) need to be generated per the locked image style before publishing
4. Dates set to "October 10, 2026" — adjust if publishing later
5. Pre-publish gate (per master file §14): verify FAQ present, image present + correct, caption present
