import { NextResponse } from "next/server";
import { getReservedBookings } from "@/lib/bookings";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

// Älä cacheta — data muuttuu varausten ja suljettujen päivien mukaan
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const alku = searchParams.get("alku")?.trim() ?? "";
  const loppu = searchParams.get("loppu")?.trim() ?? alku;

  if (!alku) {
    return NextResponse.json({ ok: true, suljetutPaivat: [], varausAjat: {} });
  }

  try {
    // Haetaan vahvistetut varaukset (varaukset-taulu)
    const bookings = await getReservedBookings(alku, loppu);

    // Haetaan suljetut päivät (blocked_dates-taulu)
    const client = getSupabaseAdminClient();
    const blockedDates = client
      ? await client
          .from("blocked_dates")
          .select("blocked_date")
          .gte("blocked_date", alku)
          .lte("blocked_date", loppu)
      : { data: [] as { blocked_date: string }[], error: null };

    const suljetutPaivat: string[] = (blockedDates.data ?? []).map(
      (d) => d.blocked_date,
    );

    // Varausten ajat per päivä
    const varausAjat: Record<string, { alku: string; loppu: string }[]> = {};
    for (const v of bookings) {
      if (!varausAjat[v.varaus_pvm]) varausAjat[v.varaus_pvm] = [];
      varausAjat[v.varaus_pvm].push({ alku: v.aloitusaika, loppu: v.lopetusaika });
    }

    return NextResponse.json({ ok: true, suljetutPaivat, varausAjat });
  } catch (error) {
    console.error("varatut-paivat fetch failed", error);
    return NextResponse.json({ ok: true, suljetutPaivat: [], varausAjat: {} });
  }
}
