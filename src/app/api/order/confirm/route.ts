import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import {
  calculateVat,
  generateInvoiceNumber,
  generateOrderConfirmationHtml,
} from "../../../../lib/email-templates";
import { saveOrder } from "@/lib/order-store";
import type { OrderData } from "../../../../lib/types";

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
};

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

    await saveOrder(order);

    await sendEmail({
      to: order.customerEmail,
      subject: `Tilausvahvistus ${order.orderId} - Finishpoint`,
      html: generateOrderConfirmationHtml(order),
    });

    return NextResponse.json({ ok: true, orderId: order.orderId });
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
