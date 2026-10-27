"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import BlogEditor, { type Block } from "@/components/BlogEditor";

/** ISO instant -> "YYYY-MM-DDTHH:mm" wall time in Asia/Karachi (for datetime-local). */
function isoToPktInput(iso: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Karachi",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(iso));
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
    return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
  } catch {
    return "";
  }
}

/** datetime-local value, interpreted as PKT (UTC+5, no DST), -> ISO instant. */
function pktInputToIso(value: string): string | null {
  if (!value) return null;
  const d = new Date(`${value}:00+05:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** /admin/buffer-queue/[id] — edit / reschedule a waiting (pending) queue item. */
function EditQueueItemForm() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [keywords, setKeywords] = useState("");
  const [cover, setCover] = useState("");
  const [scheduled, setScheduled] = useState("");
  const [blocks, setBlocks] = useState<Block[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/blog/queue?id=${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.item) {
          setError("Queue item not found.");
          setLoading(false);
          return;
        }
        const it = d.item;
        setStatus(it.status || "");
        setSlug(it.slug || "");
        setTitle(it.title || "");
        setExcerpt(it.excerpt || "");
        setKeywords((it.keywords || []).join(", "));
        setCover(it.cover_image || "");
        setScheduled(isoToPktInput(it.scheduled_publish_at || ""));
        setBlocks(Array.isArray(it.content) ? it.content : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load.");
        setLoading(false);
      });
  }, [id]);

  async function onSave(newBlocks: Block[]) {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    const scheduledIso = pktInputToIso(scheduled);
    if (!scheduledIso) {
      setError("A valid scheduled publish date/time is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/blog/queue", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          title: title.trim(),
          excerpt: excerpt.trim(),
          content: newBlocks,
          keywords: keywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean),
          cover_image: cover.trim(),
          scheduled_publish_at: scheduledIso,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Save failed.");
      router.push("/admin/buffer-queue");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
      setSaving(false);
    }
  }

  const input: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid var(--border, #e2e2e2)",
    fontSize: ".95rem",
    marginBottom: 12,
    boxSizing: "border-box",
  };
  const label: React.CSSProperties = {
    display: "block",
    fontSize: ".82rem",
    fontWeight: 600,
    color: "var(--muted)",
    marginBottom: 6,
  };

  if (loading) return <main className="admin-wrap"><p>Loading…</p></main>;

  return (
    <main className="admin-wrap" style={{ maxWidth: 800 }}>
      <Link
        href="/admin/buffer-queue"
        style={{ color: "var(--muted)", textDecoration: "none", fontSize: ".9rem" }}
      >
        ← Buffer Queue
      </Link>
      <h1 style={{ margin: "12px 0 20px" }}>Edit waiting article</h1>

      {error && <p style={{ color: "#b3261e" }}>{error}</p>}

      {!error && status && status !== "pending" && (
        <div className="empty">
          This article is “{status}” and can no longer be edited here.
          {status === "published" &&
            " Published articles are edited under Blog posts."}
        </div>
      )}

      {!error && status === "pending" && (
        <>
          <label style={label}>Title *</label>
          <input
            style={input}
            placeholder="Post title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label style={label}>URL slug (fixed once queued)</label>
          <input
            style={{ ...input, background: "#f3f4f6", color: "#6b7280" }}
            value={slug}
            readOnly
          />

          <label style={label}>Excerpt</label>
          <textarea
            style={{ ...input, minHeight: 70 }}
            placeholder="Excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />

          <label style={label}>Keywords (comma separated)</label>
          <input
            style={input}
            placeholder="Keywords (comma separated)"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />

          <label style={label}>Cover image URL</label>
          <input
            style={input}
            placeholder="Cover image URL"
            value={cover}
            onChange={(e) => setCover(e.target.value)}
          />

          <label style={label}>Scheduled publish time (PKT)</label>
          <input
            style={input}
            type="datetime-local"
            value={scheduled}
            onChange={(e) => setScheduled(e.target.value)}
          />
          <p
            style={{
              color: "var(--muted)",
              fontSize: ".85rem",
              margin: "0 0 20px",
            }}
          >
            The auto-publisher runs once a day at 10:20 AM PKT and publishes
            the earliest waiting article whose time has come.
          </p>

          <h3>Content</h3>
          {blocks !== null && (
            <BlogEditor initial={blocks} onSave={onSave} saving={saving} />
          )}
        </>
      )}
    </main>
  );
}

/** Wrapper with Suspense boundary for static prerendering. */
export default function EditQueueItemPage() {
  return (
    <Suspense fallback={<main className="admin-wrap"><p>Loading…</p></main>}>
      <EditQueueItemForm />
    </Suspense>
  );
}
