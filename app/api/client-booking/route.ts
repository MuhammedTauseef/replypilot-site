import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/client-booking — book an appointment with a client's business.
 * Body: { business: string, name: string, contact: string, date: string, time: string, notes?: string }
 * Google Calendar sync happens when GOOGLE_CALENDAR_CREDENTIALS is configured.
 */
export async function POST(req: NextRequest) {
  try {
    const { business, name, contact, date, time, notes } = await req.json();

    if (!business?.trim() || !name?.trim() || !contact?.trim() || !date || !time) {
      return NextResponse.json(
        { error: "Business, name, contact, date, and time are required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Find client by business name
    const { data: client } = await supabase
      .from("clients")
      .select("id, business_name")
      .ilike("business_name", business.trim())
      .single();

    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        client_id: client?.id || null,
        name: name.trim(),
        email: contact.includes("@") ? contact.trim() : null,
        phone: !contact.includes("@") ? contact.trim() : null,
        business_type: client?.business_name || business.trim(),
        booking_date: date,
        booking_time: time,
        message: notes?.trim() || null,
        status: "confirmed",
      })
      .select("id")
      .single();

    if (error) throw error;

    // TODO: Google Calendar sync when credentials are configured
    // TODO: Send confirmation email/WhatsApp

    return NextResponse.json({
      ok: true,
      booking_id: booking.id,
      message: `Booked! ${name}, you're confirmed for ${date} at ${time}. We'll send a reminder before.`,
    });
  } catch (e) {
    console.error("client booking error:", e);
    return NextResponse.json({ error: "Booking failed. Please try again." }, { status: 500 });
  }
}

/**
 * GET /api/client-booking?business=X&date=YYYY-MM-DD — check availability.
 * Returns booked times so the agent can offer free slots.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const business = searchParams.get("business");
    const date = searchParams.get("date");

    if (!business || !date) {
      return NextResponse.json({ error: "business and date required." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data } = await supabase
      .from("bookings")
      .select("booking_time")
      .eq("business_type", business)
      .eq("booking_date", date)
      .neq("status", "cancelled");

    const booked = (data || []).map((b) => b.booking_time);

    // Business hours: 10:00–18:00, 30-min slots
    const allSlots: string[] = [];
    for (let h = 10; h < 18; h++) {
      allSlots.push(`${String(h).padStart(2, "0")}:00`);
      allSlots.push(`${String(h).padStart(2, "0")}:30`);
    }
    const free = allSlots.filter((s) => !booked.includes(s));

    return NextResponse.json({ date, free_slots: free, booked_slots: booked });
  } catch (e) {
    console.error("availability error:", e);
    return NextResponse.json({ error: "Check failed." }, { status: 500 });
  }
}
