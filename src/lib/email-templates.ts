import type { OrderData } from "@/lib/types";
import { ALV_PROSENTTI, normalizeVatRate } from "@/lib/pricing";

const baseStyles = `
  font-family: Arial, sans-serif;
  color: #1a1a1a;
  max-width: 600px;
  margin: 0 auto;
`;

const tableStyles = `
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
`;

const thStyles = `
  background: #f5f5f5;
  padding: 8px 12px;
  text-align: left;
  border: 1px solid #e0e0e0;
  font-size: 13px;
`;

const tdStyles = `
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  font-size: 14px;
`;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function asEuro(value: number) {
  return `${value.toFixed(2)} EUR`;
}

// Näyttää ALV-kannan aina prosenttilukuna Suomen muodossa (esim. "25,5").
// Puolustautuu vanhaa dataa vastaan: jos kanta on tallennettu murtolukuna
// (esim. 0.255), se muunnetaan prosentiksi ennen näyttöä.
export function formatVatRate(vatRate: number): string {
  if (!Number.isFinite(vatRate)) {
    return "0";
  }
  const percent = vatRate > 0 && vatRate < 1 ? vatRate * 100 : vatRate;
  return percent.toLocaleString("fi-FI", { maximumFractionDigits: 2 });
}

export function calculateVat(totalWithVat: number, vatRate: number = ALV_PROSENTTI) {
  // Hyväksytään myös vanha murtolukumuoto (0.255) samalla logiikalla kuin
  // formatVatRate, jotta kuiteille ei koskaan päädy 0,26 %:n ALV-laskelmaa.
  const percent = normalizeVatRate(vatRate);
  const net = totalWithVat / (1 + percent / 100);
  const vat = totalWithVat - net;
  return {
    netAmount: Math.round(net * 100) / 100,
    vatAmount: Math.round(vat * 100) / 100,
    vatRate: percent,
  };
}

export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const seq = Date.now().toString().slice(-4);
  return `PV-${year}-${seq}`;
}

export function generateOrderConfirmationHtml(order: OrderData): string {
  const dateStr = new Date(order.orderDate).toLocaleDateString("fi-FI");

  return `
    <div style="${baseStyles}">
      <div style="background:#1a1a2e;padding:24px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-size:22px;">
          Pakuvie
        </h1>
      </div>

      <div style="padding:24px;">
        <h2 style="font-size:18px;margin-bottom:4px;">Tilausvahvistus</h2>
        <p style="color:#555;margin-top:0;">Tilausnumero: <strong>${escapeHtml(order.orderId)}</strong></p>

        <p>Hei ${escapeHtml(order.customerName)},</p>
        <p>
          Olemme vastaanottaneet tilauksesi. Vahvistamme kuljetuksen
          aikataulun sinulle pian.
        </p>

        <h3 style="font-size:15px;border-bottom:2px solid #e0e0e0;padding-bottom:6px;">
          Tilauksen tiedot
        </h3>
        <table style="${tableStyles}">
          <tr>
            <th style="${thStyles}">Päivämäärä</th>
            <td style="${tdStyles}">${dateStr}</td>
          </tr>
          <tr>
            <th style="${thStyles}">Palvelu</th>
            <td style="${tdStyles}">${escapeHtml(order.serviceDescription)}</td>
          </tr>
          <tr>
            <th style="${thStyles}">Nouto-osoite</th>
            <td style="${tdStyles}">${escapeHtml(order.pickupAddress)}</td>
          </tr>
          <tr>
            <th style="${thStyles}">Toimitusosoite</th>
            <td style="${tdStyles}">${escapeHtml(order.deliveryAddress)}</td>
          </tr>
          <tr>
            <th style="${thStyles}">Maksutapa</th>
            <td style="${tdStyles}">
              ${order.paymentMethod === "mobilepay" ? "MobilePay" : "Lasku (14 vrk)"}
            </td>
          </tr>
        </table>

        <h3 style="font-size:15px;border-bottom:2px solid #e0e0e0;padding-bottom:6px;">
          Hinta
        </h3>
        <table style="${tableStyles}">
          <tr>
            <th style="${thStyles}">Veroton hinta</th>
            <td style="${tdStyles}">${asEuro(order.netAmount)}</td>
          </tr>
          <tr>
            <th style="${thStyles}">ALV ${formatVatRate(order.vatRate)} %</th>
            <td style="${tdStyles}">${asEuro(order.vatAmount)}</td>
          </tr>
          <tr>
            <th style="${thStyles};background:#1a1a2e;color:#fff;">
              Yhteensä (sis. ALV)
            </th>
            <td style="${tdStyles};font-weight:bold;">
              ${asEuro(order.totalWithVat)}
            </td>
          </tr>
        </table>

        <p style="font-size:13px;color:#555;">
          Kysymyksiä? Ota yhteyttä:
          <a href="mailto:kuljetus@pakuvie.fi">kuljetus@pakuvie.fi</a>
          tai <a href="tel:+358503547763">050 354 7763</a>
        </p>
      </div>

      <div style="background:#f5f5f5;padding:16px;text-align:center;font-size:12px;color:#888;">
        Pakuvie |
        Y-tunnus: 3163260-9 |
        <a href="https://pakuvie.fi">pakuvie.fi</a>
      </div>
    </div>
  `;
}

