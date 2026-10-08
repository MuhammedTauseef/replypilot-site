"use client";

import { useState } from "react";

export interface VideoForm {
  file: string;
  poster: string;
  niche: string;
  channel: string;
  title: string;
  description: string;
  published: boolean;
  sort_order: number;
}

export const emptyVideoForm: VideoForm = {
  file: "",
  poster: "",
  niche: "",
  channel: "",
  title: "",
  description: "",
  published: true,
  sort_order: 0,
};

/** Shared video form for new + edit pages. */
export default function VideoFormFields({
  initial,
  onSave,
  saving,
}: {
  initial: VideoForm;
  onSave: (v: VideoForm) => void;
  saving: boolean;
}) {
  const [f, setF] = useState<VideoForm>(initial);
  const set = (k: keyof VideoForm, v: string | boolean | number) =>
    setF((prev) => ({ ...prev, [k]: v }));

  const input: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: 8,
    border: "1px solid var(--border, #e2e2e2)", fontSize: ".95rem",
    marginBottom: 12, boxSizing: "border-box",
  };

  return (
    <div>
      <input style={input} placeholder="Video file * (e.g. /videos/demo-shop.mp4)" value={f.file} onChange={(e) => set("file", e.target.value)} />
      <input style={input} placeholder="Poster image (optional, e.g. /videos/demo-shop.png)" value={f.poster} onChange={(e) => set("poster", e.target.value)} />
      <input style={input} placeholder="Title *" value={f.title} onChange={(e) => set("title", e.target.value)} />
      <div style={{ display: "flex", gap: 12 }}>
        <input style={input} placeholder="Niche (e.g. Boutique)" value={f.niche} onChange={(e) => set("niche", e.target.value)} />
        <input style={input} placeholder="Channel (e.g. WhatsApp DM automation)" value={f.channel} onChange={(e) => set("channel", e.target.value)} />
      </div>
      <textarea style={{ ...input, minHeight: 90 }} placeholder="Description" value={f.description} onChange={(e) => set("description", e.target.value)} />
      <input style={input} placeholder="Sort order (0 = first)" type="number" value={f.sort_order} onChange={(e) => set("sort_order", Number(e.target.value) || 0)} />
      <label style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 20 }}>
        <input type="checkbox" checked={f.published} onChange={(e) => set("published", e.target.checked)} />
        Published
      </label>
      <button
        type="button"
        onClick={() => onSave(f)}
        disabled={saving}
        style={{ background: "#f59e0b", color: "#111827", padding: "12px 32px", borderRadius: 10, fontWeight: 700, border: "none", cursor: saving ? "wait" : "pointer" }}
      >
        {saving ? "Saving…" : "Save video"}
      </button>
    </div>
  );
}
