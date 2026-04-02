import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { saveQuoteRequest } from "../../../lib/quote-store";
import type { QuoteRequestData } from "@/lib/types";

type QuotePayload = Omit<QuoteRequestData, "source" | "status">;

const requiredFields: Array<keyof QuotePayload> = [
  "name",
  "phone",
  "email",
  "serviceType",
  "addresses",
];

function validatePayload(payload: Partial<QuotePayload>) {
  for (const field of requiredFields) {
    const value = payload[field];
    if (!value || !value.trim()) {
      return `Kentta ${field} puuttuu.`;
    }
  }

  if (!payload.email?.includes("@")) {
    return "Sahkoposti ei ole kelvollinen.";
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Partial<QuotePayload>;
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

    const data = payload as QuotePayload;

    await saveQuoteRequest({
      name: data.name,
      phone: data.phone,
      email: data.email,
      serviceType: data.serviceType,
      addresses: data.addresses,
      message: data.message || "",
      source: "website",
      status: "received",
    });

    await transporter.sendMail({
      from: fromAddress,
      to: recipient,
      subject: `Tarjouspyynto: ${data.serviceType}`,
      text: [
        `Nimi: ${data.name}`,
        `Puhelin: ${data.phone}`,
        `Sahkoposti: ${data.email}`,
        `Palvelu: ${data.serviceType}`,
        `Nouto / toimitus: ${data.addresses}`,
        "",
        "Viesti:",
        data.message || "-",
      ].join("\n"),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Tarjouspyynnon kasittely epaonnistui palvelimella.",
      },
      { status: 500 },
    );
  }
}