// Ilmoitus meille (kuljetus@pakuvie.fi) uudesta tilauksesta. Sisältää samat
// tiedot kuin asiakkaan vahvistus, jotta kuljetus voidaan aikatauluttaa
// suoraan viestistä.
export function generateOperatorOrderNotificationHtml(
  order: OrderData,
  options: { paymentState: "paid" | "pending" },
): string {
  const dateStr = new Date(order.orderDate).toLocaleDateString("fi-FI");
  const booking = order.bookingSelection;
  const paymentMethodText =
    order.paymentMethod === "mobilepay" ? "MobilePay / Vipps" : "Lasku 14 vrk";
  const paymentStateText =
    options.paymentState === "paid"
      ? `MAKSETTU (${paymentMethodText})`
      : `Maksu kesken (${paymentMethodText})`;

  return `
    <div style="${baseStyles}">
      <div style="background:#1a1a2e;padding:20px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-size:20px;">Pakuvie</h1>
      </div>

      <div style="padding:24px;">
        <h2 style="font-size:18px;margin:0 0 4px;">
          ${options.paymentState === "paid" ? "Uusi maksettu tilaus" : "Uusi tilaus"}
        </h2>
        <p style="color:#555;margin-top:0;">
          Tilausnumero: <strong>${escapeHtml(order.orderId)}</strong> | ${dateStr}
        </p>

        <table style="${tableStyles}">
          <tr>
            <th style="${thStyles}">Maksutila</th>
            <td style="${tdStyles}"><strong>${paymentStateText}</strong></td>
          </tr>
          <tr>
            <th style="${thStyles}">Asiakas</th>
            <td style="${tdStyles}">${escapeHtml(order.customerName)}</td>
          </tr>
          <tr>
            <th style="${thStyles}">Puhelin</th>
            <td style="${tdStyles}">${escapeHtml(order.customerPhone)}</td>
          </tr>
          <tr>
            <th style="${thStyles}">Sähköposti</th>
            <td style="${tdStyles}">${escapeHtml(order.customerEmail)}</td>
          </tr>
          <tr>
            <th style="${thStyles}">Palvelu</th>
            <td style="${tdStyles}">${escapeHtml(order.serviceDescription)}</td>
          </tr>
          <tr>
            <th style="${thStyles}">Nouto</th>
            <td style="${tdStyles}">${escapeHtml(order.pickupAddress)}</td>
          </tr>
          <tr>
            <th style="${thStyles}">Toimitus</th>
            <td style="${tdStyles}">${escapeHtml(order.deliveryAddress)}</td>
          </tr>
          ${booking
            ? `<tr>
            <th style="${thStyles}">Varausaika</th>
            <td style="${tdStyles}">
              ${escapeHtml(booking.reservationDate)}, saapuminen klo ${escapeHtml(booking.arrivalTime)}
              (lähtö Riihimäeltä klo ${escapeHtml(booking.riihimakiDepartureTime)})
            </td>
          </tr>`
            : ""}
          <tr>
            <th style="${thStyles}">Veroton hinta</th>
            <td style="${tdStyles}">${asEuro(order.netAmount)}</td>
          </tr>
          <tr>
            <th style="${thStyles}">ALV ${formatVatRate(order.vatRate)} %</th>
            <td style="${tdStyles}">${asEuro(order.vatAmount)}</td>
          </tr>
          <tr>
            <th style="${thStyles}">Yhteensä (sis. ALV)</th>
            <td style="${tdStyles}"><strong>${asEuro(order.totalWithVat)}</strong></td>
          </tr>
          ${order.vippsReference
            ? `<tr>
            <th style="${thStyles}">Maksuviite</th>
            <td style="${tdStyles}">${escapeHtml(order.vippsReference)}</td>
          </tr>`
            : ""}
        </table>

        <p style="font-size:13px;color:#555;">
          Vastaamalla tähän viestiin vastaat suoraan asiakkaalle.
        </p>
      </div>
    </div>
  `;
}

