import { NextResponse } from "next/server";

function getExpectedToken() {
  return process.env.VIPPS_WEBHOOK_AUTH_TOKEN?.trim() ?? "";
}

function hasValidAuthorizationHeader(request: Request, expectedToken: string) {
  if (!expectedToken) {
    return true;
  }

  const authHeader = request.headers.get("authorization") ?? "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    return false;
  }

  const providedToken = authHeader.slice(7).trim();
  return providedToken === expectedToken;
}

function getEventName(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return "unknown";
  }

  const data = payload as Record<string, unknown>;
  const candidates = [
    data.eventName,
    data.eventType,
    data.name,
    data.status,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate;
    }
  }

  return "unknown";
}

export async function POST(request: Request) {
  const expectedToken = getExpectedToken();
  if (!hasValidAuthorizationHeader(request, expectedToken)) {
    return NextResponse.json({ ok: false, error: "Unauthorized webhook request." }, { status: 401 });
  }

  const rawBody = await request.text();
  let payload: unknown = {};

  if (rawBody) {
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
    }
  }

  console.info("Vipps webhook received", {
    eventName: getEventName(payload),
    receivedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
