import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServiceClient } from "@/lib/supabase/service";
import { createHash } from "crypto";
import { embed } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { rateLimit, userKey } from "@/lib/rate-limit";
import { groupKbRows } from "@/lib/kb-groups";

/** Generate a 768-dim embedding with Gemini (free tier). */
async function embedText(value: string): Promise<number[] | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const google = createGoogleGenerativeAI({ apiKey });
    const { embedding } = await embed({
      model: google.textEmbeddingModel("text-embedding-004"),
      value: value.slice(0, 8000),
      abortSignal: controller.signal,
    });
    return embedding;
  } catch (e) {
    console.error("embedding error:", e instanceof Error ? e.message.slice(0, 200) : e);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function getClientId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("clients").select("id").eq("user_id", user.id).single();
  return data?.id || null;
}

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

/**
 * Delete the caller's own KB rows by id, returning how many rows were
 * actually removed. Runs through the service client when available (the
 * /api/profile pattern): a session-client delete can silently match zero
 * rows when the table has no DELETE policy for the signed-in role, which
 * made the old Delete button look broken. The client_id scope stays in
 * the query either way, so only the owner's rows can ever be removed.
 */
async function deleteOwnRows(
  supabase: SupabaseServer,
  clientId: string,
  ids: string[]
): Promise<number> {
  const service = getServiceClient();
  const db = service ?? supabase;
  const { count, error } = await db
    .from("kb_documents")
    .delete({ count: "exact" })
    .in("id", ids)
    .eq("client_id", clientId);
  if (error) throw error;
  return count ?? 0;
}

