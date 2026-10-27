import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminPublishDraft, AdminPublishResult } from "@/lib/admin-automation";

/**
 * Auto-publisher run logic (ReplyPilot article buffer).
 *
 * One run publishes AT MOST ONE due queue item, and it publishes by
 * invoking the admin publish API (see lib/admin-automation.ts) — never
 * by writing to blog_posts directly. Idempotency rests on three guards:
 * the atomic claim (pending -> publishing), the queue status machine,
 * and the admin API's own duplicate-slug rejection, which the runner
 * treats as an already-published recovery, not an error.
 *
 * The logic runs against injected deps so it is unit-testable without
 * Supabase; createSupabaseQueueDeps() wires the real store.
 */

export const MAX_ATTEMPTS = 5;

export interface QueueItem extends AdminPublishDraft {
  id: string;
  scheduled_publish_at: string;
  attempts: number;
}

export interface QueueSnapshot {
  pending: number;
  failed: number;
  nextScheduledAt: string | null;
}

export interface PublishQueueDeps {
  now: () => Date;
  /** Earliest due pending item (scheduled <= now, attempts < MAX), or null. */
  findNextDue: (nowIso: string) => Promise<QueueItem | null>;
  /** Atomic pending -> publishing transition; false if another run owns it. */
  claim: (id: string) => Promise<boolean>;
  /** Publish through the admin API. */
  publish: (item: QueueItem) => Promise<AdminPublishResult>;
  /** Look up an existing blog post by slug (admin read). */
  findPostBySlug: (
    slug: string
  ) => Promise<{ id: string; published: boolean } | null>;
  markPublished: (id: string, postId: string | null) => Promise<void>;
  markFailed: (id: string, error: string) => Promise<void>;
  revertToPending: (id: string, error: string, attempts: number) => Promise<void>;
  queueSnapshot: () => Promise<QueueSnapshot>;
  log: (action: string, item: QueueItem | null, detail: string) => Promise<void>;
}

export type PublishRunAction =
  | "published"
  | "noop"
  | "already-published"
  | "claimed-by-other"
  | "error"
  | "failed";

export interface PublishRunResult {
  action: PublishRunAction;
  slug?: string;
  detail: string;
  queue: QueueSnapshot;
}

export async function runPublishQueue(
  deps: PublishQueueDeps
): Promise<PublishRunResult> {
  const item = await deps.findNextDue(deps.now().toISOString());

  if (!item) {
    await deps.log("noop", null, "No due queue item.");
    return {
      action: "noop",
      detail: "No due queue item.",
      queue: await deps.queueSnapshot(),
    };
  }

  if (!(await deps.claim(item.id))) {
    await deps.log("claimed-by-other", item, "Claim lost to another run.");
    return {
      action: "claimed-by-other",
      slug: item.slug,
      detail: "Queue item was claimed by another run; nothing published.",
      queue: await deps.queueSnapshot(),
    };
  }

  const result = await deps.publish(item);

  if (result.ok) {
    await deps.markPublished(item.id, result.postId);
    await deps.log(
      "published",
      item,
      `Published via admin API${result.postId ? ` as post ${result.postId}` : ""}.`
    );
    return {
      action: "published",
      slug: item.slug,
      detail: "Published via the admin publish API; auto-deploy triggered by the admin action.",
      queue: await deps.queueSnapshot(),
    };
  }

  if (result.slugExists) {
    // A previous attempt created the post but crashed before the queue
    // update. The admin API's duplicate-slug rejection makes this
    // recoverable without ever publishing twice.
    const existing = await deps.findPostBySlug(item.slug);
    if (existing && existing.published) {
      await deps.markPublished(item.id, existing.id);
      await deps.log(
        "already-published",
        item,
        `Post ${existing.id} already live; queue row reconciled.`
      );
      return {
        action: "already-published",
        slug: item.slug,
        detail: "Post was already published by an earlier attempt; queue reconciled, nothing re-posted.",
        queue: await deps.queueSnapshot(),
      };
    }
    const conflict =
      "Slug is taken by an existing unpublished post (possible human draft); queue item failed without touching it.";
    await deps.markFailed(item.id, conflict);
    await deps.log("failed", item, conflict);
    return {
      action: "failed",
      slug: item.slug,
      detail: conflict,
      queue: await deps.queueSnapshot(),
    };
  }

  const attempts = item.attempts + 1;
  if (attempts >= MAX_ATTEMPTS) {
    await deps.markFailed(item.id, result.error);
    await deps.log(
      "failed",
      item,
      `Attempt ${attempts}/${MAX_ATTEMPTS} failed: ${result.error}`
    );
    return {
      action: "failed",
      slug: item.slug,
      detail: `Publish failed ${attempts} times; item marked failed. Last error: ${result.error}`,
      queue: await deps.queueSnapshot(),
    };
  }

  await deps.revertToPending(item.id, result.error, attempts);
  await deps.log(
    "error",
    item,
    `Attempt ${attempts}/${MAX_ATTEMPTS} failed, reverted to pending: ${result.error}`
  );
  return {
    action: "error",
    slug: item.slug,
    detail: `Publish attempt ${attempts} failed and was reverted to pending: ${result.error}`,
    queue: await deps.queueSnapshot(),
  };
}