export function generateReceiptHtml(order: OrderData): string {
  const dateStr = new Date(order.orderDate).toLocaleDateString("fi-FI");
  const showCustomerAddress = order.totalWithVat > 400;

  return `
    <div style="font-family:Arial,sans-serif;color:#1a1a1a;max-width:600px;width:100%;margin:0 auto;box-sizing:border-box;">
      <div style="background:#1a1a2e;padding:20px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-size:20px;">Pakuvie</h1>
      </div>

      <div style="padding:20px;">

        <!-- Header: myyjä + kuitti info stacked for mobile -->
        <table style="width:100%;margin-bottom:20px;border-collapse:collapse;">
          <tr>
            <td style="vertical-align:top;padding-bottom:12px;font-size:13px;line-height:1.6;">
              <strong>Myyjä</strong><br/>
              Pakuvie<br/>
              Petsamonkatu 27, Riihimäki<br/>
              Y-tunnus: 3163260-9<br/>
              ALV-tunnus: FI31632609
            </td>
            <td style="vertical-align:top;text-align:right;padding-bottom:12px;font-size:13px;line-height:1.6;">
              <strong style="font-size:18px;display:block;">KUITTI</strong>
              <span style="color:#555;">Numero: <strong>${escapeHtml(order.orderId)}</strong></span><br/>
              <span style="color:#555;">Päivämäärä: <strong>${dateStr}</strong></span>
              ${order.vippsReference ? `<br/><span style="color:#555;font-size:11px;">Viite: ${escapeHtml(order.vippsReference)}</span>` : ""}
            </td>
          </tr>
        </table>

        <!-- Ostaja -->
        <div style="background:#f9f9f9;padding:12px;border-radius:4px;margin-bottom:20px;font-size:13px;line-height:1.6;">
          <strong>Ostaja</strong><br/>
          ${escapeHtml(order.customerName)}<br/>
          ${escapeHtml(order.customerPhone)}<br/>
          ${escapeHtml(order.customerEmail)}
          ${showCustomerAddress && order.customerAddress
            ? `<br/>${escapeHtml(order.customerAddress)}`
            : ""}
        </div>

        <!-- Palvelun erittely -->
        <h3 style="font-size:14px;border-bottom:2px solid #e0e0e0;padding-bottom:6px;margin-bottom:0;">
          Palvelun erittely
        </h3>
        <table style="width:100%;border-collapse:collapse;margin:0 0 16px;">
          <thead>
            <tr>
              <th style="background:#f5f5f5;padding:6px 8px;text-align:left;border:1px solid #e0e0e0;font-size:12px;">Kuvaus</th>
              <th style="background:#f5f5f5;padding:6px 8px;text-align:right;border:1px solid #e0e0e0;font-size:12px;">Veroton</th>
              <th style="background:#f5f5f5;padding:6px 8px;text-align:right;border:1px solid #e0e0e0;font-size:12px;">ALV %</th>
              <th style="background:#f5f5f5;padding:6px 8px;text-align:right;border:1px solid #e0e0e0;font-size:12px;font-weight:bold;">Yht.</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding:8px;border:1px solid #e0e0e0;font-size:13px;word-break:break-word;max-width:200px;">
                ${escapeHtml(order.serviceDescription)}<br/>
                <span style="font-size:11px;color:#666;">
                  ${escapeHtml(order.pickupAddress)} → ${escapeHtml(order.deliveryAddress)}
                </span>
              </td>
              <td style="padding:8px;border:1px solid #e0e0e0;font-size:13px;text-align:right;white-space:nowrap;">
                ${asEuro(order.netAmount)}
              </td>
              <td style="padding:8px;border:1px solid #e0e0e0;font-size:13px;text-align:right;white-space:nowrap;">
                ${formatVatRate(order.vatRate)} %
              </td>
              <td style="padding:8px;border:1px solid #e0e0e0;font-size:13px;text-align:right;font-weight:bold;white-space:nowrap;">
                ${asEuro(order.totalWithVat)}
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Yhteenveto -->
        <table style="width:100%;border-collapse:collapse;margin-top:4px;">
          <tr>
            <td style="padding:4px 8px;font-size:13px;color:#555;">Veroton hinta:</td>
            <td style="padding:4px 8px;text-align:right;font-size:13px;">${asEuro(order.netAmount)}</td>
          </tr>
          <tr>
            <td style="padding:4px 8px;font-size:13px;color:#555;">ALV ${formatVatRate(order.vatRate)} %:</td>
            <td style="padding:4px 8px;text-align:right;font-size:13px;">${asEuro(order.vatAmount)}</td>
          </tr>
          <tr style="border-top:2px solid #1a1a2e;">
            <td style="padding:10px 8px;font-weight:bold;font-size:14px;">Maksettu yhteensä:</td>
            <td style="padding:10px 8px;text-align:right;font-weight:bold;font-size:16px;">${asEuro(order.totalWithVat)}</td>
          </tr>
        </table>

        <p style="margin-top:20px;font-size:13px;color:#555;">
          Maksu vastaanotettu: ${
            order.paymentMethod === "mobilepay"
              ? "MobilePay / Vipps"
              : "Lasku (14 vrk maksuaika)"
          }
        </p>

        <p style="font-size:12px;color:#888;margin-top:12px;">
          Säilytä tämä kuitti kirjanpitoa varten.
        </p>
      </div>

      <div style="background:#f5f5f5;padding:16px;text-align:center;font-size:12px;color:#888;">
        Pakuvie | Y-tunnus: 3163260-9 |
        <a href="https://pakuvie.fi">pakuvie.fi</a> |
        kuljetus@pakuvie.fi | 050 354 7763
      </div>
    </div>
  `;
}
