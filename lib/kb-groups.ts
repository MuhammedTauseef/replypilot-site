/**
 * Knowledge-base documents are stored as chunk rows in `kb_documents`: one
 * upload becomes rows whose `content_hash` is `${hash}-0`, `${hash}-1`, …
 * (older rows may carry a bare hash with no suffix). These pure helpers
 * group chunk rows back into the documents the user actually uploaded, so
 * the UI can edit or delete a whole document instead of orphan chunks.
 */

export interface KbRow {
  id: string;
  filename: string;
  content_hash?: string | null;
  content?: string;
  created_at?: string;
}

export interface KbGroup {
  /** Group key: the shared content-hash prefix (or the row id fallback). */
  key: string;
  /** Display filename with any " (part N)" suffix removed. */
  filename: string;
  /** Row ids in chunk order. */
  ids: string[];
  /** Number of chunk rows in the group. */
  parts: number;
  created_at: string;
  /** Chunk contents in order (present only when rows carry content). */
  contents?: string[];
}

const CHUNK_SUFFIX = /^(.*)-(\d+)$/;

/** The group key + chunk index for a row's content_hash. */
export function parseContentHash(hash: string | null | undefined): {
  key: string;
  index: number;
} {
  if (!hash) return { key: "", index: 0 };
  const m = CHUNK_SUFFIX.exec(hash);
  if (m) return { key: m[1], index: Number(m[2]) };
  return { key: hash, index: 0 };
}

/** "Guide.pdf (part 2)" → "Guide.pdf" */
export function baseFilename(filename: string): string {
  return filename.replace(/\s*\(part \d+\)\s*$/i, "");
}

/** Group chunk rows into documents, newest document first. */
export function groupKbRows(rows: KbRow[]): KbGroup[] {
  const groups = new Map<
    string,
    { filename: string; parts: { id: string; index: number; content?: string }[]; created_at: string }
  >();

  for (const row of rows) {
    const { key, index } = parseContentHash(row.content_hash);
    const groupKey = key || row.id;
    const existing = groups.get(groupKey);
    const part = { id: row.id, index, content: row.content };
    if (existing) {
      existing.parts.push(part);
      if ((row.created_at || "") < existing.created_at) {
        existing.created_at = row.created_at || existing.created_at;
      }
    } else {
      groups.set(groupKey, {
        filename: baseFilename(row.filename),
        parts: [part],
        created_at: row.created_at || "",
      });
    }
  }

  return [...groups.entries()]
    .map(([key, g]) => {
      const ordered = [...g.parts].sort((a, b) => a.index - b.index);
      return {
        key,
        filename: g.filename,
        ids: ordered.map((p) => p.id),
        parts: ordered.length,
        created_at: g.created_at,
        contents: ordered.every((p) => typeof p.content === "string")
          ? ordered.map((p) => p.content as string)
          : undefined,
      } as KbGroup;
    })
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}
