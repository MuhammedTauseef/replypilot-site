"use client";

import { useEffect, useRef } from "react";

/**
 * In-page confirmation dialog for destructive actions.
 *
 * This replaces the browser-native `confirm()` gate, which silently
 * returns `false` — with no dialog shown at all — in environments that
 * don't present JS modal dialogs (browser-automation sessions, Android
 * WebViews without a JS-dialog handler, cross-origin iframes). When that
 * happened, Delete/Reset clicks looked completely dead: no dialog, no
 * message, no API call. A DOM-rendered dialog works in every context.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    // Safe default: focus Cancel, never the destructive button.
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "rgba(0,0,0,.45)",
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
      onClick={() => {
        if (!busy) onCancel();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title || message}
        style={{
          background: "var(--paper, #fff)",
          color: "var(--ink, #111827)",
          border: "1px solid var(--line, #e5e7eb)",
          borderRadius: 14,
          padding: 22,
          maxWidth: 420,
          width: "100%",
          display: "grid",
          gap: 14,
          boxShadow: "0 18px 50px rgba(0,0,0,.28)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <strong style={{ fontSize: "1.02rem" }}>{title}</strong>
        )}
        <p style={{ margin: 0, color: "var(--muted)", fontSize: ".95rem" }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button
            type="button"
            ref={cancelRef}
            className="btn-small"
            disabled={busy}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-small btn-danger"
            disabled={busy}
            onClick={onConfirm}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
