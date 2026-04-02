type MobilePayPaymentInput = {
  orderId: string;
  amount: number;
  description: string;
  customerEmail: string;
  customerPhone: string;
  returnUrl?: string;
  cancelUrl?: string;
};

export class MobilePayApiError extends Error {
  constructor(
    public code: string,
    public status?: number,
    public details?: unknown,
  ) {
    super(code);
    this.name = "MobilePayApiError";
  }
}

function getEnv(name: string) {
  return process.env[name]?.trim() ?? "";
}

function getSubscriptionKey() {
  return (
    getEnv("MOBILEPAY_SUBSCRIPTION_KEY_PRIMARY") ||
    getEnv("MOBILEPAY_SUBSCRIPTION_KEY") ||
    getEnv("MOBILEPAY_SUBSCRIPTION_KEY_SECONDARY") ||
    getEnv("OCP_APIM_SUBSCRIPTION_KEY") ||
    getEnv("MOBILEPAY_OCP_APIM_SUBSCRIPTION_KEY")
  );
}

export function hasMobilePayApiCredentials() {
  return Boolean(getEnv("MOBILEPAY_CLIENT_ID") && getEnv("MOBILEPAY_CLIENT_SECRET") && getSubscriptionKey());
}

function resolvePaymentUrl(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const obj = payload as Record<string, unknown>;
  const directCandidates = [
    obj.paymentUrl,
    obj.redirectUrl,
    obj.url,
    obj.href,
  ];

  for (const candidate of directCandidates) {
    if (typeof candidate === "string" && candidate.startsWith("http")) {
      return candidate;
    }
  }

  const links = obj.links;
  if (links && typeof links === "object") {
    const linkObj = links as Record<string, unknown>;
    const nestedCandidates = [
      linkObj.payment,
      linkObj.redirect,
      linkObj.mobilepay,
      linkObj.checkout,
      linkObj.href,
    ];

    for (const candidate of nestedCandidates) {
      if (typeof candidate === "string" && candidate.startsWith("http")) {
        return candidate;
      }
    }

    if (Array.isArray(links)) {
      for (const link of links) {
        if (!link || typeof link !== "object") {
          continue;
        }
        const linkItem = link as Record<string, unknown>;
        const rel = typeof linkItem.rel === "string" ? linkItem.rel.toLowerCase() : "";
        const href = typeof linkItem.href === "string" ? linkItem.href : "";
        if (href && (rel.includes("redirect") || rel.includes("payment") || rel.includes("mobilepay"))) {
          return href;
        }
      }
    }
  }

  const data = obj.data;
  if (data && typeof data === "object") {
    return resolvePaymentUrl(data);
  }

  return null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  return value as Record<string, unknown>;
}

type TokenAttemptResult = {
  ok: boolean;
  status: number;
  body: unknown;
};

async function requestTokenWithAttempt(
  tokenUrl: string,
  headers: Record<string, string>,
  body: URLSearchParams,
): Promise<TokenAttemptResult> {
  const response = await fetch(tokenUrl, {
    method: "POST",
    headers,
    body: body.toString(),
  });

  const json = await response.json().catch(() => ({}));

  return {
    ok: response.ok,
    status: response.status,
    body: json,
  };
}

export async function createMobilePayPayment(input: MobilePayPaymentInput) {
  const clientId = getEnv("MOBILEPAY_CLIENT_ID");
  const clientSecret = getEnv("MOBILEPAY_CLIENT_SECRET");
  const subscriptionKey = getSubscriptionKey();

  if (!clientId || !clientSecret || !subscriptionKey) {
    throw new MobilePayApiError("MOBILEPAY_CREDENTIALS_MISSING");
  }

  const tokenUrl =
    getEnv("MOBILEPAY_TOKEN_URL") ||
    "https://api.mobilepay.dk/merchant-authentication-openidconnect/connect/token";

  const paymentsUrl =
    getEnv("MOBILEPAY_PAYMENTS_URL") ||
    "https://api.mobilepay.dk/merchant/v1/payments";

  const scope = getEnv("MOBILEPAY_SCOPE");
  const scopeCandidates = scope ? [scope] : ["payments", "openid payments", ""];

  const baseHeaders = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
  };

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  let tokenAttempt: TokenAttemptResult = {
    ok: false,
    status: 0,
    body: {},
  };

  for (const candidateScope of scopeCandidates) {
    const directBody = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    });

    if (candidateScope) {
      directBody.set("scope", candidateScope);
    }

    tokenAttempt = await requestTokenWithAttempt(
      tokenUrl,
      {
        ...baseHeaders,
        "Ocp-Apim-Subscription-Key": subscriptionKey,
      },
      directBody,
    );

    if (tokenAttempt.ok) {
      break;
    }

    const basicBody = new URLSearchParams({ grant_type: "client_credentials" });
    if (candidateScope) {
      basicBody.set("scope", candidateScope);
    }

    tokenAttempt = await requestTokenWithAttempt(
      tokenUrl,
      {
        ...baseHeaders,
        Authorization: `Basic ${basicAuth}`,
        "Ocp-Apim-Subscription-Key": subscriptionKey,
      },
      basicBody,
    );

    if (tokenAttempt.ok) {
      break;
    }

    tokenAttempt = await requestTokenWithAttempt(
      tokenUrl,
      {
        ...baseHeaders,
        Authorization: `Basic ${basicAuth}`,
      },
      basicBody,
    );

    if (tokenAttempt.ok) {
      break;
    }
  }

  const tokenData = asRecord(tokenAttempt.body);

  if (!tokenAttempt.ok || !tokenData || typeof tokenData.access_token !== "string") {
    throw new MobilePayApiError("MOBILEPAY_TOKEN_REQUEST_FAILED", tokenAttempt.status, tokenAttempt.body);
  }

  const returnUrl = input.returnUrl || getEnv("MOBILEPAY_RETURN_URL") || getEnv("NEXT_PUBLIC_SITE_URL");
  const cancelUrl = input.cancelUrl || getEnv("MOBILEPAY_CANCEL_URL") || returnUrl;
  const webhookUrl = getEnv("MOBILEPAY_WEBHOOK_URL");
  const currency = getEnv("MOBILEPAY_CURRENCY") || "EUR";

  const paymentPayload: Record<string, unknown> = {
    orderId: input.orderId,
    merchantReference: input.orderId,
    amount: {
      value: Math.round(input.amount * 100),
      currencyCode: currency,
    },
    customer: {
      email: input.customerEmail,
      phoneNumber: input.customerPhone,
    },
    description: input.description,
  };

  if (returnUrl) {
    paymentPayload.returnUrl = returnUrl;
  }

  if (cancelUrl) {
    paymentPayload.cancelUrl = cancelUrl;
  }

  if (webhookUrl) {
    paymentPayload.webhookUrl = webhookUrl;
  }

  const paymentResponse = await fetch(paymentsUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenData.access_token}`,
      "Ocp-Apim-Subscription-Key": subscriptionKey,
      "Idempotency-Key": input.orderId,
    },
    body: JSON.stringify(paymentPayload),
  });

  const paymentBody = await paymentResponse.json().catch(() => ({}));
  const paymentUrl = resolvePaymentUrl(paymentBody);

  if (!paymentResponse.ok || !paymentUrl) {
    throw new MobilePayApiError("MOBILEPAY_PAYMENT_REQUEST_FAILED", paymentResponse.status, paymentBody);
  }

  return paymentUrl;
}
