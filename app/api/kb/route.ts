import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createHash } from "crypto";

async function getClientId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("clients").select("id").eq("user_id", user.id).single();
  return data?.id || null;
}

/** List KB documents. */
export async function GET() {
  try {
    const supabase = await createClient();
    const clientId = await getClientId(supabase);
    if (!clientId) return NextResponse.json({ error: "No client profile" }, { status: 404 });

    const { data } = await supabase
      .from("kb_documents")
      .select("id, filename, created_at")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    return NextResponse.json({ documents: data || [] });
  } catch (e) {
    console.error("kb list error:", e);
    return NextResponse.json({ error: "Failed." }, { status: 500 });
  }
}

/** Add a KB document. Splits into chunks for better retrieval. */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const clientId = await getClientId(supabase);
    if (!clientId) return NextResponse.json({ error: "No client profile" }, { status: 404 });

    const { filename, content } = await req.json();
    if (!filename?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "Filename and content required." }, { status: 400 });
    }
    if (content.length > 50000) {
      return NextResponse.json({ error: "Document too large (max 50,000 characters)." }, { status: 400 });
    }

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

    const rows = chunks.map((chunk, i) => ({
      client_id: clientId,
      filename: chunks.length > 1 ? `${filename.trim()} (part ${i + 1})` : filename.trim(),
      content: chunk,
      content_hash: `${hash}-${i}`,
      embedding: null, // embeddings generated in background step
    }));

    const { error } = await supabase.from("kb_documents").insert(rows);
    if (error) throw error;

    return NextResponse.json({ ok: true, chunks: rows.length });
  } catch (e) {
    console.error("kb upload error:", e);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}

/** Delete a KB document. */
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const clientId = await getClientId(supabase);
    if (!clientId) return NextResponse.json({ error: "No client profile" }, { status: 404 });

    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

    const { error } = await supabase
      .from("kb_documents")
      .delete()
      .eq("id", id)
      .eq("client_id", clientId);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("kb delete error:", e);
    return NextResponse.json({ error: "Delete failed." }, { status: 500 });
  }
}
