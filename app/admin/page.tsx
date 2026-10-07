import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";

type Lead = {
  id: string;
  name: string;
  email: string;
  business_type: string | null;
  message: string;
  created_at: string;
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/**
 * Session-gated content. Reading the session is a request-time operation,
 * so with Cache Components it streams in behind the Suspense boundary
 * below instead of blocking the static shell.
 */
async function AdminContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: leads, error } = await supabase
    .from("leads")
    .select("id, name, email, business_type, message, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = (leads ?? []) as Lead[];

  if (error) {
    return (
      <div className="empty">
        Could not load enquiries. Check the database setup (see
        supabase/schema.sql).
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="empty">
        No enquiries yet. When visitors use the contact form, they will appear
        here.
      </div>
    );
  }

  return (
    <table className="leads-table">
      <thead>
        <tr>
          <th>Received</th>
          <th>Name</th>
          <th>Email</th>
          <th>Business</th>
          <th>Message</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((l) => (
          <tr key={l.id}>
            <td style={{ whiteSpace: "nowrap" }}>{formatDate(l.created_at)}</td>
            <td>
              <strong>{l.name}</strong>
            </td>
            <td>
              <a href={`mailto:${l.email}`}>{l.email}</a>
            </td>
            <td>{l.business_type || "—"}</td>
            <td className="msg">{l.message}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * /admin — leads dashboard. The proxy already redirects signed-out
 * visitors to /admin/login; this page double-checks the session itself.
 */
export default function AdminPage() {
  return (
    <main className="admin-wrap">
      <div className="admin-top">
        <div>
          <h1>Enquiries</h1>
          <p style={{ color: "#4b5563", margin: "6px 0 0" }}>
            Messages from the website contact form, newest first.
          </p>
        </div>
        <LogoutButton />
      </div>

      <Suspense
        fallback={<div className="empty">Loading enquiries…</div>}
      >
        <AdminContent />
      </Suspense>
    </main>
  );
}
