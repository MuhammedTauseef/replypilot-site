import { describe, it, expect } from "vitest";
import {
  runPublishQueue,
  MAX_ATTEMPTS,
  type PublishQueueDeps,
  type QueueItem,
} from "@/lib/publish-queue";
import type { AdminPublishResult } from "@/lib/admin-automation";

const NOW = new Date("2026-10-27T05:20:00.000Z");
const DUE = "2026-10-27T05:20:00.000Z";
const FUTURE = "2026-10-28T05:20:00.000Z";

type Status = "pending" | "publishing" | "published" | "failed";

interface Stored extends QueueItem {
  status: Status;
  publishedPostId?: string | null;
}

function makeItem(over: Partial<Stored> = {}): Stored {
  return {
    id: over.id ?? "q1",
    slug: over.slug ?? "test-post",
    title: "Test Post",
    excerpt: "",
    content: [{ type: "p", text: "hello" }],
    keywords: [],
    cover_image: null,
    scheduled_publish_at: over.scheduled_publish_at ?? DUE,
    attempts: over.attempts ?? 0,
    status: over.status ?? "pending",
  };
}

function makeHarness(
  items: Stored[],
  publishImpl: (item: QueueItem) => Promise<AdminPublishResult>,
  postsBySlug: Record<string, { id: string; published: boolean }> = {}
) {
  const publishCalls: string[] = [];
  const logs: string[] = [];
  const deps: PublishQueueDeps = {
    now: () => NOW,
    findNextDue: async (nowIso) =>
      items
        .filter(
          (i) =>
            i.status === "pending" &&
            i.attempts < MAX_ATTEMPTS &&
            i.scheduled_publish_at <= nowIso
        )
        .sort((a, b) =>
          a.scheduled_publish_at < b.scheduled_publish_at ? -1 : 1
        )[0] ?? null,
    claim: async (id) => {
      const it = items.find((i) => i.id === id);
      if (!it || it.status !== "pending") return false;
      it.status = "publishing";
      return true;
    },
    publish: async (item) => {
      publishCalls.push(item.slug);
      return publishImpl(item);
    },
    findPostBySlug: async (slug) => postsBySlug[slug] ?? null,
    markPublished: async (id, postId) => {
      const it = items.find((i) => i.id === id)!;
      it.status = "published";
      it.publishedPostId = postId;
    },
    markFailed: async (id) => {
      items.find((i) => i.id === id)!.status = "failed";
    },
    revertToPending: async (id, _error, attempts) => {
      const it = items.find((i) => i.id === id)!;
      it.status = "pending";
      it.attempts = attempts;
    },
    queueSnapshot: async () => ({
      pending: items.filter((i) => i.status === "pending").length,
      failed: items.filter((i) => i.status === "failed").length,
      nextScheduledAt:
        items
          .filter((i) => i.status === "pending")
          .sort((a, b) =>
            a.scheduled_publish_at < b.scheduled_publish_at ? -1 : 1
          )[0]?.scheduled_publish_at ?? null,
    }),
    log: async (action) => {
      logs.push(action);
    },
  };
  return { deps, publishCalls, logs };
}

const publishOk = async (): Promise<AdminPublishResult> => ({
  ok: true,
  postId: "post-1",
});

describe("runPublishQueue", () => {
  it("publishes one due item exactly once — a second run is a noop", async () => {
    const items = [makeItem()];
    const { deps, publishCalls } = makeHarness(items, publishOk);

    const first = await runPublishQueue(deps);
    expect(first.action).toBe("published");
    expect(items[0].status).toBe("published");

    const second = await runPublishQueue(deps);
    expect(second.action).toBe("noop");
    // The publish-once guarantee: the admin API was invoked one time total.
    expect(publishCalls).toEqual(["test-post"]);
  });

  it("publishes at most one item per run when several are due", async () => {
    const items = [
      makeItem({ id: "q1", slug: "earlier", scheduled_publish_at: DUE }),
      makeItem({ id: "q2", slug: "later", scheduled_publish_at: DUE }),
    ];
    const { deps, publishCalls } = makeHarness(items, publishOk);

    const first = await runPublishQueue(deps);
    expect(first.action).toBe("published");
    expect(publishCalls).toHaveLength(1);
    expect(items.filter((i) => i.status === "published")).toHaveLength(1);

    const second = await runPublishQueue(deps);
    expect(second.action).toBe("published");
    expect(publishCalls).toHaveLength(2);
  });

  it("does nothing when the only item is scheduled in the future", async () => {
    const items = [makeItem({ scheduled_publish_at: FUTURE })];
    const { deps, publishCalls } = makeHarness(items, publishOk);

    const result = await runPublishQueue(deps);
    expect(result.action).toBe("noop");
    expect(publishCalls).toHaveLength(0);
    expect(items[0].status).toBe("pending");
  });

  it("stops without publishing when the claim is lost to another run", async () => {
    const items = [makeItem()];
    const { deps, publishCalls } = makeHarness(items, publishOk);
    deps.claim = async () => false;

    const result = await runPublishQueue(deps);
    expect(result.action).toBe("claimed-by-other");
    expect(publishCalls).toHaveLength(0);
  });

  it("reconciles a duplicate-slug rejection when the post is already live", async () => {
    const items = [makeItem()];
    const { deps, publishCalls } = makeHarness(
      items,
      async () => ({
        ok: false,
        status: 400,
        error: "A post with this slug already exists.",
        slugExists: true,
      }),
      { "test-post": { id: "post-existing", published: true } }
    );

    const result = await runPublishQueue(deps);
    expect(result.action).toBe("already-published");
    expect(items[0].status).toBe("published");
    expect(items[0].publishedPostId).toBe("post-existing");
    expect(publishCalls).toHaveLength(1);
  });

  it("fails the item without touching an unpublished slug conflict", async () => {
    const items = [makeItem()];
    const { deps } = makeHarness(
      items,
      async () => ({
        ok: false,
        status: 400,
        error: "A post with this slug already exists.",
        slugExists: true,
      }),
      { "test-post": { id: "draft-1", published: false } }
    );

    const result = await runPublishQueue(deps);
    expect(result.action).toBe("failed");
    expect(items[0].status).toBe("failed");
  });

  it("reverts to pending with attempts+1 on a transient publish error", async () => {
    const items = [makeItem()];
    const { deps } = makeHarness(items, async () => ({
      ok: false,
      status: 500,
      error: "boom",
      slugExists: false,
    }));

    const result = await runPublishQueue(deps);
    expect(result.action).toBe("error");
    expect(items[0].status).toBe("pending");
    expect(items[0].attempts).toBe(1);
  });

  it("marks the item failed once attempts reach the cap", async () => {
    const items = [makeItem({ attempts: MAX_ATTEMPTS - 1 })];
    const { deps } = makeHarness(items, async () => ({
      ok: false,
      status: 500,
      error: "boom",
      slugExists: false,
    }));

    const result = await runPublishQueue(deps);
    expect(result.action).toBe("failed");
    expect(items[0].status).toBe("failed");
  });

  it("never picks an item that already exhausted its attempts", async () => {
    const items = [makeItem({ attempts: MAX_ATTEMPTS })];
    const { deps, publishCalls } = makeHarness(items, publishOk);

    const result = await runPublishQueue(deps);
    expect(result.action).toBe("noop");
    expect(publishCalls).toHaveLength(0);
  });
});
