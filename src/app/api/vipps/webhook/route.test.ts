import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  sendEmail: vi.fn(),
  getOrderByReference: vi.fn(),
}));

vi.mock("@/lib/email", () => ({
  sendEmail: mocks.sendEmail,
}));

vi.mock("@/lib/order-store", () => ({
  getOrderByReference: mocks.getOrderByReference,
}));

import { POST } from "./route";

describe("POST /api/vipps/webhook", () => {
  beforeEach(() => {
    delete process.env.VIPPS_WEBHOOK_AUTH_TOKEN;
    vi.clearAllMocks();
    mocks.getOrderByReference.mockResolvedValue(null);
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

  it("lahettaa kuitin captured-eventista kun tilaus loytyy", async () => {
    mocks.getOrderByReference.mockResolvedValue({
      orderId: "FP-2026-0042",
      orderDate: "2026-04-02T14:30:00Z",
      customerName: "Matti Meikalainen",
      customerEmail: "matti@example.com",
      customerPhone: "0401234567",
      serviceDescription: "Pesukoneen kuljetus, Helsinki -> Espoo",
      pickupAddress: "Helsinki",
      deliveryAddress: "Espoo",
      totalWithVat: 89,
      vatRate: 25.5,
      vatAmount: 18.08,
      netAmount: 70.92,
      paymentMethod: "mobilepay",
    });

    const request = new Request("http://localhost/api/vipps/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "epayments.payment.captured.v1",
        reference: "FP-2026-0042",
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true });
    expect(mocks.getOrderByReference).toHaveBeenCalledWith("FP-2026-0042");
    expect(mocks.sendEmail).toHaveBeenCalledTimes(1);
    expect(mocks.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "matti@example.com",
        subject: expect.stringContaining("Kuitti FP-2026-0042"),
      }),
    );
  });
});