/** Filename/content validation shared by add + edit (unchanged rules). */
function validateDocument(
  filename: unknown,
  content: unknown
): { cleanName: string; content: string } | { error: string; status: number } {
  if (
    typeof filename !== "string" ||
    !filename.trim() ||
    typeof content !== "string" ||
    !content.trim()
  ) {
    return { error: "Filename and content required.", status: 400 };
  }
  // File type validation: only text-based documents allowed.
  // SEC-007 fix (2026-10-16): require a valid extension — no-extension filenames no longer bypass validation.
  const cleanName = filename.trim().slice(0, 200);
  const allowedExt = [".txt", ".md", ".pdf", ".doc", ".docx", ".csv"];
  const ext = cleanName.toLowerCase().slice(cleanName.lastIndexOf("."));
  if (!allowedExt.includes(ext)) {
    return {
      error: `File type not allowed. Use: ${allowedExt.join(", ")}`,
      status: 400,
    };
  }
  // Block path traversal / suspicious names
  if (/[<>:"|?*\x00-\x1f]/.test(cleanName) || cleanName.includes("..")) {
    return { error: "Invalid filename.", status: 400 };
  }
  if (content.length > 50000) {
    return { error: "Document too large (max 50,000 characters).", status: 400 };
  }
  return { cleanName, content };
}

/** Chunk + embed + insert one document for a client. */
async function insertDocument(
  supabase: SupabaseServer,
  clientId: string,
  cleanName: string,
  content: string
): Promise<{ chunks: number; embeddings: number }> {
  const hash = createHash("sha256").update(content).digest("hex").slice(0, 32);

  // Simple chunking: split by paragraphs, max ~1500 chars per chunk
  const chunks: string[] = [];
  const paras = content.split(/\n\s*\n/);
  let current = "";
  for (const p of paras) {
    if ((current + "\n\n" + p).length > 1500 && current) {
      chunks.push(current.trim());
      current = p;
    } else {
      current = current ? current + "\n\n" + p : p;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  // Generate embeddings for semantic search (null when API key missing —
  // chunks still save and keyword matching keeps working).
  const embeddings = await Promise.all(chunks.map((c) => embedText(c)));

  const rows = chunks.map((chunk, i) => ({
    client_id: clientId,
    filename: chunks.length > 1 ? `${cleanName} (part ${i + 1})` : cleanName,
    content: chunk,
    content_hash: `${hash}-${i}`,
    embedding: embeddings[i],
  }));

  const { error } = await supabase.from("kb_documents").insert(rows);
  if (error) throw error;

  return {
    chunks: rows.length,
    embeddings: embeddings.filter(Boolean).length,
  };
}

/** Fetch the caller's own document groups (always with content). */
async function ownGroups(supabase: SupabaseServer, clientId: string) {
  const { data } = await supabase
    .from("kb_documents")
    .select("id, filename, content, content_hash, created_at")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  return groupKbRows(data || []);
}

/**
 * List KB documents (grouped — one entry per uploaded document), or, with
 * ?group=<key>, return one document's full text for editing.
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const clientId = await getClientId(supabase);
    if (!clientId) return NextResponse.json({ error: "No client profile" }, { status: 404 });

    const groupKey = new URL(req.url).searchParams.get("group");
    if (groupKey) {
      const groups = await ownGroups(supabase, clientId);
      const group = groups.find((g) => g.key === groupKey);
      if (!group || !group.contents) {
        return NextResponse.json({ error: "Document not found." }, { status: 404 });
      }
      return NextResponse.json({
        document: {
          key: group.key,
          filename: group.filename,
          content: group.contents.join("\n\n"),
        },
      });
    }

    const groups = await ownGroups(supabase, clientId);
    return NextResponse.json({
      documents: groups.map((g) => ({
        id: g.key,
        filename: g.filename,
        parts: g.parts,
        created_at: g.created_at,
      })),
    });
  } catch (e) {
    console.error("kb list error:", e);
    return NextResponse.json({ error: "Failed." }, { status: 500 });
  }
}

/** Add a KB document. Splits into chunks for better retrieval. */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const clientId = await getClientId(supabase);
    if (!clientId) return NextResponse.json({ error: "No client profile" }, { status: 404 });

    // Upload rate limit: 20 uploads per user per day (prevents quota burn).
    if (user && !rateLimit(userKey("kb-upload", user.id), 20, 24 * 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Daily upload limit reached (20/day). Try again tomorrow." },
        { status: 429 }
      );
    }

    const { filename, content } = await req.json();
    const valid = validateDocument(filename, content);
    if ("error" in valid) {
      return NextResponse.json({ error: valid.error }, { status: valid.status });
    }

    const result = await insertDocument(supabase, clientId, valid.cleanName, valid.content);
    return NextResponse.json({ ok: true, chunks: result.chunks, embeddings: result.embeddings });
  } catch (e) {
    console.error("kb upload error:", e);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}

/**
 * Edit one of the caller's own documents: the replacement is inserted
 * first (chunked + embedded like a fresh upload), then the old chunk rows
 * are removed — so a failed edit never loses the existing document.
 */
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const clientId = await getClientId(supabase);
    if (!clientId) return NextResponse.json({ error: "No client profile" }, { status: 404 });

    // Edits re-embed, so they share the daily upload quota.
    if (user && !rateLimit(userKey("kb-upload", user.id), 20, 24 * 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Daily upload limit reached (20/day). Try again tomorrow." },
        { status: 429 }
      );
    }

    const { group, filename, content } = await req.json();
    if (typeof group !== "string" || !group) {
      return NextResponse.json({ error: "Missing document reference." }, { status: 400 });
    }
    const valid = validateDocument(filename, content);
    if ("error" in valid) {
      return NextResponse.json({ error: valid.error }, { status: valid.status });
    }

    const groups = await ownGroups(supabase, clientId);
    const target = groups.find((g) => g.key === group);
    if (!target) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    await insertDocument(supabase, clientId, valid.cleanName, valid.content);

    const removed = await deleteOwnRows(supabase, clientId, target.ids);
    if (removed !== target.ids.length) {
      console.error(
        `[kb] edit removed ${removed}/${target.ids.length} old rows for client ${clientId}`
      );
      return NextResponse.json(
        { error: "Edit saved, but the old version could not be fully removed. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("kb edit error:", e);
    return NextResponse.json({ error: "Edit failed." }, { status: 500 });
  }
}

/** Delete a KB document: ?group=<key> removes every chunk; ?id= one row. */
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const clientId = await getClientId(supabase);
    if (!clientId) return NextResponse.json({ error: "No client profile" }, { status: 404 });

    const params = new URL(req.url).searchParams;
    const groupKey = params.get("group");
    const id = params.get("id");

    if (groupKey) {
      const groups = await ownGroups(supabase, clientId);
      const target = groups.find((g) => g.key === groupKey);
      if (!target) {
        return NextResponse.json({ error: "Document not found." }, { status: 404 });
      }
      const removed = await deleteOwnRows(supabase, clientId, target.ids);
      if (removed === 0) {
        return NextResponse.json({ error: "Document could not be deleted." }, { status: 500 });
      }
      return NextResponse.json({ ok: true });
    }

    if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

    const removed = await deleteOwnRows(supabase, clientId, [id]);
    if (removed === 0) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("kb delete error:", e);
    return NextResponse.json({ error: "Delete failed." }, { status: 500 });
  }
}
