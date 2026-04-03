import { NextResponse } from "next/server";
import { getReservedBookings } from "@/lib/bookings";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const alku = url.searchParams.get("alku")?.trim() ?? "";
    const loppu = url.searchParams.get("loppu")?.trim() ?? "";

    if (!alku || !loppu) {
      return NextResponse.json(
        {
          ok: false,
          error: "Parametrit alku ja loppu ovat pakolliset.",
        },
        { status: 400 },
      );
    }

    const data = await getReservedBookings(alku, loppu);

    return NextResponse.json({ ok: true, data });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Varattujen paivien haku epaonnistui.",
      },
      { status: 500 },
    );
  }
}
