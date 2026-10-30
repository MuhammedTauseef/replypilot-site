import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { resolveAgentSystemPrompt } from "@/lib/agent-business";

// gemini-3.8-flash responses can legitimately take 45s+ when Google is
// overloaded (measured 2026-10-30), so the route gets the full platform
// window; the in-call abort below stays the hard stop inside it.
export const maxDuration = 60;

/** Chat with the client's own generated agent (preview mode). */
export async function POST(req: NextRequest) {
  // 20 preview messages per minute per IP — keeps Gemini spend abuse-proof.
  if (!rateLimit(`preview:${clientIp(req)}`, 20, 60_000)) {
    return NextResponse.json(
      { error: "You're sending messages very fast — please wait a few seconds and try again." },
      { status: 429 }
    );
  }
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

    const { data: client } = await supabase
      .from("clients")
      .select(
        "agent_config, business_name, industry, website, business_description, whatsapp_number, services, faqs"
      )
      .eq("user_id", user.id)
      .single();

    // Stored config prompt wins. When the config is empty (e.g. after
    // "Start again" reset it) but the business details are still saved,
    // resolveAgentSystemPrompt rebuilds the prompt from those details so
    // the preview keeps answering as the client's own business.
    const systemPrompt = String(
      resolveAgentSystemPrompt(client ?? {}) ||
        "You are a friendly AI assistant for a small business. Be helpful and concise."
    ).slice(0, 8000);

    const { message, history } = await req.json();

    // Cap the history server-side too (the client sends the last 8 turns):
    // an unbounded history makes the model call slow or stall.
    const safeHistory = (Array.isArray(history) ? history : [])
      .slice(-8)
      .filter(
        (m) =>
          m &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string"
      )
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content.slice(0, 1000) }));

    const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

    // Hard 55s ceiling (same pattern as /api/chat): without it a slow model
    // call leaves the preview UI on "typing..." forever. 55s, not 30s:
    // gemini-3.8-flash under Google-side overload routinely answers in
    // 30–50s (measured 46s for a one-line prompt on 2026-10-30), so a 30s
    // cut killed slow-but-alive replies on both chat routes.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55_000);
    try {
      const { text } = await generateText({
        model: google("gemini-3.8-flash"),
        system: systemPrompt,
        messages: [
          ...safeHistory,
          { role: "user" as const, content: String(message || "").slice(0, 1000) },
        ],
        maxOutputTokens: 300,
        abortSignal: controller.signal,
      });

      return NextResponse.json({ reply: text.trim() });
    } catch (e) {
      const isTimeout =
        e instanceof Error && (e.name === "AbortError" || e.message.includes("abort"));
      if (isTimeout) {
        console.error("onboarding chat timed out (55s)");
        return NextResponse.json({
          reply:
            "That took longer than expected — please try sending your message again.",
        });
      }
      throw e;
    } finally {
      clearTimeout(timeout);
    }
  } catch (e) {
    console.error("onboarding chat error:", e);
    return NextResponse.json({ error: "Chat failed." }, { status: 500 });
  }
}
