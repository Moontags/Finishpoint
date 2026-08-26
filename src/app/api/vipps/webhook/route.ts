import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getOperatorRecipient, sendEmail } from "@/lib/email";
import {
  generateOperatorOrderNotificationHtml,
  generateReceiptHtml,
} from "../../../../lib/email-templates";
import { getOrderByReference, markOrderAsPaid, markOrderEmailStatus } from "@/lib/order-store";
import { markBookingEmailStatus, updateBookingStatus } from "@/lib/bookings";
import { isValidEmail } from "@/lib/email-validation";

function getExpectedToken() {
  return process.env.VIPPS_WEBHOOK_AUTH_TOKEN?.trim() ?? "";
}

// Webhookin rekisteröinnin yhteydessä Vippsiltä saatu salaisuus (webhookin
// luontivastauksen "secret"). Sillä varmistetaan, että kutsu on aidosti
// Vippsiltä. Ilman tätä (tai bearer-tokenia) webhookia ei käsitellä.
// Fallback VIPPS_WEBHOOK_AUTH_TOKENiin siltä varalta, että sama salaisuus on
// aiemmin tallennettu sillä nimellä.
function getWebhookSecret() {
  return (
    process.env.VIPPS_WEBHOOK_SECRET?.trim() ||
    process.env.VIPPS_WEBHOOK_AUTH_TOKEN?.trim() ||
    ""
  );
}

function safeEqual(expected: string, provided: string) {
  const expectedBuffer = Buffer.from(expected, "utf8");
  const providedBuffer = Buffer.from(provided, "utf8");

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
}

function hasValidAuthorizationHeader(request: Request, expectedToken: string) {
  // Tyhjä token ei enää tarkoita "tarkistus ohitetaan": kutsu hylätään
  // muualla, jos mitään autentikointitapaa ei ole konfiguroitu.
  if (!expectedToken) {
    return false;
  }

  const authHeader = request.headers.get("authorization") ?? "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    return false;
  }

  const providedToken = authHeader.slice(7).trim();
  return safeEqual(expectedToken, providedToken);
}

// Vippsin webhook-allekirjoitus (Azure-tyylinen HMAC):
// authorization: HMAC-SHA256 SignedHeaders=x-ms-date;host;x-ms-content-sha256&Signature=<base64>
// https://developer.vippsmobilepay.com/docs/APIs/webhooks-api/request-authentication/
function parseSignature(authHeader: string) {
  const match = /Signature=([^&\s]+)/i.exec(authHeader);
  return match ? match[1] : "";
}

