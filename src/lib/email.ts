import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Yrityksen oma vastaanotto-osoite (Jari). Kaikki ilmoitusviestit menevät
// tähän, ja asiakkaalle menevissä viesteissä tämä on Reply-To -osoite.
export function getOperatorRecipient() {
  return (
    process.env.QUOTE_RECIPIENT?.trim() ||
    process.env.SMTP_RECIPIENT?.trim() ||
    "kuljetus@pakuvie.fi"
  );
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    ...options,
  });
}
