import { describe, it, expect } from "vitest";
import {
  deleteOwnConversation,
  deleteOwnLead,
  type ScopedDeleteFn,
} from "@/lib/client-data";

/**
 * Fake storage: rows belong to owners; runDelete mimics
 * `delete where id = ? and user_id = ?` with an exact count —
 * the same semantics the API routes build from the service client.
 */
function makeStore(rows: { id: string; user_id: string }[]) {
  const calls: { table: string; ownerColumn: string; ownerId: string; id: string }[] = [];
  const runDelete: ScopedDeleteFn = async (table, ownerColumn, ownerId, id) => {
    calls.push({ table, ownerColumn, ownerId, id });
    const idx = rows.findIndex((r) => r.id === id && r.user_id === ownerId);
    if (idx === -1) return { count: 0, error: null };
    rows.splice(idx, 1);
    return { count: 1, error: null };
  };
  return { rows, calls, runDelete };
}

describe("deleteOwnConversation", () => {
  it("deletes the owner's own conversation from chat_transcripts, scoped by user_id", async () => {
    const store = makeStore([
      { id: "c1", user_id: "user-a" },
      { id: "c2", user_id: "user-a" },
    ]);
    const res = await deleteOwnConversation(store.runDelete, "user-a", "c1");
    expect(res).toEqual({ ok: true });
    expect(store.rows.map((r) => r.id)).toEqual(["c2"]);
    expect(store.calls).toEqual([
      { table: "chat_transcripts", ownerColumn: "user_id", ownerId: "user-a", id: "c1" },
    ]);
  });

  it("cannot delete another user's conversation — the scoped delete matches nothing", async () => {
    const store = makeStore([{ id: "c9", user_id: "user-b" }]);
    const res = await deleteOwnConversation(store.runDelete, "user-a", "c9");
    expect(res).toEqual({ ok: false, reason: "not-found" });
    // The other user's row is untouched.
    expect(store.rows).toEqual([{ id: "c9", user_id: "user-b" }]);
    // And the attempt was still scoped to the CALLER's id, never the victim's.
    expect(store.calls[0].ownerId).toBe("user-a");
  });

  it("rejects a missing/blank id without touching storage", async () => {
    const store = makeStore([{ id: "c1", user_id: "user-a" }]);
    expect(await deleteOwnConversation(store.runDelete, "user-a", "")).toEqual({
      ok: false,
      reason: "invalid",
    });
    expect(await deleteOwnConversation(store.runDelete, "user-a", "   ")).toEqual({
      ok: false,
      reason: "invalid",
    });
    expect(store.calls).toEqual([]);
    expect(store.rows).toHaveLength(1);
  });

  it("maps a storage error to a failed result", async () => {
    const failing: ScopedDeleteFn = async () => ({
      count: null,
      error: { message: "db down" },
    });
    expect(await deleteOwnConversation(failing, "user-a", "c1")).toEqual({
      ok: false,
      reason: "failed",
    });
  });
});

describe("deleteOwnLead", () => {
  it("deletes the owner's own enquiry from leads, scoped by user_id", async () => {
    const store = makeStore([{ id: "l1", user_id: "user-a" }]);
    const res = await deleteOwnLead(store.runDelete, "user-a", "l1");
    expect(res).toEqual({ ok: true });
    expect(store.rows).toEqual([]);
    expect(store.calls[0].table).toBe("leads");
    expect(store.calls[0].ownerColumn).toBe("user_id");
  });

  it("cannot delete another user's enquiry", async () => {
    const store = makeStore([{ id: "l7", user_id: "user-b" }]);
    const res = await deleteOwnLead(store.runDelete, "user-a", "l7");
    expect(res).toEqual({ ok: false, reason: "not-found" });
    expect(store.rows).toEqual([{ id: "l7", user_id: "user-b" }]);
  });
});
