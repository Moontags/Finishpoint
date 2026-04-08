import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { generateReceiptHtml } from "../../../../lib/email-templates";
import { getOrderByReference, markOrderAsPaid } from "@/lib/order-store";
import { saveBooking, updateBookingStatus } from "@/lib/bookings";

function getExpectedToken() {
  return process.env.VIPPS_WEBHOOK_AUTH_TOKEN?.trim() ?? "";
}

function hasValidAuthorizationHeader(request: Request, expectedToken: string) {
  if (!expectedToken) {
    return true;
  }

  const authHeader = request.headers.get("authorization") ?? "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    return false;
  }

  const providedToken = authHeader.slice(7).trim();
  return providedToken === expectedToken;
}

function getEventName(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return "unknown";
  }

  const data = payload as Record<string, unknown>;
  const candidates = [
    data.eventName,
    data.eventType,
    data.name,
    data.status,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate;
    }
  }

  return "unknown";
}

function getReference(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const data = payload as Record<string, unknown>;
  const candidates = [
    data.reference,
    data.orderId,
    data.paymentReference,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return "";
}

function isReceiptEvent(eventName: string) {
  const normalized = eventName.trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  return (
    normalized === "epayments.payment.captured.v1" ||
    normalized === "epayments.payment.authorized.v1" ||
    normalized.includes("payment_capture") ||
    normalized.includes("payment_authorized") ||
    normalized.includes("payment.captured") ||
    normalized.includes("payment.authorized") ||
    normalized === "authorized" ||
    normalized === "captured"
  );
}

export async function POST(request: Request) {
  const expectedToken = getExpectedToken();
  // Auth temporarily disabled for debugging
  // if (!hasValidAuthorizationHeader(request, expectedToken)) {
  //   return NextResponse.json({ ok: false, error: "Unauthorized webhook request." }, { status: 401 });
  // }

  const rawBody = await request.text();
  let payload: unknown = {};

  if (rawBody) {
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
    }
  }

  const eventName = getEventName(payload);
  const reference = getReference(payload);

  console.info("Vipps webhook received", {
    eventName,
    reference: reference || "unknown",
    receivedAt: new Date().toISOString(),
  });

  if (isReceiptEvent(eventName) && reference) {
    const order = await getOrderByReference(reference);

    if (order) {
      try {
        await markOrderAsPaid(order.orderId, reference);
      } catch (error) {
        console.error("Order payment status update failed", {
          orderId: order.orderId,
          reference,
          error,
        });
      }

      try {
        await sendEmail({
          to: order.customerEmail,
          subject: `Kuitti ${order.orderId} - Finishpoint`,
          html: generateReceiptHtml({
            ...order,
            vippsReference: reference,
          }),
        });
      // Vahvista varaus maksetuksi
      try {
        await updateBookingStatus(order.orderId, "vahvistettu");
      } catch (error) {
        console.error("Booking status update failed", { orderId: order.orderId, error });
      }
      } catch (error) {
        console.error("Receipt email sending failed", {
          orderId: order.orderId,
          reference,
          error,
        });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
