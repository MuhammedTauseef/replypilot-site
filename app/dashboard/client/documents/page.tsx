"use client";

import { useEffect, useState } from "react";

interface Doc {
  id: string;
  filename: string;
  parts: number;
  created_at: string;
}

/** /dashboard/client/documents — knowledge base documents (add / edit / delete). */
export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [text, setText] = useState("");
  const [filename, setFilename] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const load = () => {
    fetch("/api/kb")
      .then((r) => r.json())
      .then((d) => d.documents && setDocs(d.documents))
      .catch(() => {});
  };

  useEffect(load, []);

  /** Pasted text is a text document — give it the .txt extension the API requires. */
  const withExtension = (name: string) =>
    name.includes(".") ? name : `${name}.txt`;

  const cancelEdit = () => {
    setEditingKey(null);
    setText("");
    setFilename("");
    setMessage("");
  };

  const submit = async () => {
    if (!text.trim() || !filename.trim() || uploading) return;
    setUploading(true);
    setMessage("");
    try {
      const res = editingKey
        ? await fetch("/api/kb", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              group: editingKey,
              filename: withExtension(filename.trim()),
              content: text.trim(),
            }),
          })
        : await fetch("/api/kb", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: withExtension(filename.trim()),
              content: text.trim(),
            }),
          });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      setMessage(
        editingKey
          ? "✅ Document updated! Your agent now answers from the new version."
          : "✅ Document added! Your agent can now answer from it."
      );
      setEditingKey(null);
      setText("");
      setFilename("");
      load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const startEdit = async (doc: Doc) => {
    setMessage("");
    try {
      const res = await fetch(`/api/kb?group=${encodeURIComponent(doc.id)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load the document.");
      setEditingKey(doc.id);
      setFilename(data.document.filename);
      setText(data.document.content);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not load the document.");
    }
  };

  const remove = async (doc: Doc) => {
    if (!confirm(`Delete "${doc.filename}"? Your agent will stop answering from it.`)) return;
    setMessage("");
    try {
      const res = await fetch(`/api/kb?group=${encodeURIComponent(doc.id)}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed.");
      if (editingKey === doc.id) cancelEdit();
      setMessage("🗑️ Document deleted.");
      load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Delete failed.");
    }
  };

  return (
    <main>
      <section className="block">
        <div className="wrap" style={{ maxWidth: 720 }}>
          <span className="eyebrow">Knowledge Base</span>
          <h1 className="display" style={{ fontSize: "2rem", marginBottom: 8 }}>
            Teach your agent
          </h1>
          <p style={{ color: "#4b5563", marginBottom: 28 }}>
            Paste your price lists, policies, FAQs, or any business info. Your AI agent
            will answer customers using these documents.
          </p>

          <div style={{ background: "#f9fafb", borderRadius: 12, padding: 20, marginBottom: 32 }}>
            <h2 style={{ fontSize: "1.1rem", margin: "0 0 12px" }}>
              {editingKey ? "Edit document" : "Add a document"}
            </h2>
            <input
              placeholder="Document name (e.g. Price List 2026)"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 10, border: "1px solid #d1d5db", marginBottom: 12, fontSize: "1rem" }}
            />
            <textarea
              placeholder="Paste your document content here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", minHeight: 160, padding: "12px 14px", borderRadius: 10, border: "1px solid #d1d5db", marginBottom: 12, fontSize: "1rem" }}
            />
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={submit}
                disabled={uploading || !text.trim() || !filename.trim()}
                style={{ padding: "12px 28px", borderRadius: 10, border: "none", background: "#f59e0b", fontWeight: 700, cursor: "pointer" }}
              >
                {uploading ? "Saving..." : editingKey ? "Save changes" : "Add document"}
              </button>
              {editingKey && (
                <button
                  onClick={cancelEdit}
                  disabled={uploading}
                  style={{ padding: "12px 20px", borderRadius: 10, border: "1px solid #d1d5db", background: "#fff", fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel editing
                </button>
              )}
            </div>
            {message && <p style={{ marginTop: 12 }}>{message}</p>}
          </div>

          <h2 style={{ fontSize: "1.3rem", marginBottom: 16 }}>Your documents ({docs.length})</h2>
          {docs.length === 0 ? (
            <div className="empty">
              No documents yet. Documents are how you teach your agent about your
              business — price lists, opening hours, policies, FAQs. Add your first
              one with the form above, and your agent will start answering customers
              from it right away.
            </div>
          ) : (
            docs.map((d) => (
              <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", padding: "12px 16px", border: "1px solid #e5e7eb", borderRadius: 10, marginBottom: 8 }}>
                <span>
                  📄 {d.filename}
                  {d.parts > 1 && (
                    <span style={{ color: "#9ca3af", fontSize: ".85rem" }}> · {d.parts} parts</span>
                  )}
                </span>
                <span style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => startEdit(d)} style={{ background: "none", border: "none", color: "#1d4ed8", fontWeight: 600, cursor: "pointer" }}>
                    Edit
                  </button>
                  <button onClick={() => remove(d)} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer" }}>
                    Delete
                  </button>
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
