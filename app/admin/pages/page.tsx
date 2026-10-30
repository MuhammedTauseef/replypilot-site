"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ConfirmDialog from "@/components/ConfirmDialog";

interface PageRow {
  slug: string;
  title: string;
  published: boolean;
  updated_at: string;
}

/** /admin/pages — manage static pages (about, faq, contact, legal). */
export default function AdminPagesPage() {
  const [rows, setRows] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<PageRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    fetch("/api/admin/pages")
      .then((r) => r.json())
      .then((d) => {
        setRows(d.pages || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };
  useEffect(load, []);

  async function doDelete() {
    const row = pendingDelete;
    if (!row || deleting) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/pages?slug=${row.slug}`, { method: "DELETE" });
    const d = await res.json();
    setDeleting(false);
    setPendingDelete(null);
    if (!res.ok) {
      alert(d.error || "Could not delete.");
      return;
    }
    load();
  }

  if (loading) return <main className="admin-wrap"><p>Loading…</p></main>;

  return (
    <main className="admin-wrap">
      <div className="admin-top">
        <div>
          <h1>Pages</h1>
          <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>
            Static pages: about, faq, contact, privacy, terms, disclaimer.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/admin" style={{ color: "var(--muted)", textDecoration: "none", fontSize: ".9rem" }}>
            ← Dashboard
          </Link>
          <Link
            href="/admin/pages/new"
            style={{ background: "#f59e0b", color: "#111827", padding: "10px 20px", borderRadius: 10, fontWeight: 700, textDecoration: "none" }}
          >
            + New page
          </Link>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="empty">No pages yet. They will be created from the current site content.</div>
      ) : (
        <table className="leads-table">
          <thead>
            <tr>
              <th>Page</th>
              <th>URL</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.slug}>
                <td><strong>{r.title}</strong></td>
                <td style={{ fontSize: ".85rem", color: "#6b7280" }}>/{r.slug}</td>
                <td style={{ color: r.published ? "#16a34a" : "#6b7280", fontWeight: 700, fontSize: ".85rem" }}>
                  {r.published ? "Published" : "Draft"}
                </td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <Link href={`/admin/pages/${r.slug}`} style={{ marginRight: 12 }}>Edit</Link>
                  <button onClick={() => setPendingDelete(r)} style={{ color: "#b3261e", background: "none", border: "none", cursor: "pointer" }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete page?"
        message={pendingDelete ? `Delete page "${pendingDelete.title}"? This cannot be undone.` : ""}
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={doDelete}
        onCancel={() => {
          if (!deleting) setPendingDelete(null);
        }}
      />
    </main>
  );
}
