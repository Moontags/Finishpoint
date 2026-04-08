import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import {
  createMobilePayPayment,
  hasMobilePayApiCredentials,
  MobilePayApiError,
} from "../../../lib/mobilepay-api";
import { saveBooking } from "@/lib/bookings";
import type { BookingSelectionData } from "@/lib/types";

type OrderPayload = {
  orderId?: string;
  name: string;
  phone: string;
  email: string;
  serviceType: string;
  addresses: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  message: string;
  estimatedPriceVat0: number | null;
  estimatedPriceVatIncl: number | null;
  bookingSelection?: BookingSelectionData | null;
};

const requiredFields: Array<keyof OrderPayload> = [
  "name",
  "phone",
  "email",
  "serviceType",
  "addresses",
];

function validatePayload(payload: Partial<OrderPayload>) {
  for (const field of requiredFields) {
    const value = payload[field];
    if (typeof value !== "string" || !value.trim()) {
      return `Kentta ${field} puuttuu.`;
    }
  }

  if (!payload.email?.includes("@")) {
    return "Sahkoposti ei ole kelvollinen.";
  }

  if (
    typeof payload.estimatedPriceVat0 !== "number" ||
    !Number.isFinite(payload.estimatedPriceVat0) ||
    payload.estimatedPriceVat0 <= 0
  ) {
    return "Hinta puuttuu laskurilta. Laske hinta ennen tilausta.";
  }

  return null;
}

function extractMobilePayReason(details: unknown) {
  if (!details || typeof details !== "object") {
    return "";
  }

  const data = details as Record<string, unknown>;
  const error = typeof data.error === "string" ? data.error : "";
  const description = typeof data.error_description === "string" ? data.error_description : "";
  const message = typeof data.message === "string" ? data.message : "";
  const detail = typeof data.detail === "string" ? data.detail : "";

  const missingFlags: string[] = [];
  if (data.returnUrl === false) {
    missingFlags.push("VIPPS_RETURN_URL");
  }
  if (data.phoneNormalized === false) {
    missingFlags.push("customer phoneNumber (e.g. 358501234567)");
  }
  if (missingFlags.length > 0) {
    return `Missing: ${missingFlags.join(", ")}`;
  }

  const expectedFormat = typeof data.expectedFormat === "string" ? data.expectedFormat : "";
  const phoneOriginal = typeof data.phoneOriginal === "string" ? data.phoneOriginal : "";
  const phoneNormalized = typeof data.phoneNormalized === "string" ? data.phoneNormalized : "";
  if (expectedFormat || phoneOriginal || phoneNormalized) {
    const parts = [
      phoneOriginal ? `input=${phoneOriginal}` : "",
      phoneNormalized ? `normalized=${phoneNormalized}` : "",
      expectedFormat ? `expected=${expectedFormat}` : "",
    ].filter(Boolean);
    if (parts.length > 0) {
      return `Invalid phone format (${parts.join(", ")})`;
    }
  }

  if (Array.isArray(data.errors)) {
    const errorTexts = data.errors
      .map((item) => {
        if (!item || typeof item !== "object") {
          return "";
        }
        const value = item as Record<string, unknown>;
        const field = typeof value.field === "string" ? value.field : "";
        const msg = typeof value.message === "string" ? value.message : "";
        const code = typeof value.code === "string" ? value.code : "";
        const parts = [field, msg, code].filter(Boolean);
        return parts.join(" ").trim();
      })
      .filter(Boolean)
      .join("; ");

    if (errorTexts) {
      return errorTexts;
    }
  }

  if (error && description) {
    return `${error}: ${description}`;
  }

  if (description) {
    return description;
  }

  if (message) {
    return message;
  }

  if (detail) {
    return detail;
  }

  if (error) {
    return error;
  }

  return "";
}

function isMobilePayInvalidClient(details: unknown) {
  if (!details || typeof details !== "object") {
    return false;
  }

  const data = details as Record<string, unknown>;
  return data.error === "invalid_client";
}