/**
 * Wire the runner to Supabase. `client` must be the automation admin's
 * session client (RLS-bound) — the queue tables carry an admin-all
 * policy, and no service-role key is used anywhere in this system.
 */
export function createSupabaseQueueDeps(
  client: SupabaseClient,
  publish: (item: QueueItem) => Promise<AdminPublishResult>
): PublishQueueDeps {
  return {
    now: () => new Date(),

    async findNextDue(nowIso) {
      const { data, error } = await client
        .from("blog_publish_queue")
        .select(
          "id, slug, title, excerpt, content, keywords, cover_image, scheduled_publish_at, attempts"
        )
        .eq("status", "pending")
        .lt("attempts", MAX_ATTEMPTS)
        .lte("scheduled_publish_at", nowIso)
        .order("scheduled_publish_at", { ascending: true })
        .order("created_at", { ascending: true })
        .limit(1);
      if (error || !data || data.length === 0) return null;
      const row = data[0] as Record<string, unknown>;
      return {
        id: String(row.id),
        slug: String(row.slug),
        title: String(row.title),
        excerpt: String(row.excerpt ?? ""),
        content: Array.isArray(row.content) ? (row.content as unknown[]) : [],
        keywords: Array.isArray(row.keywords) ? (row.keywords as string[]) : [],
        cover_image: (row.cover_image as string) || null,
        scheduled_publish_at: String(row.scheduled_publish_at),
        attempts: Number(row.attempts ?? 0),
      };
    },

    async claim(id) {
      const { data, error } = await client
        .from("blog_publish_queue")
        .update({ status: "publishing" })
        .eq("id", id)
        .eq("status", "pending")
        .select("id");
      return !error && Array.isArray(data) && data.length === 1;
    },

    publish,

    async findPostBySlug(slug) {
      const { data, error } = await client
        .from("blog_posts")
        .select("id, published")
        .eq("slug", slug)
        .single();
      if (error || !data) return null;
      return {
        id: String((data as { id: unknown }).id),
        published: (data as { published?: unknown }).published !== false,
      };
    },

    async markPublished(id, postId) {
      await client
        .from("blog_publish_queue")
        .update({
          status: "published",
          published_post_id: postId,
          published_at: new Date().toISOString(),
          last_error: null,
        })
        .eq("id", id);
    },

    async markFailed(id, error) {
      await client
        .from("blog_publish_queue")
        .update({ status: "failed", last_error: error.slice(0, 500) })
        .eq("id", id);
    },

    async revertToPending(id, error, attempts) {
      await client
        .from("blog_publish_queue")
        .update({
          status: "pending",
          attempts,
          last_error: error.slice(0, 500),
        })
        .eq("id", id);
    },

    async queueSnapshot() {
      const pendingRes = await client
        .from("blog_publish_queue")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");
      const failedRes = await client
        .from("blog_publish_queue")
        .select("id", { count: "exact", head: true })
        .eq("status", "failed");
      const nextRes = await client
        .from("blog_publish_queue")
        .select("scheduled_publish_at")
        .eq("status", "pending")
        .order("scheduled_publish_at", { ascending: true })
        .limit(1);
      const nextRow =
        !nextRes.error && nextRes.data && nextRes.data.length > 0
          ? (nextRes.data[0] as { scheduled_publish_at?: unknown })
          : null;
      return {
        pending: pendingRes.count ?? 0,
        failed: failedRes.count ?? 0,
        nextScheduledAt: nextRow
          ? String(nextRow.scheduled_publish_at ?? "") || null
          : null,
      };
    },

    async log(action, item, detail) {
      try {
        await client.from("blog_publish_log").insert({
          action,
          queue_id: item?.id ?? null,
          slug: item?.slug ?? null,
          detail: detail.slice(0, 500),
        });
      } catch {
        // Logging must never break a run.
      }
    },
  };
}
