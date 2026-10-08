import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Build the agent system prompt from onboarding data. */
function buildAgentConfig(data: {
  business_name: string;
  industry: string;
  website: string;
  business_description: string;
  services: { name: string; price: string }[];
  faqs: { q: string; a: string }[];
  whatsapp_number: string;
}) {
  const servicesText = data.services
    .map((s) => `- ${s.name}${s.price ? ` (${s.price})` : ""}`)
    .join("\n");
  const faqsText = data.faqs.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n");

  const systemPrompt = `You are the AI assistant for ${data.business_name}, a ${data.industry} business.
${data.business_description ? `About: ${data.business_description}` : ""}
${data.website ? `Website: ${data.website}` : ""}

SERVICES & PRICES:
${servicesText || "Ask the business for details."}

FREQUENTLY ASKED QUESTIONS:
${faqsText || "Answer helpfully based on the business info above."}

RULES:
- Be warm, friendly, and concise — like a helpful team member.
- Answer ONLY from the business info above. Never invent prices, services, or policies.
- If you don't know something, say so honestly and offer to have the team follow up.
- When someone wants to book or buy, collect their name and contact, confirm details, and say the team will confirm shortly.
- Keep replies short (2-4 sentences) unless the customer asks for detail.
- Never mention you are AI unless asked.`;

  return {
    business_name: data.business_name,
    industry: data.industry,
    system_prompt: systemPrompt,
    greeting: `Hi! Thanks for reaching out to ${data.business_name}. How can I help you today?`,
    whatsapp_number: data.whatsapp_number,
    services: data.services,
    faqs: data.faqs,
    generated_at: new Date().toISOString(),
  };
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in first." }, { status: 401 });
    }

    const body = await req.json();
    const { business_name, industry, website, business_description, services, faqs, whatsapp_number } = body;

    if (!business_name?.trim() || !industry?.trim() || !whatsapp_number?.trim()) {
      return NextResponse.json({ error: "Business name, industry, and WhatsApp number are required." }, { status: 400 });
    }

    const agentConfig = buildAgentConfig({
      business_name: business_name.trim(),
      industry: industry.trim(),
      website: (website || "").trim(),
      business_description: (business_description || "").trim(),
      services: Array.isArray(services) ? services : [],
      faqs: Array.isArray(faqs) ? faqs : [],
      whatsapp_number: whatsapp_number.trim(),
    });

    const { error } = await supabase.from("clients").upsert(
      {
        user_id: user.id,
        business_name: business_name.trim(),
        industry: industry.trim(),
        website: (website || "").trim() || null,
        business_description: (business_description || "").trim() || null,
        services: Array.isArray(services) ? services : [],
        faqs: Array.isArray(faqs) ? faqs : [],
        whatsapp_number: whatsapp_number.trim(),
        agent_config: agentConfig,
        agent_status: "preview",
      },
      { onConflict: "user_id" }
    );

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("onboarding error:", e);
    return NextResponse.json({ error: "Could not save. Please try again." }, { status: 500 });
  }
}
