import { beforeEach, describe, expect, it } from "vitest";

import { POST } from "./route";

describe("POST /api/vipps/webhook", () => {
  beforeEach(() => {
    delete process.env.VIPPS_WEBHOOK_AUTH_TOKEN;
  });

  it("hyvaksyy webhookin ilman auth-tokenia", async () => {
    const request = new Request("http://localhost/api/vipps/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventName: "PAYMENT_AUTHORIZED" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true });
  });

  it("hylkaa webhookin jos token on vaara", async () => {
    process.env.VIPPS_WEBHOOK_AUTH_TOKEN = "expected-token";

    const request = new Request("http://localhost/api/vipps/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer wrong-token",
      },
      body: JSON.stringify({ eventName: "PAYMENT_AUTHORIZED" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.ok).toBe(false);
  });

  it("hyvaksyy webhookin oikealla bearer-tokenilla", async () => {
    process.env.VIPPS_WEBHOOK_AUTH_TOKEN = "expected-token";

    const request = new Request("http://localhost/api/vipps/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer expected-token",
      },
      body: JSON.stringify({ eventType: "PAYMENT_CAPTURE" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true });
  });
});
