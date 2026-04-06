import { NextResponse } from "next/server";
import { getReservedBookings } from "@/lib/bookings";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const alku = searchParams.get("alku")?.trim() ?? "";
  const loppu = searchParams.get("loppu")?.trim() ?? alku;

  if (!alku) {
    return NextResponse.json({ ok: true, data: [] });
  }

  try {
    // Haetaan vahvistetut varaukset (varaukset-taulu)
    const bookings = await getReservedBookings(alku, loppu);

    // Haetaan suljetut päivät (blocked_dates-taulu) — palautetaan koko päivän blokkina
    const client = getSupabaseAdminClient();
    const blockedDates = client
      ? await client
          .from("blocked_dates")
          .select("blocked_date")
          .gte("blocked_date", alku)
          .lte("blocked_date", loppu)
      : { data: [] as { blocked_date: string }[], error: null };

    const blockedAsBookings = (blockedDates.data ?? []).map((d) => ({
      varaus_pvm: d.blocked_date,
      aloitusaika: "00:00",
      lopetusaika: "23:59",
    }));

    return NextResponse.json({
      ok: true,
      data: [...bookings, ...blockedAsBookings],
    });
  } catch (error) {
    console.error("varatut-paivat fetch failed", error);
    return NextResponse.json({ ok: true, data: [] });
  }
}
