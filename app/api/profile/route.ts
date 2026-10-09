import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

/** GET /api/profile — own profile (authenticated only). */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at")
    .eq("id", user.id)
    .single();

  return NextResponse.json({
    profile: {
      id: user.id,
      email: user.email,
      full_name: (profile as { full_name?: string } | null)?.full_name || "",
      role: (profile as { role?: string } | null)?.role || "client",
      created_at: (profile as { created_at?: string } | null)?.created_at || null,
      email_confirmed: !!user.email_confirmed_at,
    },
  });
}

/** PATCH /api/profile — update own profile (authenticated only).
 * Only full_name is editable. role, id, email are NEVER writable here.
 */
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: { full_name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const full_name = (body.full_name || "").trim().slice(0, 120);
  if (!full_name) {
    return NextResponse.json({ error: "Name cannot be empty." }, { status: 400 });
  }
  // Block obvious injection / control chars
  if (/[<>"\x00-\x1f]/.test(full_name)) {
    return NextResponse.json({ error: "Name contains invalid characters." }, { status: 400 });
  }

  // Service client: RLS has no UPDATE policy on profiles, so we update
  // server-side scoped to the authenticated user's own id. Only full_name
  // is ever written — role escalation is impossible through this route.
  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await service
    .from("profiles")
    .update({ full_name })
    .eq("id", user.id);

  if (error) {
    console.error("[profile] update failed:", error.message.slice(0, 200));
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, full_name });
}
