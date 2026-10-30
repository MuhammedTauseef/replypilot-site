import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Returns the client's generated agent config for preview. */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

    const { data } = await supabase
      .from("clients")
      .select("agent_config, business_name, agent_status")
      .eq("user_id", user.id)
      .single();

    if (!data?.agent_config) {
      return NextResponse.json({ error: "No agent yet — complete onboarding first." }, { status: 404 });
    }
    // After "Start again" the config is an empty object while the business
    // details stay saved on the row — fill the identity fields from the row
    // so the preview header/greeting show the real business, not
    // "Your business". Stored config values always win.
    const cfg = { ...(data.agent_config as Record<string, unknown>) };
    if (!cfg.business_name && data.business_name) {
      cfg.business_name = data.business_name;
    }
    if (!cfg.greeting && data.business_name) {
      cfg.greeting = `Hi! Thanks for reaching out to ${data.business_name}. How can I help you today?`;
    }
    return NextResponse.json({ agent_config: cfg, agent_status: data.agent_status });
  } catch (e) {
    console.error("preview error:", e);
    return NextResponse.json({ error: "Could not load." }, { status: 500 });
  }
}
