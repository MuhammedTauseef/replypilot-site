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

type Booking = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  slot_start: string;
  slot_end: string;
  status: string;
  source: string | null;
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

/** PKT slot label, e.g. "Thu 9 Oct, 14:30". */
function formatSlot(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Karachi",
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function LeadsTable({ rows }: { rows: Lead[] }) {
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

function BookingsTable({ rows }: { rows: Booking[] }) {
  if (rows.length === 0) {
    return (
      <div className="empty">
        No bookings yet. When visitors book a demo through the chat, they will
        appear here.
      </div>
    );
  }
  return (
    <table className="leads-table">
      <thead>
        <tr>
          <th>Slot (PKT)</th>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((b) => (
          <tr key={b.id}>
            <td style={{ whiteSpace: "nowrap" }}>
              <strong>{formatSlot(b.slot_start)}</strong>
            </td>
            <td>
              <strong>{b.name}</strong>
            </td>
            <td>
              <a href={`mailto:${b.email}`}>{b.email}</a>
            </td>
            <td>{b.phone || "—"}</td>
            <td>{b.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
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

  const [{ data: leads, error: leadsError }, { data: bookings, error: bookingsError }] =
    await Promise.all([
      supabase
        .from("leads")
        .select("id, name, email, business_type, message, created_at")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("bookings")
        .select("id, name, email, phone, slot_start, slot_end, status, source, created_at")
        .order("slot_start", { ascending: true })
        .limit(200),
    ]);

  if (leadsError || bookingsError) {
    return (
      <div className="empty">
        Could not load dashboard data. Check the database setup (see
        supabase/schema.sql).
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
          Enquiries
        </h2>
        <p style={{ color: "var(--muted)", fontSize: ".92rem", margin: "0 0 18px" }}>
          Messages from the website contact form, newest first.
        </p>
        <LeadsTable rows={(leads ?? []) as Lead[]} />
      </section>

      <section>
        <h2
          style={{
            fontSize: "1.25rem",
            letterSpacing: "-.01em",
            marginBottom: 6,
          }}
        >
          Demo bookings
        </h2>
        <p style={{ color: "var(--muted)", fontSize: ".92rem", margin: "0 0 18px" }}>
          Upcoming demo calls booked through the chat, soonest first.
        </p>
        <BookingsTable rows={(bookings ?? []) as Booking[]} />
      </section>
    </>
  );
}

/**
 * /admin — leads + bookings dashboard. The proxy already redirects signed-out
 * visitors to /admin/login; this page double-checks the session itself.
 */
export default function AdminPage() {
  return (
    <main className="admin-wrap">
      <div className="admin-top">
        <div>
          <h1>Dashboard</h1>
          <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>
            Enquiries and demo bookings, at a glance.
          </p>
        </div>
        <LogoutButton />
      </div>

      <Suspense fallback={<div className="empty">Loading dashboard…</div>}>
        <AdminContent />
      </Suspense>
    </main>
  );
}
