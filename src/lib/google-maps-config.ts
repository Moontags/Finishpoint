const MISSING_GOOGLE_MAPS_KEY_LOG = "GOOGLE_MAPS_API_KEY is not configured on the server.";

export const distanceLookupUnavailableMessage =
  "Reittihaku ei ole juuri nyt kaytettavissa. Voit arvioida hinnan saataamalla kilometrit kasin tai lahettaa tarjouspyynnon.";

export function getGoogleMapsApiKey(): string | null {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY?.trim();

  if (!apiKey) {
    console.error(MISSING_GOOGLE_MAPS_KEY_LOG);
    return null;
  }

  return apiKey;
}