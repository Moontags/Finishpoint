import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  sendEmail: vi.fn(),
  saveOrder: vi.fn(),
}));

vi.mock("@/lib/email", () => ({
  sendEmail: mocks.sendEmail,
}));

vi.mock("@/lib/order-store", () => ({
  saveOrder: mocks.saveOrder,
}));

import { POST } from "./route";

describe("POST /api/order/confirm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.sendEmail.mockResolvedValue(undefined);
    mocks.saveOrder.mockResolvedValue(undefined);
  });

  it("lahettaa tilausvahvistuksen ja palauttaa orderId:n", async () => {
    const request = new Request("http://localhost/api/order/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: "Matti Meikalainen",
        customerEmail: "matti@example.com",
        customerPhone: "0401234567",
        customerAddress: "Katu 1, 00100 Helsinki",
        serviceDescription: "Pesukoneen kuljetus, Helsinki -> Espoo",
        pickupAddress: "Helsinki",
        deliveryAddress: "Espoo",
        totalWithVat: 89,
        paymentMethod: "mobilepay",
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(typeof body.orderId).toBe("string");
    expect(mocks.saveOrder).toHaveBeenCalledTimes(1);
    expect(mocks.sendEmail).toHaveBeenCalledTimes(1);
  });

  it("vaatii customerAddress-kentan yli 400 EUR laskuille", async () => {
    const request = new Request("http://localhost/api/order/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: "Matti Meikalainen",
        customerEmail: "matti@example.com",
        customerPhone: "0401234567",
        serviceDescription: "Muutto",
        pickupAddress: "Helsinki",
        deliveryAddress: "Espoo",
        totalWithVat: 450,
        paymentMethod: "invoice",
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(mocks.sendEmail).not.toHaveBeenCalled();
    expect(mocks.saveOrder).not.toHaveBeenCalled();
  });
});
