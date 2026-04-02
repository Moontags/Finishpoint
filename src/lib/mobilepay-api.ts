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

function getVippsSubscriptionKey() {
  return (
    getEnv("VIPPS_SUBSCRIPTION_KEY_PRIMARY") ||
    getEnv("VIPPS_SUBSCRIPTION_KEY") ||
    getEnv("VIPPS_SUBSCRIPTION_KEY_SECONDARY")
  );
}

function hasVippsApiCredentials() {
  return Boolean(
    getEnv("VIPPS_CLIENT_ID") &&
    getEnv("VIPPS_CLIENT_SECRET") &&
    getVippsSubscriptionKey() &&
    getEnv("VIPPS_MERCHANT_SERIAL_NUMBER"),
  );
}

export function hasMobilePayApiCredentials() {
  return Boolean(
    (getEnv("MOBILEPAY_CLIENT_ID") && getEnv("MOBILEPAY_CLIENT_SECRET") && getSubscriptionKey()) ||
      hasVippsApiCredentials(),
  );
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

function normalizeVippsPhoneNumber(rawPhone: string, defaultCountryCode: string) {
  const countryCode = defaultCountryCode.replace(/\D/g, "") || "358";
  const compact = rawPhone.trim().replace(/[\s()-]/g, "");

  let normalized = compact;
  if (normalized.startsWith("+")) {
    normalized = normalized.slice(1);
  }
  if (normalized.startsWith("00")) {
    normalized = normalized.slice(2);
  }

  normalized = normalized.replace(/\D/g, "");

  if (!normalized) {
    return "";
  }

  if (normalized.startsWith("0")) {
    normalized = `${countryCode}${normalized.slice(1)}`;
  }

  return normalized;
}

function isValidVippsPhoneNumber(phoneNumber: string) {
  return /^\d{8,15}$/.test(phoneNumber);
}

type TokenAttemptResult = {
  ok: boolean;
  status: number;
  body: unknown;
};

type TokenAuthMethod = "auto" | "client_secret_basic" | "client_secret_post";

function getTokenAuthMethod(): TokenAuthMethod {
  const raw = getEnv("MOBILEPAY_TOKEN_AUTH_METHOD").toLowerCase();
  if (raw === "client_secret_basic") {
    return "client_secret_basic";
  }
  if (raw === "client_secret_post") {
    return "client_secret_post";
  }
  return "auto";
}

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

type VippsTokenAttemptResult = {
  ok: boolean;
  status: number;
  body: unknown;
};

async function requestVippsToken(
  tokenUrl: string,
  headers: Record<string, string>,
): Promise<VippsTokenAttemptResult> {
  const postResponse = await fetch(tokenUrl, {
    method: "POST",
    headers,
  });

  const postBody = await postResponse.json().catch(() => ({}));
  if (postResponse.ok) {
    return {
      ok: true,
      status: postResponse.status,
      body: postBody,
    };
  }

  const getResponse = await fetch(tokenUrl, {
    method: "GET",
    headers,
  });

  const getBody = await getResponse.json().catch(() => ({}));
  return {
    ok: getResponse.ok,
    status: getResponse.status,
    body: getBody,
  };
}

async function createVippsPayment(input: MobilePayPaymentInput) {
  const clientId = getEnv("VIPPS_CLIENT_ID");
  const clientSecret = getEnv("VIPPS_CLIENT_SECRET");
  const subscriptionKey = getVippsSubscriptionKey();
  const merchantSerialNumber = getEnv("VIPPS_MERCHANT_SERIAL_NUMBER");

  if (!clientId || !clientSecret || !subscriptionKey || !merchantSerialNumber) {
    throw new MobilePayApiError("VIPPS_CREDENTIALS_MISSING");
  }

  const tokenUrl = getEnv("VIPPS_TOKEN_URL") || "https://api.vipps.no/accesstoken/get";
  const paymentsUrl = getEnv("VIPPS_PAYMENTS_URL") || "https://api.vipps.no/epayment/v1/payments";
  const returnUrl = input.returnUrl || getEnv("VIPPS_RETURN_URL") || getEnv("NEXT_PUBLIC_SITE_URL");
  const currency = getEnv("VIPPS_CURRENCY") || "EUR";
  const defaultCountryCode = getEnv("VIPPS_DEFAULT_COUNTRY_CODE") || "358";
  const normalizedPhone = normalizeVippsPhoneNumber(input.customerPhone, defaultCountryCode);

  if (!returnUrl) {
    throw new MobilePayApiError("VIPPS_URLS_MISSING", 500, { returnUrl: false });
  }

  if (!isValidVippsPhoneNumber(normalizedPhone)) {
    throw new MobilePayApiError("VIPPS_PHONE_INVALID", 400, {
      phoneOriginal: input.customerPhone,
      phoneNormalized: normalizedPhone,
      expectedFormat: "358501234567",
    });
  }

  const tokenAttempt = await requestVippsToken(tokenUrl, {
    "Content-Type": "application/json",
    Accept: "application/json",
    client_id: clientId,
    client_secret: clientSecret,
    "Ocp-Apim-Subscription-Key": subscriptionKey,
    "Merchant-Serial-Number": merchantSerialNumber,
  });

  const tokenData = asRecord(tokenAttempt.body);
  if (!tokenAttempt.ok || !tokenData || typeof tokenData.access_token !== "string") {
    throw new MobilePayApiError("VIPPS_TOKEN_REQUEST_FAILED", tokenAttempt.status, tokenAttempt.body);
  }

  const paymentPayload: Record<string, unknown> = {
    amount: {
      currency,
      value: Math.round(input.amount * 100),
    },
    paymentMethod: {
      type: "WALLET",
    },
    customer: {
      phoneNumber: normalizedPhone,
    },
    reference: input.orderId,
    returnUrl,
    userFlow: "WEB_REDIRECT",
    paymentDescription: input.description,
  };

  const paymentResponse = await fetch(paymentsUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${tokenData.access_token}`,
      "Ocp-Apim-Subscription-Key": subscriptionKey,
      "Merchant-Serial-Number": merchantSerialNumber,
      "Idempotency-Key": input.orderId,
    },
    body: JSON.stringify(paymentPayload),
  });

  const paymentBody = await paymentResponse.json().catch(() => ({}));
  const paymentUrl = resolvePaymentUrl(paymentBody);
  if (!paymentResponse.ok || !paymentUrl) {
    if (getEnv("VIPPS_DEBUG") === "true") {
      const redactedSentPayload: Record<string, unknown> = {
        ...paymentPayload,
        customer: {
          ...(asRecord(paymentPayload.customer) ?? {}),
          phoneNumber: "***",
        },
      };

      console.error(
        "VIPPS DEBUG",
        JSON.stringify(
          {
            status: paymentResponse.status,
            body: paymentBody,
            sentPayload: redactedSentPayload,
          },
          null,
          2,
        ),
      );
    }

    throw new MobilePayApiError("VIPPS_PAYMENT_REQUEST_FAILED", paymentResponse.status, paymentBody);
  }

  return paymentUrl;
}

export async function createMobilePayPayment(input: MobilePayPaymentInput) {
  if (hasVippsApiCredentials()) {
    return createVippsPayment(input);
  }

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
  const tokenAuthMethod = getTokenAuthMethod();

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
    const basicBody = new URLSearchParams({ grant_type: "client_credentials" });
    if (candidateScope) {
      basicBody.set("scope", candidateScope);
    }

    const directBody = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    });

    if (candidateScope) {
      directBody.set("scope", candidateScope);
    }

    const attempts: Array<{ headers: Record<string, string>; body: URLSearchParams }> = [];

    if (tokenAuthMethod === "client_secret_basic") {
      attempts.push({
        headers: {
          ...baseHeaders,
          Authorization: `Basic ${basicAuth}`,
          "Ocp-Apim-Subscription-Key": subscriptionKey,
        },
        body: basicBody,
      });
      attempts.push({
        headers: {
          ...baseHeaders,
          Authorization: `Basic ${basicAuth}`,
        },
        body: basicBody,
      });
    } else if (tokenAuthMethod === "client_secret_post") {
      attempts.push({
        headers: {
          ...baseHeaders,
          "Ocp-Apim-Subscription-Key": subscriptionKey,
        },
        body: directBody,
      });
    } else {
      attempts.push({
        headers: {
          ...baseHeaders,
          Authorization: `Basic ${basicAuth}`,
          "Ocp-Apim-Subscription-Key": subscriptionKey,
        },
        body: basicBody,
      });
      attempts.push({
        headers: {
          ...baseHeaders,
          "Ocp-Apim-Subscription-Key": subscriptionKey,
        },
        body: directBody,
      });
      attempts.push({
        headers: {
          ...baseHeaders,
          Authorization: `Basic ${basicAuth}`,
        },
        body: basicBody,
      });
    }

    for (const attempt of attempts) {
      tokenAttempt = await requestTokenWithAttempt(tokenUrl, attempt.headers, attempt.body);
      if (tokenAttempt.ok) {
        break;
      }
    }

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
