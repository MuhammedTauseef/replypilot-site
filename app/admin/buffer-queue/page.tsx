import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import DeleteQueueButton from "./DeleteQueueButton";

type QueueRow = {
  id: string;
  slug: string;
  title: string;
  scheduled_publish_at: string;
  status: string;
  attempts: number;
  last_error: string | null;
};

type LogRow = {
  id: string;
  run_at: string;
  action: string;
  slug: string | null;
  detail: string | null;
};

/** Format an ISO instant in Asia/Karachi time, labelled PKT. */
function formatPkt(iso: string): string {
  try {
    return (
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Karachi",
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date(iso)) + " PKT"
    );
  } catch {
    return iso;
  }
}

const STATUS_STYLE: Record<string, { bg: string; fg: string }> = {
  pending: { bg: "#f59e0b1a", fg: "#92400e" },
  publishing: { bg: "#2563eb1a", fg: "#2563eb" },
  failed: { bg: "#b3261e1a", fg: "#b3261e" },
};

function StatusPill({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? { bg: "#6b72801a", fg: "#6b7280" };
  return (
    <span
      style={{
        background: s.bg,
        color: s.fg,
        borderRadius: 20,
        padding: "4px 12px",
        fontSize: ".8rem",
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}

function QueueTable({ rows }: { rows: QueueRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="empty">Queue is empty — no articles are waiting.</div>
    );
  }
  return (
    <table className="leads-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Slug</th>
          <th>Scheduled (PKT)</th>
          <th>Status</th>
          <th>Details</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td>
              <strong>{r.title}</strong>
            </td>
            <td style={{ fontSize: ".85rem", color: "#6b7280" }}>
              /blog/{r.slug}
            </td>
            <td style={{ whiteSpace: "nowrap", fontSize: ".85rem" }}>
              {formatPkt(r.scheduled_publish_at)}
            </td>
            <td>
              <StatusPill status={r.status} />
            </td>
            <td className="msg" style={{ fontSize: ".85rem" }}>
              {r.status === "failed"
                ? r.last_error || "Publishing failed."
                : r.status === "publishing"
                  ? "Being published right now — locked."
                  : `Attempts so far: ${r.attempts}`}
            </td>
            <td style={{ whiteSpace: "nowrap" }}>
              {r.status === "pending" ? (
                <>
                  <Link
                    href={`/admin/buffer-queue/${r.id}`}
                    style={{ marginRight: 12 }}
                  >
                    Edit
                  </Link>
                  <DeleteQueueButton id={r.id} title={r.title} />
                </>
              ) : (
                "—"
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function LogTable({ rows }: { rows: LogRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="empty">
        No publisher runs yet. The auto-publisher runs once a day — its
        history will appear here.
      </div>
    );
  }
  return (
    <table className="leads-table">
      <thead>
        <tr>
          <th>Run at (PKT)</th>
          <th>Action</th>
          <th>Slug</th>
          <th>Detail</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td style={{ whiteSpace: "nowrap", fontSize: ".85rem" }}>
              {formatPkt(r.run_at)}
            </td>
            <td style={{ fontWeight: 600 }}>{r.action}</td>
            <td style={{ fontSize: ".85rem", color: "#6b7280" }}>
              {r.slug ? `/blog/${r.slug}` : "—"}
            </td>
            <td className="msg" style={{ fontSize: ".85rem" }}>
              {r.detail || "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

async function BufferQueueContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if ((profile as { role?: string } | null)?.role !== "admin") {
    redirect("/dashboard");
  }

  const [{ data: queue, error: queueError }, { data: log, error: logError }] =
    await Promise.all([
      supabase
        .from("blog_publish_queue")
        .select(
          "id, slug, title, scheduled_publish_at, status, attempts, last_error"
        )
        .in("status", ["pending", "publishing", "failed"])
        .order("scheduled_publish_at", { ascending: true }),
      supabase
        .from("blog_publish_log")
        .select("id, run_at, action, slug, detail")
        .order("run_at", { ascending: false })
        .limit(14),
    ]);

  if (queueError || logError) {
    return (
      <div className="empty">
        Could not load the buffer queue. Check the database setup (see
        supabase/blog-publish-queue.sql).
      </div>
    );
  }

  return (
    <>
      <section style={{ marginBottom: 48 }}>
        <h2
          style={{
            fontSize: "1.25rem",
            letterSpacing: "-.01em",
            marginBottom: 6,
          }}
        >
          Waiting articles
        </h2>
        <p
          style={{ color: "var(--muted)", fontSize: ".92rem", margin: "0 0 18px" }}
        >
          Articles in the buffer, earliest scheduled first. All times are
          Pakistan Time (PKT). Waiting (pending) articles can be edited,
          rescheduled or removed; an article that is publishing or has
          failed is locked here.
        </p>
        <QueueTable rows={(queue ?? []) as QueueRow[]} />
      </section>

      <section>
        <h2
          style={{
            fontSize: "1.25rem",
            letterSpacing: "-.01em",
            marginBottom: 6,
          }}
        >
          Recent publisher runs
        </h2>
        <p
          style={{ color: "var(--muted)", fontSize: ".92rem", margin: "0 0 18px" }}
        >
          The latest auto-publisher runs, newest first. All times are
          Pakistan Time (PKT).
        </p>
        <LogTable rows={(log ?? []) as LogRow[]} />
      </section>
    </>
  );
}

/**
 * /admin/buffer-queue — visibility + pending-item controls for the
 * article buffer. Guarded by the proxy's /admin role check and again
 * here with the same session + profiles.role pattern as the rest of
 * the admin panel.
 */
export default function BufferQueuePage() {
  return (
    <main className="admin-wrap">
      <div className="admin-top">
        <div>
          <h1>Buffer Queue</h1>
          <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>
            Articles waiting for the daily auto-publisher, and what it did
            on its recent runs.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link
            href="/admin"
            style={{
              color: "var(--muted)",
              textDecoration: "none",
              fontSize: ".9rem",
            }}
          >
            ← Dashboard
          </Link>
          <LogoutButton />
        </div>
      </div>

      <Suspense fallback={<div className="empty">Loading buffer queue…</div>}>
        <BufferQueueContent />
      </Suspense>
    </main>
  );
}
