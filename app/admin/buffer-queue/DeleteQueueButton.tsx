"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Delete button for a pending Buffer Queue item (confirm first). */
export default function DeleteQueueButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (busy) return;
    const ok = window.confirm(
      `Remove "${title}" from the buffer queue? It will not be published. This cannot be undone.`
    );
    if (!ok) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/blog/queue?id=${id}`, {
        method: "DELETE",
      });
      const d = await res.json().catch(() => null);
      if (!res.ok) throw new Error(d?.error || "failed");
      router.refresh();
    } catch (e) {
      alert(
        e instanceof Error && e.message !== "failed"
          ? e.message
          : "Could not delete. Please try again."
      );
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={busy}
      title="Remove from the buffer queue"
      style={{
        background: "none",
        border: "none",
        cursor: busy ? "wait" : "pointer",
        color: "#b3261e",
        fontSize: ".9rem",
        padding: 0,
      }}
    >
      {busy ? "…" : "Delete"}
    </button>
  );
}