function isVippsPaymentServerError(error: unknown) {
  return (
    error instanceof MobilePayApiError &&
    error.code === "VIPPS_PAYMENT_REQUEST_FAILED" &&
    typeof error.status === "number" &&
    error.status >= 500
  );
}

function isVippsInvalidSubscriptionKey(error: unknown) {
  if (!(error instanceof MobilePayApiError)) {
    return false;
  }

  if (error.code !== "VIPPS_PAYMENT_REQUEST_FAILED" || error.status !== 401) {
    return false;
  }

  const raw = JSON.stringify(error.details ?? {}).toLowerCase();
  return raw.includes("invalid subscription key");
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Partial<OrderPayload>;
    const validationError = validatePayload(payload);

    if (validationError) {
      return NextResponse.json(
        { ok: false, error: validationError },
        { status: 400 },
      );
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpPort = Number(process.env.SMTP_PORT ?? "587");
    const smtpSecure = process.env.SMTP_SECURE === "true";
    const recipient = process.env.QUOTE_RECIPIENT ?? "kuljetus@finishpoint.fi";
    const fromAddress = process.env.SMTP_FROM ?? smtpUser;
    const mobilePayLink = process.env.NEXT_PUBLIC_MOBILEPAY_PAYMENT_LINK?.trim() ?? "";

    if (!smtpHost || !smtpUser || !smtpPass || !fromAddress) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Sahkopostin palvelinasetukset puuttuvat. Maarita SMTP_HOST, SMTP_USER, SMTP_PASS ja SMTP_FROM.",
        },
        { status: 500 },
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      requireTLS: smtpPort === 587 && !smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const data = payload as OrderPayload;
    const estimatedPriceVat0 = data.estimatedPriceVat0;

    if (estimatedPriceVat0 === null) {
      return NextResponse.json(
        {
          ok: false,
          error: "Hinta puuttuu laskurilta. Laske hinta ennen tilausta.",
        },
        { status: 400 },
      );
    }

    let paymentUrl = mobilePayLink;
    const orderId = data.orderId?.trim() || `FP-${new Date().toISOString().slice(0, 10)}-${randomUUID().slice(0, 8)}`;
    const origin = new URL(request.url).origin;
    const returnUrl = process.env.VIPPS_RETURN_URL?.trim() || `${origin}/kassa`;
    const cancelUrl = process.env.VIPPS_CANCEL_URL?.trim() || `${origin}/#quote`;

    if (hasMobilePayApiCredentials()) {
      try {
        paymentUrl = await createMobilePayPayment({
          orderId,
          amount: data.estimatedPriceVatIncl ?? estimatedPriceVat0,
          description: `Finishpoint ${data.serviceType}`,
          customerEmail: data.email,
          customerPhone: data.phone,
          returnUrl,
          cancelUrl,
        });
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          if (error instanceof MobilePayApiError) {
            console.error("MobilePay API error", {
              code: error.code,
              status: error.status,
              details: error.details,
            });
          } else {
            console.error("MobilePay API unknown error", error);
          }
        }

        if (!mobilePayLink) {
          const extra =
            error instanceof MobilePayApiError
              ? ` (${error.code}${error.status ? ` ${error.status}` : ""})`
              : "";
          const reason =
            error instanceof MobilePayApiError
              ? extractMobilePayReason(error.details)
              : "";
          const invalidClientHint =
            error instanceof MobilePayApiError && isMobilePayInvalidClient(error.details)
              ? " Varmista MOBILEPAY_CLIENT_ID, MOBILEPAY_CLIENT_SECRET, MOBILEPAY_SUBSCRIPTION_KEY_PRIMARY ja MOBILEPAY_TOKEN_AUTH_METHOD=client_secret_basic (tai Vipps-tilassa VIPPS_CLIENT_ID, VIPPS_CLIENT_SECRET, VIPPS_SUBSCRIPTION_KEY_PRIMARY, VIPPS_MERCHANT_SERIAL_NUMBER). Jos arvot ovat oikein, generoi uusi client secret palveluntarjoajan portaalissa."
              : "";
          const vipps500Hint = isVippsPaymentServerError(error)
            ? " Vipps 500-virheessa tarkista erityisesti: VIPPS_PAYMENTS_URL (epayment), VIPPS_MERCHANT_SERIAL_NUMBER, VIPPS_RETURN_URL (julkinen https-osoite), VIPPS_CURRENCY ja avainten testi/tuotanto-ymparistojen vastaavuus."
            : "";
          const vippsInvalidSubscriptionHint = isVippsInvalidSubscriptionKey(error)
            ? " Vipps 401 Invalid Subscription Key: tarkista etta VIPPS_SUBSCRIPTION_KEY_PRIMARY on ePayment-tuotteen avain (ei Login), ettei arvossa ole valilyonteja tai rivinvaihtoa, ja etta avain kuuluu samaan ymparistoon (test/prod) kuin VIPPS_CLIENT_ID ja VIPPS_MERCHANT_SERIAL_NUMBER."
            : "";

          return NextResponse.json(
            {
              ok: false,
              error: `Maksun luonti epaonnistui. Tarkista MOBILEPAY_* tai VIPPS_* asetukset palvelimella${extra}${reason ? `: ${reason}` : ""}.${invalidClientHint}${vipps500Hint}${vippsInvalidSubscriptionHint}`,
            },
            { status: 502 },
          );
        }

        if (process.env.NODE_ENV !== "production") {
          console.error("MobilePay API failed, falling back to public payment link", error);
        }
      }
    }

    if (!paymentUrl) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Maksuasetukset puuttuvat. Maarita NEXT_PUBLIC_MOBILEPAY_PAYMENT_LINK tai palvelinpuolen VIPPS_* / MOBILEPAY_* API-avaimet.",
        },
        { status: 500 },
      );
    }

    await transporter.sendMail({
      from: fromAddress,
      to: recipient,
      subject: `Uusi tarjouspyynto / maksu kesken: ${data.serviceType}`,,
      text: [
        "HUOM: Maksu on viela kesken. Tilaus vahvistuu kun asiakas maksaa.",
        "",
        "",
        `Nimi: ${data.name}`,
        `Puhelin: ${data.phone}`,
        `Sahkoposti: ${data.email}`,
        `Palvelu: ${data.serviceType}`,
        `Tilausnumero: ${orderId}`,
        `Nouto / toimitus: ${data.addresses}`,
        `Hinta ALV 0 %: ${estimatedPriceVat0.toFixed(2)} EUR`,
        data.estimatedPriceVatIncl
          ? `Hinta sis. ALV: ${data.estimatedPriceVatIncl.toFixed(2)} EUR`
          : "Hinta sis. ALV: -",
        "",
        "Viesti:",
        data.message || "-",
        "",
        `Maksulinkki asiakkaalle: ${paymentUrl}`,
      ].join("\n"),
    });

    // Tallenna varaukset-tauluun jos käyttäjä valitsi aikaslotit kalenterista
    if (data.bookingSelection) {
      const sel = data.bookingSelection;
      try {
        await saveBooking({
          asiakas_nimi: data.name,
          asiakas_email: data.email,
          asiakas_puhelin: data.phone,
          palvelutyyppi: data.serviceType,
          lahto_osoite: data.pickupAddress || data.addresses,
          kohde_osoite: data.deliveryAddress || data.addresses,
          varaus_pvm: sel.reservationDate,
          aloitusaika: sel.riihimakiDepartureTime,
          lopetusaika: sel.releaseTime,
          ajoaika_kohteeseen_min: sel.driveToDestinationMinutes,
          ajoaika_riihimaelta_min: sel.driveFromRiihimakiMinutes,
          hinta_alv: data.estimatedPriceVatIncl ?? null,
          hinta_alv0: estimatedPriceVat0,
          status: "vahvistettu",
        });
      } catch (bookingError) {
        // Ei estä tilausta — kirjataan vain virhe lokiin
        console.error("Varaukset-tallennus epäonnistui (tilaus kuitenkin luotu)", {
          orderId,
          error: bookingError,
        });
      }
    }

    return NextResponse.json({ ok: true, paymentUrl });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Tilauksen kasittely epaonnistui palvelimella.",
      },
      { status: 500 },
    );
  }
}
