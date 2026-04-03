import { NextResponse } from "next/server";
import { saveBooking } from "@/lib/bookings";
import { sendBookingEmails } from "@/lib/booking-emails";

type BookingPayload = {
  asiakas_nimi?: string;
  asiakas_email?: string;
  asiakas_puhelin?: string;
  palvelutyyppi?: string;
  lahto_osoite?: string;
  kohde_osoite?: string;
  varaus_pvm?: string;
  aloitusaika?: string;
  lopetusaika?: string;
  ajoaika_kohteeseen_min?: number;
  ajoaika_riihimaelta_min?: number;
  hinta_alv?: number | null;
  hinta_alv0?: number | null;
  riihimaki_lahtoaika?: string;
};

function isValidTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function parsePayload(payload: BookingPayload) {
  if (!payload.asiakas_email || !payload.asiakas_email.includes("@")) {
    return "Kentta asiakas_email puuttuu tai on virheellinen.";
  }

  if (!payload.palvelutyyppi?.trim()) {
    return "Kentta palvelutyyppi puuttuu.";
  }

  if (!payload.lahto_osoite?.trim() || !payload.kohde_osoite?.trim()) {
    return "Lahto- ja kohdeosoite ovat pakolliset.";
  }

  if (!payload.varaus_pvm || !/^\d{4}-\d{2}-\d{2}$/.test(payload.varaus_pvm)) {
    return "Kentta varaus_pvm puuttuu tai on virheellinen.";
  }

  if (!payload.aloitusaika || !isValidTime(payload.aloitusaika)) {
    return "Kentta aloitusaika puuttuu tai on virheellinen.";
  }

  if (!payload.lopetusaika || !isValidTime(payload.lopetusaika)) {
    return "Kentta lopetusaika puuttuu tai on virheellinen.";
  }

  if (typeof payload.ajoaika_kohteeseen_min !== "number" || payload.ajoaika_kohteeseen_min < 0) {
    return "Kentta ajoaika_kohteeseen_min puuttuu tai on virheellinen.";
  }

  if (typeof payload.ajoaika_riihimaelta_min !== "number" || payload.ajoaika_riihimaelta_min < 0) {
    return "Kentta ajoaika_riihimaelta_min puuttuu tai on virheellinen.";
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as BookingPayload;
    const error = parsePayload(payload);

    if (error) {
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    const booking = await saveBooking({
      asiakas_nimi: payload.asiakas_nimi?.trim(),
      asiakas_email: payload.asiakas_email!.trim(),
      asiakas_puhelin: payload.asiakas_puhelin?.trim(),
      palvelutyyppi: payload.palvelutyyppi!.trim(),
      lahto_osoite: payload.lahto_osoite!.trim(),
      kohde_osoite: payload.kohde_osoite!.trim(),
      varaus_pvm: payload.varaus_pvm!,
      aloitusaika: payload.aloitusaika!,
      lopetusaika: payload.lopetusaika!,
      ajoaika_kohteeseen_min: payload.ajoaika_kohteeseen_min!,
      ajoaika_riihimaelta_min: payload.ajoaika_riihimaelta_min!,
      hinta_alv: payload.hinta_alv ?? null,
      hinta_alv0: payload.hinta_alv0 ?? null,
      status: "vahvistettu",
    });

    await sendBookingEmails({
      bookingId: booking.id,
      customerName: payload.asiakas_nimi?.trim() || "Asiakas",
      customerEmail: payload.asiakas_email!.trim(),
      customerPhone: payload.asiakas_puhelin?.trim() || "-",
      serviceType: payload.palvelutyyppi!.trim(),
      pickupAddress: payload.lahto_osoite!.trim(),
      destinationAddress: payload.kohde_osoite!.trim(),
      reservationDate: payload.varaus_pvm!,
      arrivalTime: payload.aloitusaika!,
      riihimakiDepartureTime: payload.riihimaki_lahtoaika?.trim() || payload.aloitusaika!,
      driveToDestinationMinutes: payload.ajoaika_kohteeseen_min!,
      driveFromRiihimakiMinutes: payload.ajoaika_riihimaelta_min!,
      hintaAlv: payload.hinta_alv ?? null,
      hintaAlv0: payload.hinta_alv0 ?? null,
    });

    return NextResponse.json({ ok: true, bookingId: booking.id });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Varauksen tallennus epaonnistui.",
      },
      { status: 500 },
    );
  }
}
