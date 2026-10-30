"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ConfirmDialog";

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
  const [confirming, setConfirming] = useState(false);

  async function onDelete() {
    if (busy) return;
    setConfirming(false);
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
    <>
    <button
      type="button"
      onClick={() => setConfirming(true)}
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
    <ConfirmDialog
      open={confirming}
      title="Remove from the buffer queue?"
      message={`Remove "${title}" from the buffer queue? It will not be published. This cannot be undone.`}
      confirmLabel="Remove"
      busy={busy}
      onConfirm={onDelete}
      onCancel={() => {
        if (!busy) setConfirming(false);
      }}
    />
    </>
  );
}
