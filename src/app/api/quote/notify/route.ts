import { NextResponse } from "next/server";
import { getOperatorRecipient, sendEmail } from "@/lib/email";
import { isValidEmail, normalizeEmail } from "@/lib/email-validation";

// Chat-widget (ChatWidget.tsx) kutsuu tata reittia kun keskustelusta on
// poimittu tarjouspyynnon tiedot lomakkeelle. Reitin pitaa olla
// notify/route.ts, jotta App Router loytaa sen osoitteesta
// POST /api/quote/notify.

function asText(value: unknown) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return "-";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function POST(request: Request) {
  try {
    const data = (await request.json()) as Record<string, unknown> | null;

    const name = asText(data?.name);
    const phone = asText(data?.phone);
    const email = asText(data?.email);
    const pickupAddress = asText(data?.pickupAddress);
    const deliveryAddress = asText(data?.deliveryAddress);
    const message = asText(data?.message);

    const html = `
      <h2>Pakuvie Chat-automaattitäyttö</h2>
      <ul>
        <li><b>Nimi:</b> ${escapeHtml(name)}</li>
        <li><b>Puhelin:</b> ${escapeHtml(phone)}</li>
        <li><b>Sähköposti:</b> ${escapeHtml(email)}</li>
        <li><b>Nouto:</b> ${escapeHtml(pickupAddress)}</li>
        <li><b>Toimitus:</b> ${escapeHtml(deliveryAddress)}</li>
        <li><b>Kuvaus:</b> ${escapeHtml(message)}</li>
      </ul>
      <p>Viesti lähetetty automaattitäytön yhteydessä chatista.</p>
    `;

    await sendEmail({
      to: getOperatorRecipient(),
      subject: "Chat-automaattitäyttö: uusi tarjous/varaus",
      html,
      // Vastaus ohjautuu asiakkaalle, jos chat sai kelvollisen osoitteen.
      ...(isValidEmail(email) ? { replyTo: normalizeEmail(email) } : {}),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[quote/notify] Chat-ilmoituksen lähetys epäonnistui:", error);
    return NextResponse.json(
      { ok: false, error: "Sähköpostin lähetys epäonnistui." },
      { status: 500 },
    );
  }
}
