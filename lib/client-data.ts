/**
 * Owner-scoped deletes for the client dashboard.
 *
 * The client sections (conversations, enquiries) could be viewed but
 * never removed by their owner (owner report 2026-10-30: "in mai edit
 * delete update bhi nahe hai"). These helpers own the RULES of the
 * delete; the storage operation itself is injected as `runDelete`,
 * which the API route builds from the service client — the same
 * pattern /api/profile PATCH uses, because RLS offers no DELETE
 * policy the session client can rely on. The scoping is therefore
 * enforced by the query itself: a row is only ever deleted when BOTH
 * its id and its owner column match, so one client can never delete
 * another client's record through these paths.
 */

export type ScopedDeleteOutcome =
  | { count: number | null; error: { message: string } | null };

/** Performs `delete from <table> where id = ? and <ownerColumn> = ?` with an exact count. */
export type ScopedDeleteFn = (
  table: string,
  ownerColumn: string,
  ownerId: string,
  id: string
) => Promise<ScopedDeleteOutcome>;

export type OwnDeleteResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "not-found" | "failed" };

async function deleteOwnedRow(
  runDelete: ScopedDeleteFn,
  table: string,
  ownerId: string,
  id: string
): Promise<OwnDeleteResult> {
  const cleanId = (id || "").trim();
  if (!cleanId || cleanId.length > 100) return { ok: false, reason: "invalid" };
  if (!ownerId) return { ok: false, reason: "invalid" };

  let outcome: ScopedDeleteOutcome;
  try {
    outcome = await runDelete(table, "user_id", ownerId, cleanId);
  } catch {
    return { ok: false, reason: "failed" };
  }
  if (outcome.error) return { ok: false, reason: "failed" };
  if (!outcome.count) return { ok: false, reason: "not-found" };
  return { ok: true };
}

/** Delete one of the signed-in user's own chat transcripts (Conversations page). */
export function deleteOwnConversation(
  runDelete: ScopedDeleteFn,
  userId: string,
  conversationId: string
): Promise<OwnDeleteResult> {
  return deleteOwnedRow(runDelete, "chat_transcripts", userId, conversationId);
}

/** Delete one of the signed-in user's own enquiries (dashboard overview). */
export function deleteOwnLead(
  runDelete: ScopedDeleteFn,
  userId: string,
  leadId: string
): Promise<OwnDeleteResult> {
  return deleteOwnedRow(runDelete, "leads", userId, leadId);
}
