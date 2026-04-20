import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      name = "-", phone = "-", email = "-", pickupAddress = "-", deliveryAddress = "-", message = "-"
    } = data || {};
    const html = `
      <h2>Pakuvie Chat-automaattitäyttö</h2>
      <ul>
        <li><b>Nimi:</b> ${name}</li>
        <li><b>Puhelin:</b> ${phone}</li>
        <li><b>Sähköposti:</b> ${email}</li>
        <li><b>Nouto:</b> ${pickupAddress}</li>
        <li><b>Toimitus:</b> ${deliveryAddress}</li>
        <li><b>Kuvaus:</b> ${message}</li>
      </ul>
      <p>Viesti lähetetty automaattitäytön yhteydessä chatista.</p>
    `;
    await sendEmail({
      to: "kuljetus@pakuvie.fi",
      subject: "Chat-automaattitäyttö: uusi tarjous/varaus",
      html,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Sähköpostin lähetys epäonnistui." }, { status: 500 });
  }
}
