// Yhteinen sähköpostiosoitteen validointi. Käytetään sekä client- että
// server-puolella, jotta virheellinen osoite (esim. välilyönti domainissa:
// "janne.etelaaho@mailroom solutions") estetään ennen tallennusta ja lähetystä.
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: string): string {
  return value.trim();
}

export function isValidEmail(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }
  return EMAIL_REGEX.test(value.trim());
}

// Asiakkaalle näytettävä virheilmoitus virheellisestä sähköpostiosoitteesta.
export const INVALID_EMAIL_MESSAGE = "Tarkista sähköpostiosoitteesi";
