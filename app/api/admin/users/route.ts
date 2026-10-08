import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in.", status: 401 } as const;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if ((profile as { role?: string } | null)?.role !== "admin") {
    return { error: "Admins only.", status: 403 } as const;
  }
  return { ok: true } as const;
}

/** GET /api/admin/users — list all registered users with emails (admin only). */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get all auth users
  const { data: usersData, error: usersError } =
    await service.auth.admin.listUsers();
  if (usersError) {
    return NextResponse.json({ error: "Failed to load users." }, { status: 500 });
  }

  // Get profiles for roles
  const { data: profiles } = await service
    .from("profiles")
    .select("id, full_name, role, created_at");

  const profileMap = new Map(
    (profiles || []).map((p: any) => [p.id, p])
  );

  // Get clients for business info
  const { data: clients } = await service
    .from("clients")
    .select("user_id, business_name, subscription_status");

  const clientMap = new Map(
    (clients || []).map((c: any) => [c.user_id, c])
  );

  // Get payment summary per user email
  const { data: payments } = await service
    .from("payments")
    .select("buyer_email, status, amount_cents")
    .eq("status", "succeeded");

  const paidEmails = new Set(
    (payments || []).map((p: any) => (p.buyer_email || "").toLowerCase())
  );

  const users = (usersData?.users || []).map((u: any) => {
    const profile = profileMap.get(u.id);
    const client = clientMap.get(u.id);
    return {
      id: u.id,
      email: u.email,
      full_name: profile?.full_name || u.user_metadata?.full_name || "—",
      role: profile?.role || "client",
      business_name: client?.business_name || "—",
      subscription_status: client?.subscription_status || "none",
      has_paid: paidEmails.has((u.email || "").toLowerCase()),
      created_at: u.created_at,
      last_sign_in: u.last_sign_in_at,
      email_confirmed: !!u.email_confirmed_at,
    };
  });

  // Sort by newest first
  users.sort(
    (a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return NextResponse.json({ users, total: users.length });
}
