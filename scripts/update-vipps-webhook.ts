import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const OLD_WEBHOOK_ID = "e8a55e13-3fa9-43e1-88ab-01bc89e213a2";
const NEW_WEBHOOK_URL = "https://www.pakuvie.fi/api/vipps/webhook";
const EVENTS = ["epayments.payment.authorized.v1", "epayments.payment.captured.v1"];
const WEBHOOKS_BASE = "https://api.vipps.no/webhooks/v1/webhooks";

function getEnv(name: string): string {
  const val = process.env[name]?.trim();
  if (!val) throw new Error(`Puuttuva ympäristömuuttuja: ${name}`);
  return val;
}

async function getAccessToken(): Promise<string> {
  const clientId = getEnv("VIPPS_CLIENT_ID");
  const clientSecret = getEnv("VIPPS_CLIENT_SECRET");
  const subscriptionKey =
    process.env["VIPPS_SUBSCRIPTION_KEY_PRIMARY"]?.trim() ||
    process.env["VIPPS_SUBSCRIPTION_KEY"]?.trim() ||
    "";
  const merchantSerialNumber = getEnv("VIPPS_MERCHANT_SERIAL_NUMBER");
  const tokenUrl = getEnv("VIPPS_TOKEN_URL");

  if (!subscriptionKey) throw new Error("Puuttuva ympäristömuuttuja: VIPPS_SUBSCRIPTION_KEY_PRIMARY");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    client_id: clientId,
    client_secret: clientSecret,
    "Ocp-Apim-Subscription-Key": subscriptionKey,
    "Merchant-Serial-Number": merchantSerialNumber,
  };

  let res = await fetch(tokenUrl, { method: "POST", headers });
  if (!res.ok) {
    res = await fetch(tokenUrl, { method: "GET", headers });
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Token-pyyntö epäonnistui (${res.status}): ${body}`);
  }

  const data = await res.json() as Record<string, unknown>;
  if (typeof data.access_token !== "string") {
    throw new Error(`Access token puuttuu vastauksesta: ${JSON.stringify(data)}`);
  }

  console.log("Access token haettu.");
  return data.access_token;
}

async function deleteWebhook(token: string, webhookId: string): Promise<void> {
  const subscriptionKey =
    process.env["VIPPS_SUBSCRIPTION_KEY_PRIMARY"]?.trim() ||
    process.env["VIPPS_SUBSCRIPTION_KEY"]?.trim() ||
    "";
  const merchantSerialNumber = getEnv("VIPPS_MERCHANT_SERIAL_NUMBER");

  const res = await fetch(`${WEBHOOKS_BASE}/${webhookId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Ocp-Apim-Subscription-Key": subscriptionKey,
      "Merchant-Serial-Number": merchantSerialNumber,
    },
  });

  if (!res.ok && res.status !== 404) {
    const body = await res.text();
    throw new Error(`Webhookin poisto epäonnistui (${res.status}): ${body}`);
  }

  if (res.status === 404) {
    console.log(`Webhook ${webhookId} ei löytynyt (jo poistettu?).`);
  } else {
    console.log(`Webhook ${webhookId} poistettu.`);
  }
}

async function createWebhook(token: string): Promise<void> {
  const subscriptionKey =
    process.env["VIPPS_SUBSCRIPTION_KEY_PRIMARY"]?.trim() ||
    process.env["VIPPS_SUBSCRIPTION_KEY"]?.trim() ||
    "";
  const merchantSerialNumber = getEnv("VIPPS_MERCHANT_SERIAL_NUMBER");

  const res = await fetch(WEBHOOKS_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "Ocp-Apim-Subscription-Key": subscriptionKey,
      "Merchant-Serial-Number": merchantSerialNumber,
    },
    body: JSON.stringify({ url: NEW_WEBHOOK_URL, events: EVENTS }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(`Webhookin luonti epäonnistui (${res.status}): ${JSON.stringify(data)}`);
  }

  console.log("Uusi webhook luotu:", JSON.stringify(data, null, 2));
}

async function main() {
  const token = await getAccessToken();
  await deleteWebhook(token, OLD_WEBHOOK_ID);
  await createWebhook(token);
  console.log("Valmis.");
}

main().catch((err) => {
  console.error("Virhe:", err instanceof Error ? err.message : err);
  process.exit(1);
});
