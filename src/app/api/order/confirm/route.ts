import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import {
  calculateVat,
  generateInvoiceNumber,
  generateOrderConfirmationHtml,
} from "../../../../lib/email-templates";
import { saveOrder } from "@/lib/order-store";
import { saveBooking } from "../../../../lib/bookings";
import { sendBookingEmails } from "../../../../lib/booking-emails";
import type { BookingSelectionData, OrderData } from "../../../../lib/types";

type ConfirmOrderPayload = {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  serviceDescription?: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  totalWithVat?: number;
  paymentMethod?: "mobilepay" | "invoice";
  bookingSelection?: BookingSelectionData | null;
};

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function parsePayload(raw: unknown): { ok: true; value: ConfirmOrderPayload } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object") {
    return { ok: false, error: "Virheellinen pyynto." };
  }

  const payload = raw as ConfirmOrderPayload;

  const requiredTextFields: Array<keyof ConfirmOrderPayload> = [
    "customerName",
    "customerEmail",
    "customerPhone",
    "serviceDescription",
    "pickupAddress",
    "deliveryAddress",
  ];

  for (const field of requiredTextFields) {
    const value = payload[field];
    if (typeof value !== "string" || !value.trim()) {
      return { ok: false, error: `Kentta ${field} puuttuu.` };
    }
  }

  if (!payload.customerEmail?.includes("@")) {
    return { ok: false, error: "Sahkoposti ei ole kelvollinen." };
  }

  if (typeof payload.totalWithVat !== "number" || !Number.isFinite(payload.totalWithVat) || payload.totalWithVat <= 0) {
    return { ok: false, error: "Virheellinen summa." };
  }

  if (payload.paymentMethod !== "mobilepay" && payload.paymentMethod !== "invoice") {
    return { ok: false, error: "Virheellinen maksutapa." };
  }

  if (payload.totalWithVat > 400 && (!payload.customerAddress || !payload.customerAddress.trim())) {
    return { ok: false, error: "Asiakkaan osoite vaaditaan yli 400 EUR laskuille." };
  }

  if (payload.bookingSelection) {
    const booking = payload.bookingSelection;
    if (!isValidDate(booking.reservationDate)) {
      return { ok: false, error: "Varauksen paivamaara on virheellinen." };
    }
    if (!isValidTime(booking.arrivalTime) || !isValidTime(booking.releaseTime) || !isValidTime(booking.riihimakiDepartureTime)) {
      return { ok: false, error: "Varauksen kellonaika on virheellinen." };
    }
  }

  return { ok: true, value: payload };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as unknown;
    const parsed = parsePayload(body);

    if (!parsed.ok) {
      return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
    }

    const payload = parsed.value;
    const { netAmount, vatAmount, vatRate } = calculateVat(payload.totalWithVat ?? 0, 25.5);

    const order: OrderData = {
      orderId: generateInvoiceNumber(),
      orderDate: new Date().toISOString(),
      customerName: payload.customerName!.trim(),
      customerEmail: payload.customerEmail!.trim(),
      customerPhone: payload.customerPhone!.trim(),
      customerAddress: payload.customerAddress?.trim() || undefined,
      serviceDescription: payload.serviceDescription!.trim(),
      pickupAddress: payload.pickupAddress!.trim(),
      deliveryAddress: payload.deliveryAddress!.trim(),
      totalWithVat: payload.totalWithVat ?? 0,
      vatRate,
      vatAmount,
      netAmount,
      paymentMethod: payload.paymentMethod!,
    };

    try {
      await saveOrder(order);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Tuntematon virhe";
      console.error("Order save failed in /api/order/confirm", error);
      return NextResponse.json(
        {
          ok: false,
          error: `Tilauksen tallennus epaonnistui. ${reason}`,
        },
        { status: 500 },
      );
    }

    const warnings: string[] = [];

    if (payload.bookingSelection) {
      const booking = payload.bookingSelection;
      let bookingResult: { id: string };

      try {
        bookingResult = await saveBooking({
          asiakas_nimi: order.customerName,
          asiakas_email: order.customerEmail,
          asiakas_puhelin: order.customerPhone,
          palvelutyyppi: order.serviceDescription,
          lahto_osoite: order.pickupAddress,
          kohde_osoite: order.deliveryAddress,
          varaus_pvm: booking.reservationDate,
          aloitusaika: booking.arrivalTime,
          lopetusaika: booking.releaseTime,
          ajoaika_kohteeseen_min: booking.driveToDestinationMinutes,
          ajoaika_riihimaelta_min: booking.driveFromRiihimakiMinutes,
          hinta_alv: order.totalWithVat,
          hinta_alv0: order.netAmount,
          status: "vahvistettu",
        });
      } catch (error) {
        const reason = error instanceof Error ? error.message : "Tuntematon virhe";
        console.error("Booking save failed in /api/order/confirm", error);
        return NextResponse.json(
          {
            ok: false,
            error: `Varauksen tallennus epaonnistui. ${reason}`,
          },
          { status: 500 },
        );
      }

      try {
        await sendBookingEmails({
          bookingId: bookingResult.id,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          serviceType: order.serviceDescription,
          pickupAddress: order.pickupAddress,
          destinationAddress: order.deliveryAddress,
          reservationDate: booking.reservationDate,
          arrivalTime: booking.arrivalTime,
          riihimakiDepartureTime: booking.riihimakiDepartureTime,
          driveToDestinationMinutes: booking.driveToDestinationMinutes,
          driveFromRiihimakiMinutes: booking.driveFromRiihimakiMinutes,
          hintaAlv: order.totalWithVat,
          hintaAlv0: order.netAmount,
        });
      } catch (error) {
        console.error("Booking emails failed in /api/order/confirm", error);
        warnings.push("Varausviestien lahetys epaonnistui.");
      }
    }

    try {
      await sendEmail({
        to: order.customerEmail,
        subject: `Tilausvahvistus ${order.orderId} - Finishpoint`,
        html: generateOrderConfirmationHtml(order),
      });
    } catch (error) {
      console.error("Order confirmation email failed in /api/order/confirm", error);
      warnings.push("Tilausvahvistuksen sahkoposti epaonnistui.");
    }

    return NextResponse.json({ ok: true, orderId: order.orderId, warnings });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Tilausvahvistuksen lahetys epaonnistui.",
      },
      { status: 500 },
    );
  }
}
