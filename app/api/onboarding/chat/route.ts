import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

/** Chat with the client's own generated agent (preview mode). */
export async function POST(req: NextRequest) {
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

    const systemPrompt =
      client?.agent_config?.system_prompt ||
      "You are a friendly AI assistant for a small business. Be helpful and concise.";

    const { message, history } = await req.json();

    const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
    const { text } = await generateText({
      model: google("gemini-3.8-flash"),
      system: systemPrompt,
      messages: [
        ...(Array.isArray(history) ? history : []),
        { role: "user" as const, content: String(message || "").slice(0, 1000) },
      ],
      maxOutputTokens: 300,
    });

    return NextResponse.json({ reply: text.trim() });
  } catch (e) {
    console.error("onboarding chat error:", e);
    return NextResponse.json({ error: "Chat failed." }, { status: 500 });
  }
}
