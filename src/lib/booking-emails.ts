import { sendEmail } from "@/lib/email";

type BookingEmailPayload = {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceType: string;
  pickupAddress: string;
  destinationAddress: string;
  reservationDate: string;
  arrivalTime: string;
  riihimakiDepartureTime: string;
  driveToDestinationMinutes: number;
  driveFromRiihimakiMinutes: number;
  hintaAlv: number | null;
  hintaAlv0: number | null;
};

function formatPrice(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "-";
  }

  return `${value.toFixed(2)} EUR`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function customerTemplate(payload: BookingEmailPayload) {
  return `
    <div style="font-family:Segoe UI, sans-serif; color:#1f2937; line-height:1.55; max-width:640px; margin:0 auto;">
      <h2 style="margin:0 0 12px; color:#1a2e4a;">Varausvahvistus - Kuljetus ${escapeHtml(payload.reservationDate)} klo ${escapeHtml(payload.arrivalTime)}</h2>
      <p>Hei ${escapeHtml(payload.customerName)},</p>
      <p>Varauksesi on vahvistettu. Alla yhteenveto:</p>
      <ul>
        <li>Palvelu: ${escapeHtml(payload.serviceType)}</li>
        <li>Nouto: ${escapeHtml(payload.pickupAddress)}</li>
        <li>Toimitus: ${escapeHtml(payload.destinationAddress)}</li>
        <li>Paiva: ${escapeHtml(payload.reservationDate)}</li>
        <li>Saapuminen kohteeseen: noin klo ${escapeHtml(payload.arrivalTime)}</li>
        <li>Auton lahto Riihimaelta: noin klo ${escapeHtml(payload.riihimakiDepartureTime)}</li>
        <li>Arvioitu ajoaika kohteeseen: ${payload.driveToDestinationMinutes} min</li>
      </ul>
      <p>Hinta: ${formatPrice(payload.hintaAlv)} (sis. ALV 25,5 %)<br/>Yrityksille (ALV 0 %): ${formatPrice(payload.hintaAlv0)}</p>
      <p>Varausnumero: ${escapeHtml(payload.bookingId)}</p>
    </div>
  `;
}

function operatorTemplate(payload: BookingEmailPayload) {
  return `
    <div style="font-family:Segoe UI, sans-serif; color:#1f2937; line-height:1.55; max-width:640px; margin:0 auto;">
      <h2 style="margin:0 0 12px; color:#1a2e4a;">Uusi varaus ${escapeHtml(payload.reservationDate)} klo ${escapeHtml(payload.arrivalTime)}</h2>
      <ul>
        <li>Asiakas: ${escapeHtml(payload.customerName)} | ${escapeHtml(payload.customerPhone)} | ${escapeHtml(payload.customerEmail)}</li>
        <li>Reitti: ${escapeHtml(payload.pickupAddress)} -> ${escapeHtml(payload.destinationAddress)}</li>
        <li>Palvelu: ${escapeHtml(payload.serviceType)}</li>
        <li>Ajoaika Riihimaelta: ${payload.driveFromRiihimakiMinutes} min</li>
        <li>Ajoaika kohteeseen: ${payload.driveToDestinationMinutes} min</li>
        <li>Hinta: ${formatPrice(payload.hintaAlv)} (ALV) / ${formatPrice(payload.hintaAlv0)} (ALV 0 %)</li>
      </ul>
      <p>Varausnumero: ${escapeHtml(payload.bookingId)}</p>
    </div>
  `;
}

export async function sendBookingEmails(payload: BookingEmailPayload) {
  const operatorRecipient = process.env.QUOTE_RECIPIENT?.trim() || "kuljetus@finishpoint.fi";

  await sendEmail({
    to: payload.customerEmail,
    subject: `Varausvahvistus - Kuljetus ${payload.reservationDate} klo ${payload.arrivalTime}`,
    html: customerTemplate(payload),
  });

  await sendEmail({
    to: operatorRecipient,
    subject: `Uusi varaus ${payload.reservationDate} klo ${payload.arrivalTime} - ${payload.destinationAddress}`,
    html: operatorTemplate(payload),
  });
}
