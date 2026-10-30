import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { rateLimit, clientIp } from "@/lib/rate-limit";

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
      .select("agent_config")
      .eq("user_id", user.id)
      .single();

    const systemPrompt = String(
      client?.agent_config?.system_prompt ||
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

    // Hard 30s ceiling (same pattern as /api/chat): without it a slow model
    // call leaves the preview UI on "typing..." forever.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
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
        console.error("onboarding chat timed out (30s)");
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
