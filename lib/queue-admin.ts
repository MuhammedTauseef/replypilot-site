import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Admin mutations for the article buffer (blog_publish_queue), used by
 * the Buffer Queue admin page via /api/admin/blog/queue.
 *
 * Safety rule: only items still waiting with status 'pending' may be
 * edited, rescheduled or deleted. An item the publisher has claimed
 * ('publishing') or finished ('published') — or one that exhausted its
 * attempts ('failed') — is refused here, in the API layer, no matter
 * what the UI shows. Published items are edited as normal posts in
 * /admin/blog, never through the buffer.
 *
 * The guard is enforced twice: a status read first (for a clear error),
 * and the write itself is conditioned on status = 'pending', so a race
 * with the publisher cron can never edit or delete a claimed item.
 *
 * The logic runs against injected deps so it is unit-testable without
 * Supabase; createSupabaseQueueAdminDeps() wires the real store.
 */

export interface QueueItemPatch {
  title: string;
  excerpt: string;
  content: unknown[];
  keywords: string[];
  cover_image: string | null;
  scheduled_publish_at: string;
}

export interface QueueAdminDeps {
  /** Current status of the item, or null when it does not exist. */
  getStatus: (id: string) => Promise<string | null>;
  /** Apply the patch only while the row is still 'pending'. True when a row changed. */
  updatePending: (id: string, patch: QueueItemPatch) => Promise<boolean>;
  /** Delete the row only while it is still 'pending'. True when a row was removed. */
  deletePending: (id: string) => Promise<boolean>;
}

export type QueueMutationResult =
  | { ok: true }
  | {
      ok: false;
      reason: "not-found" | "not-pending";
      status?: string;
      error: string;
    };

function notPending(status: string): QueueMutationResult {
  return {
    ok: false,
    reason: "not-pending",
    status,
    error: `Only waiting (pending) items can be changed here. This item is "${status}".`,
  };
}

export async function updateQueueItem(
  deps: QueueAdminDeps,
  id: string,
  patch: QueueItemPatch
): Promise<QueueMutationResult> {
  const status = await deps.getStatus(id);
  if (status === null) {
    return { ok: false, reason: "not-found", error: "Queue item not found." };
  }
  if (status !== "pending") return notPending(status);

  const changed = await deps.updatePending(id, patch);
  if (!changed) {
    // Status flipped between the check and the write (e.g. the cron
    // claimed the item) — the conditional write refused it.
    const now = await deps.getStatus(id);
    return now === null
      ? { ok: false, reason: "not-found", error: "Queue item not found." }
      : notPending(now);
  }
  return { ok: true };
}

export async function deleteQueueItem(
  deps: QueueAdminDeps,
  id: string
): Promise<QueueMutationResult> {
  const status = await deps.getStatus(id);
  if (status === null) {
    return { ok: false, reason: "not-found", error: "Queue item not found." };
  }
  if (status !== "pending") return notPending(status);

  const removed = await deps.deletePending(id);
  if (!removed) {
    const now = await deps.getStatus(id);
    return now === null
      ? { ok: false, reason: "not-found", error: "Queue item not found." }
      : notPending(now);
  }
  return { ok: true };
}

/** Wire the mutations to Supabase (the caller's admin session client). */
export function createSupabaseQueueAdminDeps(
  client: SupabaseClient
): QueueAdminDeps {
  return {
    async getStatus(id) {
      const { data, error } = await client
        .from("blog_publish_queue")
        .select("status")
        .eq("id", id)
        .single();
      if (error || !data) return null;
      return String((data as { status?: unknown }).status ?? "");
    },

    async updatePending(id, patch) {
      const { data, error } = await client
        .from("blog_publish_queue")
        .update({
          title: patch.title,
          excerpt: patch.excerpt,
          content: patch.content,
          keywords: patch.keywords,
          cover_image: patch.cover_image,
          scheduled_publish_at: patch.scheduled_publish_at,
        })
        .eq("id", id)
        .eq("status", "pending")
        .select("id");
      return !error && Array.isArray(data) && data.length === 1;
    },

    async deletePending(id) {
      const { data, error } = await client
        .from("blog_publish_queue")
        .delete()
        .eq("id", id)
        .eq("status", "pending")
        .select("id");
      return !error && Array.isArray(data) && data.length === 1;
    },
  };
}