function hasValidVippsSignature(request: Request, rawBody: string, secret: string) {
  if (!secret) {
    return false;
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const dateHeader = request.headers.get("x-ms-date") ?? "";
  const contentHashHeader = request.headers.get("x-ms-content-sha256") ?? "";
  const url = new URL(request.url);
  // Vipps allekirjoittaa rekisteroidyn URLin hostilla. Host-header on
  // ensisijainen, mutta jos sita ei ole, kaytetaan pyynnon URLin hostia.
  const host = request.headers.get("host") || url.host;

  if (!authHeader || !dateHeader || !contentHashHeader || !host) {
    return false;
  }

  // 1. Bodyn eheys: SHA256 + base64 vastaa x-ms-content-sha256 -headeria.
  const contentHash = createHash("sha256").update(rawBody, "utf8").digest("base64");
  if (!safeEqual(contentHash, contentHashHeader)) {
    return false;
  }

  // 2. Allekirjoitus lasketaan muodosta POST\n<pathAndQuery>\n<date>;<host>;<hash>
  const stringToSign = [
    "POST",
    `${url.pathname}${url.search}`,
    `${dateHeader};${host};${contentHashHeader}`,
  ].join("\n");
  const expectedSignature = createHmac("sha256", secret)
    .update(stringToSign, "utf8")
    .digest("base64");

  const providedSignature = parseSignature(authHeader);
  if (!providedSignature) {
    return false;
  }

  return safeEqual(expectedSignature, providedSignature);
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
  const webhookSecret = getWebhookSecret();

  // Body luetaan ennen autentikointia, koska Vippsin allekirjoitus lasketaan
  // bodyn sisällöstä. Mitään sivuvaikutuksia ei tehdä ennen tarkistusta.
  const rawBody = await request.text();

  if (!webhookSecret && !expectedToken) {
    console.error(
      "Vipps webhook rejected: no authentication configured. Set VIPPS_WEBHOOK_SECRET (webhookin rekisteroinnista saatu secret) tai VIPPS_WEBHOOK_AUTH_TOKEN.",
    );
    return NextResponse.json(
      { ok: false, error: "Webhook authentication is not configured." },
      { status: 401 },
    );
  }

  const isAuthenticated =
    hasValidVippsSignature(request, rawBody, webhookSecret) ||
    hasValidAuthorizationHeader(request, expectedToken);

  if (!isAuthenticated) {
    console.error("Vipps webhook rejected: invalid signature or token", {
      hasAuthorizationHeader: Boolean(request.headers.get("authorization")),
      hasSignatureHeaders: Boolean(request.headers.get("x-ms-content-sha256")),
      receivedAt: new Date().toISOString(),
    });
    return NextResponse.json(
      { ok: false, error: "Unauthorized webhook request." },
      { status: 401 },
    );
  }

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

      const operatorRecipient = getOperatorRecipient();
      // Vipps lähettää sekä AUTHORIZED- että CAPTURED-tapahtuman samasta
      // maksusta. Jos kuitti on jo lähetetty, ei lähetetä sitä eikä
      // ilmoitusta uudelleen.
      const alreadyNotified = order.emailDeliveryStatus === "sent";

      // Varmistus ennen lähetystä: ennen validoinnin käyttöönottoa tallennetut
      // tilaukset voivat sisältää virheellisen osoitteen. Ei yritetä lähettää
      // varmasti bouncaavaan osoitteeseen, vaan merkitään tila suoraan.
      if (alreadyNotified) {
        console.info("Receipt email skipped: already sent", {
          orderId: order.orderId,
          reference,
        });
      } else if (!isValidEmail(order.customerEmail)) {
        console.error("Receipt email skipped: invalid recipient", {
          orderId: order.orderId,
          reference,
        });
        await markOrderEmailStatus(order.orderId, "failed", "Virheellinen sähköpostiosoite");
        await markBookingEmailStatus(order.orderId, "failed");
      } else try {
        await sendEmail({
          to: order.customerEmail,
          subject: `Kuitti ${order.orderId} - Pakuvie`,
          html: generateReceiptHtml({
            ...order,
            vippsReference: reference,
          }),
          // Asiakkaan vastaus ohjautuu meille, ei from-osoitteeseen.
          replyTo: operatorRecipient,
        });
        await markOrderEmailStatus(order.orderId, "sent");
        await markBookingEmailStatus(order.orderId, "sent");
      } catch (error) {
        // Kuitin lähetys epäonnistui (esim. bounce / virheellinen osoite).
        // Tallennetaan tila, jotta myyjä näkee sen admin-näkymässä eikä sitä
        // tarvitse etsiä manuaalisesti roskaposti- tai bounce-viesteistä.
        const reason = error instanceof Error ? error.message : "Tuntematon virhe";
        console.error("Receipt email sending failed", {
          orderId: order.orderId,
          reference,
          error,
        });
        await markOrderEmailStatus(order.orderId, "failed", reason);
        await markBookingEmailStatus(order.orderId, "failed");
      }

      // Ilmoitus meille maksetusta tilauksesta. Lähetetään kuitista
      // riippumatta, jotta kuljetus voidaan aikatauluttaa vaikka asiakkaan
      // osoite olisi virheellinen.
      if (!alreadyNotified) {
        try {
          await sendEmail({
            to: operatorRecipient,
            subject: `MAKSETTU tilaus ${order.orderId} - ${order.deliveryAddress}`,
            html: generateOperatorOrderNotificationHtml(
              { ...order, vippsReference: reference },
              { paymentState: "paid" },
            ),
            // Vastaus ohjautuu suoraan tilaajalle.
            ...(isValidEmail(order.customerEmail)
              ? { replyTo: order.customerEmail.trim() }
              : {}),
          });
        } catch (error) {
          console.error("Operator paid-order notification failed", {
            orderId: order.orderId,
            reference,
            error,
          });
        }
      }

      // Vahvista varaus maksetuksi (riippumaton kuitin lähetyksestä).
      try {
        await updateBookingStatus(order.orderId, "vahvistettu");
      } catch (error) {
        console.error("Booking status update failed", { orderId: order.orderId, error });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
