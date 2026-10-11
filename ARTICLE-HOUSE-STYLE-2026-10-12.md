# ReplyPilot Article House Style — derived 2026-10-12 from the 3 most recent published articles
# (whatsapp-broadcast-marketing-playbook, n8n-whatsapp-automation-tutorial, best-ai-chatbots-small-business-2026)
# User-locked instruction: "Jis tarah pehle article likhe hain" — match this shape and voice exactly.
# All cron-spec rules (brand disambiguation, Part G, Neil Patel checklist, fact-check, ~3,000 words) still apply ON TOP.

## METADATA
- title: primary keyword near the BEGINNING, specific, concrete. Patterns: "<Keyword>: <Specific Angle>" / "<Keyword>: 2026 Playbook" / "How to <Outcome> with <Keyword>". Never clickbait, never vague.
- excerpt: 1–2 sentences (~140–160 chars), keyword-rich, benefit-led. Reads like a search-result snippet.
- date: "October 12, 2026"
- readTime: wordcount/250 rounded, e.g. "12 min read"
- keywords: [exact primary keyword, 2 closely related variants]

## BLOCK FLOW (match exactly)
1. `{ type: "img", src: "/blog/<slug-short>.jpg", alt: "<vivid 1-sentence description of the PROBLEM shown, keyword-rich>", caption: "<punchy one-liner, no period needed>" }` — image FIRST, before any text. The image must SHOW the reader's pain (e.g. owner drowning in unread messages), not decorate.
2. `{ type: "p" }` — ONE long problem-led opening (~150–220 words). Shape: striking contrast or surprising fact → vivid scene of the reader's pain (second person, concrete details: names, times, places) → what's broken about the status quo → "This article shows you..." + keyword stated naturally. MUST contain one crisp 40–60-word self-contained direct answer/definition early (quotable by AI) — but keep it inside the natural flow, no separate box.
3. NO quick-answer block (recent articles dropped it).
4. Optional: `{ type: "p", text: "Watch how this works in practice:" }` + `{ type: "video", src: "/videos/<matching-demo>.mp4", poster: "/videos/<matching-demo>.png" }` — ONLY when a genuinely relevant demo video exists in public/videos/. Never force it.
5. 12–15 × `{ type: "h2" }` sections, each followed by 2–4 `{ type: "p" }` blocks (~80–150 words each) and occasional `{ type: "ul", items: [...] }` (5 items max, each a complete useful thought, bold lead-ins where helpful).
6. H2 STYLE — conversational, specific, benefit- or curiosity-led. Winning patterns from recent articles:
   - "Why <X> Beats Every Other Channel You Have"
   - "The <Thing>: <Specific Angle>" / "<Topic>: The Line Between Welcome and Spam"
   - "Mistakes That <Break/Kill> <Thing>"
   - "What It Costs to Run" / "Measuring What Matters (Beyond <Vanity Metric>)"
   - "Staying Ban-Proof: The Rules That Matter"
   - "Putting It Together: Your First 30 Days"
   - Question-style H2s (at least 3 per article): "What If You Pick Wrong?", "How Do You Know It's Working?"
   - Numbered/tutorial H2s where fitting: "Step 1: <Action> (Minutes 0–8)"
   - NEVER generic ("Introduction", "Conclusion", "Benefits of AI Chatbots").
7. `{ type: "h3" }` used sparingly INSIDE sections for sub-points (not for FAQ).
8. Comparison table: render as a `p` block with a clear text table OR a `ul` — only when genuinely comparing options.
9. CLOSE with `{ type: "h2", text: "Frequently Asked Questions" }` then 4–6 × (`{ type: "h3", text: "<Real question ending with?>" }` IMMEDIATELY followed by `{ type: "p" }` 2–4 sentence self-contained answer). This exact h3-then-p pairing drives the FAQPage schema — never break it.
10. NO explicit closing CTA section — the template auto-inserts MidArticleCTA (~40%) and EndOfArticleCTA. Weave ONE soft natural CTA into body copy with the verified URL https://replypilot-site.vercel.app/ (e.g. "...request a free custom demo at https://replypilot-site.vercel.app/").

## TONE (match closely)
- Warm expert talking to a friend over chai. Second person "you" throughout.
- Short sentences mixed with medium ones; contractions natural ("don't", "it's", "you're").
- Concrete numbers, named examples, honest limitations ("A 95% open rate with zero sales is a vanity metric."). Never hype, never vague.
- Contractions of thought: "The math is not subtle." / "Taste is the whole difference." — short punchy closers land well.
- Internal links inline as [descriptive label](/blog/exact-slug) — 2–3 per article, natural, to REAL existing slugs only.
- External links: 1–2 to genuinely authoritative sources (official docs, established publications). Real URLs only.
- FORBIDDEN AI tells: "in today's fast-paced world", "delve", "furthermore", "moreover", "in conclusion", "game-changer", "revolutionize", "unlock", "supercharge", "landscape" (as metaphor), "nestled", "vibrant".
- Prices: NEVER mention prices (owner-locked). No "100% AI" anywhere.

## BRAND (non-negotiable)
- First mention in every article: "ReplyPilot (AI automation for small-business messaging — WhatsApp, Instagram DM, website chat)".
- 2–3 natural mentions total. NEVER describe it as a Chrome extension / WordPress plugin / X growth tool — that is a different product.

## LENGTH
- ~2,800–3,000 words of p-text (count p-block words only). 34–42 p blocks typical. Never pad; if the topic can't honestly fill it, say so instead of inventing.
