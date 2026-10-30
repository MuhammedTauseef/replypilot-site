"use client";

import { useEffect, useState } from "react";

type Msg = { role: string; text: string };
type Conversation = {
  id: string;
  persona_name: string | null;
  messages: Msg[];
  created_at: string;
};

const PAGE_SIZE = 10;

/** /dashboard/client/conversations — own chat history (owner only). */
export default function ConversationsPage() {
  const [items, setItems] = useState<Conversation[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  async function load(nextOffset: number) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/conversations?limit=${PAGE_SIZE}&offset=${nextOffset}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load.");
      setItems(data.conversations || []);
      setTotal(data.total || 0);
      setOffset(nextOffset);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(0);
  }, []);

  async function remove(c: Conversation) {
    if (!confirm("Delete this conversation? This cannot be undone.")) return;
    setActionError(null);
    try {
      const res = await fetch(`/api/conversations?id=${encodeURIComponent(c.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed.");
      if (open === c.id) setOpen(null);
      // If the page just emptied and it is not the first page, step back one.
      if (items.length === 1 && offset > 0) load(offset - PAGE_SIZE);
      else load(offset);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Delete failed.");
    }
  }

  const shell = (children: React.ReactNode) => (
    <main className="admin-wrap">
      <div style={{ display: "grid", gap: 12, maxWidth: 720 }}>{children}</div>
    </main>
  );

  if (loading && items.length === 0)
    return shell(<p style={{ color: "var(--muted)" }}>Loading conversations…</p>);
  if (error)
    return shell(
      <p style={{ color: "#ef4444" }}>
        {error} <button onClick={() => load(0)}>Retry</button>
      </p>
    );
  if (items.length === 0)
    return shell(
      <>
        <h2 style={{ margin: "0 0 6px" }}>Conversation history</h2>
        <div className="empty" style={{ display: "grid", gap: 12, justifyItems: "start" }}>
          <strong style={{ color: "var(--ink, #111827)", fontSize: "1.05rem" }}>
            No conversations yet
          </strong>
          <span>
            This page collects the chats you have with ReplyPilot&rsquo;s demo agents
            and with the assistant on this website while you are signed in — so you
            can re-read exactly what was asked and answered. Nothing is here yet
            because you have not had a chat while signed in.
          </span>
          <span style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href="/demo" className="btn-small" style={{ textDecoration: "none" }}>
              💬 Try a live demo
            </a>
          </span>
        </div>
      </>
    );

  return shell(
    <>
      <h2 style={{ margin: "0 0 6px" }}>Conversation history</h2>
      <p style={{ color: "var(--muted)", fontSize: ".9rem", margin: "0 0 8px" }}>
        {total} conversation{total === 1 ? "" : "s"} — only you can see these.
      </p>

      {actionError && <p style={{ color: "#ef4444" }}>{actionError}</p>}

      {items.map((c) => {
        const isOpen = open === c.id;
        const preview = c.messages.find((m) => m.role === "user")?.text || "—";
        return (
          <div
            key={c.id}
            style={{
              border: "1px solid var(--line, #e5e7eb)",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <button
              onClick={() => setOpen(isOpen ? null : c.id)}
              style={{
                all: "unset",
                cursor: "pointer",
                display: "block",
                width: "100%",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <strong style={{ fontSize: ".95rem" }}>
                  {preview.slice(0, 80)}{preview.length > 80 ? "…" : ""}
                </strong>
                <span style={{ color: "var(--muted)", fontSize: ".85rem", whiteSpace: "nowrap" }}>
                  {new Date(c.created_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {isOpen ? " ▲" : " ▼"}
                </span>
              </div>
              {c.persona_name && (
                <span style={{ color: "var(--muted)", fontSize: ".85rem" }}>as {c.persona_name}</span>
              )}
            </button>
            {isOpen && (
              <>
                <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                  {c.messages.map((m, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        background: m.role === "user" ? "rgba(245,158,11,.1)" : "rgba(255,255,255,.03)",
                        fontSize: ".9rem",
                      }}
                    >
                      <strong style={{ fontSize: ".8rem", color: "var(--muted)" }}>
                        {m.role === "user" ? "You" : "AI"}:
                      </strong>{" "}
                      {m.text}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12 }}>
                  <button className="btn-small btn-danger" onClick={() => remove(c)}>
                    Delete this conversation
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button
          className="btn-small"
          disabled={offset === 0 || loading}
          onClick={() => load(Math.max(0, offset - PAGE_SIZE))}
        >
          ← Newer
        </button>
        <span style={{ color: "var(--muted)", fontSize: ".9rem" }}>
          {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of {total}
        </span>
        <button
          className="btn-small"
          disabled={offset + PAGE_SIZE >= total || loading}
          onClick={() => load(offset + PAGE_SIZE)}
        >
          Older →
        </button>
      </div>
    </>
  );
}
