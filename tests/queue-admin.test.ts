import { describe, it, expect } from "vitest";
import {
  updateQueueItem,
  deleteQueueItem,
  type QueueAdminDeps,
  type QueueItemPatch,
} from "@/lib/queue-admin";

type Status = "pending" | "publishing" | "published" | "failed";

interface Stored {
  id: string;
  status: Status;
  patch?: QueueItemPatch;
}

const PATCH: QueueItemPatch = {
  title: "Edited title",
  excerpt: "Edited excerpt",
  content: [{ type: "p", text: "edited body" }],
  keywords: ["edited"],
  cover_image: null,
  scheduled_publish_at: "2026-11-02T05:20:00.000Z",
};

function makeHarness(items: Stored[]) {
  const deps: QueueAdminDeps = {
    getStatus: async (id) => items.find((i) => i.id === id)?.status ?? null,
    updatePending: async (id, patch) => {
      const it = items.find((i) => i.id === id);
      if (!it || it.status !== "pending") return false;
      it.patch = patch;
      return true;
    },
    deletePending: async (id) => {
      const idx = items.findIndex((i) => i.id === id);
      if (idx < 0 || items[idx].status !== "pending") return false;
      items.splice(idx, 1);
      return true;
    },
  };
  return { deps, items };
}

describe("updateQueueItem", () => {
  it("updates a pending item, including its schedule", async () => {
    const { deps, items } = makeHarness([{ id: "q1", status: "pending" }]);
    const res = await updateQueueItem(deps, "q1", PATCH);
    expect(res.ok).toBe(true);
    expect(items[0].patch).toEqual(PATCH);
    expect(items[0].patch?.scheduled_publish_at).toBe(
      "2026-11-02T05:20:00.000Z"
    );
  });

  it("refuses to edit a publishing item", async () => {
    const { deps, items } = makeHarness([{ id: "q1", status: "publishing" }]);
    const res = await updateQueueItem(deps, "q1", PATCH);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.reason).toBe("not-pending");
      expect(res.status).toBe("publishing");
    }
    expect(items[0].patch).toBeUndefined();
  });

  it("refuses to edit a published item", async () => {
    const { deps, items } = makeHarness([{ id: "q1", status: "published" }]);
    const res = await updateQueueItem(deps, "q1", PATCH);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.reason).toBe("not-pending");
      expect(res.status).toBe("published");
    }
    expect(items[0].patch).toBeUndefined();
  });

  it("refuses to edit a failed item", async () => {
    const { deps } = makeHarness([{ id: "q1", status: "failed" }]);
    const res = await updateQueueItem(deps, "q1", PATCH);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toBe("not-pending");
  });

  it("reports a missing item as not-found", async () => {
    const { deps } = makeHarness([]);
    const res = await updateQueueItem(deps, "nope", PATCH);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toBe("not-found");
  });

  it("refuses when the item is claimed between the check and the write", async () => {
    const stored: Stored = { id: "q1", status: "pending" };
    const deps: QueueAdminDeps = {
      getStatus: async () => stored.status,
      updatePending: async () => {
        // The cron claimed the item first; the conditional write no-ops.
        stored.status = "publishing";
        return false;
      },
      deletePending: async () => false,
    };
    const res = await updateQueueItem(deps, "q1", PATCH);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.reason).toBe("not-pending");
      expect(res.status).toBe("publishing");
    }
  });
});

describe("deleteQueueItem", () => {
  it("deletes a pending item", async () => {
    const { deps, items } = makeHarness([{ id: "q1", status: "pending" }]);
    const res = await deleteQueueItem(deps, "q1");
    expect(res.ok).toBe(true);
    expect(items).toHaveLength(0);
  });

  it("refuses to delete a publishing item", async () => {
    const { deps, items } = makeHarness([{ id: "q1", status: "publishing" }]);
    const res = await deleteQueueItem(deps, "q1");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.reason).toBe("not-pending");
      expect(res.status).toBe("publishing");
    }
    expect(items).toHaveLength(1);
  });

  it("refuses to delete a published item", async () => {
    const { deps, items } = makeHarness([{ id: "q1", status: "published" }]);
    const res = await deleteQueueItem(deps, "q1");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.reason).toBe("not-pending");
      expect(res.status).toBe("published");
    }
    expect(items).toHaveLength(1);
  });

  it("refuses to delete a failed item", async () => {
    const { deps, items } = makeHarness([{ id: "q1", status: "failed" }]);
    const res = await deleteQueueItem(deps, "q1");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toBe("not-pending");
    expect(items).toHaveLength(1);
  });

  it("reports a missing item as not-found", async () => {
    const { deps } = makeHarness([]);
    const res = await deleteQueueItem(deps, "nope");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toBe("not-found");
  });
});
