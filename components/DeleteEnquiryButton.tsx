"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Delete button for one of the signed-in user's own enquiries on the
 * dashboard overview. Confirms first (the documents-page pattern),
 * then calls DELETE /api/leads?id= — the API deletes only rows whose
 * user_id matches the signed-in user — and refreshes the server list.
 */
export default function DeleteEnquiryButton({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function remove() {
    if (busy) return;
    if (!confirm("Delete this enquiry? This cannot be undone.")) return;
    setBusy(true);
    setFailed(false);
    try {
      const res = await fetch(`/api/leads?id=${encodeURIComponent(leadId)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("delete failed");
      router.refresh();
    } catch {
      setFailed(true);
      setBusy(false);
    }
  }

  return (
    <span style={{ display: "inline-flex", flexDirection: "column", gap: 4 }}>
      <button className="btn-small btn-danger" disabled={busy} onClick={remove}>
        {busy ? "Deleting…" : "Delete"}
      </button>
      {failed && (
        <span style={{ color: "#dc2626", fontSize: ".8rem" }}>
          Couldn&apos;t delete — try again.
        </span>
      )}
    </span>
  );
}
