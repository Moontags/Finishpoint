import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createMobilePayPayment, hasMobilePayApiCredentials } from "../../../lib/mobilepay-api";

type OrderPayload = {
  name: string;
  phone: string;
  email: string;
  serviceType: string;
  addresses: string;
  message: string;
  estimatedPriceVat0: number | null;
  estimatedPriceVatIncl: number | null;
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

    if (hasMobilePayApiCredentials()) {
      try {
        paymentUrl = await createMobilePayPayment({
          orderId: `FP-${new Date().toISOString().slice(0, 10)}-${randomUUID().slice(0, 8)}`,
          amount: data.estimatedPriceVatIncl ?? estimatedPriceVat0,
          description: `Finishpoint ${data.serviceType}`,
          customerEmail: data.email,
          customerPhone: data.phone,
        });
      } catch (error) {
        if (!mobilePayLink) {
          return NextResponse.json(
            {
              ok: false,
              error:
                "MobilePay API -maksun luonti epaonnistui. Tarkista MOBILEPAY_* asetukset palvelimella.",
            },
            { status: 502 },
          );
        }

        console.error("MobilePay API failed, falling back to public payment link", error);
      }
    }

    if (!paymentUrl) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Maksuasetukset puuttuvat. Maarita NEXT_PUBLIC_MOBILEPAY_PAYMENT_LINK tai palvelinpuolen MOBILEPAY_* API-avaimet.",
        },
        { status: 500 },
      );
    }

    await transporter.sendMail({
      from: fromAddress,
      to: recipient,
      subject: `Tilaus ja maksu: ${data.serviceType}`,
      text: [
        "Uusi tilaus vastaanotettu.",
        "",
        `Nimi: ${data.name}`,
        `Puhelin: ${data.phone}`,
        `Sahkoposti: ${data.email}`,
        `Palvelu: ${data.serviceType}`,
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
