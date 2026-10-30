import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServiceClient } from "@/lib/supabase/service";
import { deleteOwnConversation, type ScopedDeleteFn } from "@/lib/client-data";

/** GET /api/conversations — own chat transcripts, paginated (owner only).
 * Query: ?limit=20&offset=0 (max limit 50)
 */
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const limit = Math.min(Math.max(parseInt(req.nextUrl.searchParams.get("limit") || "20", 10) || 20, 1), 50);
  const offset = Math.max(parseInt(req.nextUrl.searchParams.get("offset") || "0", 10) || 0, 0);

  // RLS enforces user_id = auth.uid(); the explicit filter is defense-in-depth.
  const { data, error, count } = await supabase
    .from("chat_transcripts")
    .select("id, persona_name, messages, created_at", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("[conversations] load failed:", error.message.slice(0, 200));
    return NextResponse.json({ error: "Failed to load conversations." }, { status: 500 });
  }

  return NextResponse.json({
    conversations: data || [],
    total: count || 0,
    limit,
    offset,
  });
}

/** DELETE /api/conversations?id=... — delete one of the signed-in user's
 * own conversations. The delete runs through the service client (the
 * /api/profile PATCH pattern) with the owner scope inside the query
 * itself — `where id = ? and user_id = auth user` — so a client can
 * only ever remove their own transcripts. */
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id") || "";
  const service = getServiceClient();
  if (!service) {
    return NextResponse.json(
      { error: "Service not configured (missing SUPABASE_SERVICE_ROLE_KEY)." },
      { status: 503 }
    );
  }

  const runDelete: ScopedDeleteFn = async (table, ownerColumn, ownerId, rowId) => {
    const { count, error } = await service
      .from(table)
      .delete({ count: "exact" })
      .eq("id", rowId)
      .eq(ownerColumn, ownerId);
    return { count, error: error ? { message: error.message } : null };
  };

  const result = await deleteOwnConversation(runDelete, user.id, id);
  if (!result.ok) {
    if (result.reason === "invalid") {
      return NextResponse.json({ error: "Missing conversation id." }, { status: 400 });
    }
    if (result.reason === "not-found") {
      return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete conversation." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
