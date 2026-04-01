import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  return {
    sendMail: vi.fn(),
    createTransport: vi.fn(),
  };
});

vi.mock("nodemailer", () => ({
  default: {
    createTransport: mocks.createTransport,
  },
}));

import { POST } from "./route";

describe("POST /api/quote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createTransport.mockReturnValue({
      sendMail: mocks.sendMail,
    });

    process.env.SMTP_HOST = "posti.zoner.fi";
    process.env.SMTP_PORT = "465";
    process.env.SMTP_SECURE = "true";
    process.env.SMTP_USER = "kuljetus@finishpoint.fi";
    process.env.SMTP_PASS = "secret";
    process.env.SMTP_FROM = "kuljetus@finishpoint.fi";
    process.env.QUOTE_RECIPIENT = "kuljetus@finishpoint.fi";
  });

  it("lahettaa tarjouspyynnon sahkopostiin", async () => {
    const request = new Request("http://localhost/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Matti Meikalainen",
        phone: "0401234567",
        email: "matti@example.com",
        serviceType: "Moottoripyorakuljetus",
        addresses: "Nouto: Helsinki -> Toimitus: Turku",
        message: "Nopea toimitus",
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true });
    expect(mocks.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: "posti.zoner.fi",
        port: 465,
        secure: true,
      }),
    );
    expect(mocks.sendMail).toHaveBeenCalledTimes(1);
    expect(mocks.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "kuljetus@finishpoint.fi",
        subject: expect.stringContaining("Tarjouspyynto"),
      }),
    );
  });

  it("palauttaa virheen jos smtp-asetukset puuttuvat", async () => {
    delete process.env.SMTP_HOST;

    const request = new Request("http://localhost/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Matti Meikalainen",
        phone: "0401234567",
        email: "matti@example.com",
        serviceType: "Moottoripyorakuljetus",
        addresses: "Nouto: Helsinki -> Toimitus: Turku",
        message: "Nopea toimitus",
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.ok).toBe(false);
    expect(mocks.sendMail).not.toHaveBeenCalled();
  });
});
