import { vi } from 'vitest';

const mockSendMail = vi.hoisted(() => vi.fn().mockResolvedValue({ messageId: 'mock-id' }));
const mockMarkOrderAsPaid = vi.hoisted(() => vi.fn());
const mockGetOrderByReference = vi.hoisted(() => vi.fn());

vi.mock('nodemailer', () => ({
  default: {
    createTransport: () => ({ sendMail: (...args: unknown[]) => mockSendMail(...args) }),
  },
  createTransport: () => ({ sendMail: (...args: unknown[]) => mockSendMail(...args) }),
}));
vi.mock('@/lib/order-store', () => ({
  markOrderAsPaid: (...args: unknown[]) => mockMarkOrderAsPaid(...args),
  getOrderByReference: (...args: unknown[]) => mockGetOrderByReference(...args),
  saveOrder: vi.fn(),
  markOrderEmailStatus: vi.fn(),
}));
vi.mock('@/lib/bookings', () => ({
  updateBookingStatus: vi.fn(),
  markBookingEmailStatus: vi.fn(),
}));

import { POST as handler } from '../../app/api/vipps/webhook/route';
import { Request as NodeRequest, Headers as NodeHeaders } from 'undici';
import { createHash, createHmac } from 'node:crypto';

const WEBHOOK_SECRET = 'test-webhook-secret';
const WEBHOOK_URL = 'http://localhost/api/vipps/webhook';

// Rakentaa Vippsin allekirjoittaman webhook-kutsun:
// authorization: HMAC-SHA256 SignedHeaders=x-ms-date;host;x-ms-content-sha256&Signature=<base64>
function signedRequest(body: string, secret = WEBHOOK_SECRET) {
  const url = new URL(WEBHOOK_URL);
  const date = 'Mon, 01 Jan 2026 00:00:00 GMT';
  const contentHash = createHash('sha256').update(body, 'utf8').digest('base64');
  const stringToSign = `POST\n${url.pathname}${url.search}\n${date};${url.host};${contentHash}`;
  const signature = createHmac('sha256', secret).update(stringToSign, 'utf8').digest('base64');

  return new NodeRequest(WEBHOOK_URL, {
    method: 'POST',
    body,
    headers: new NodeHeaders({
      'Content-Type': 'application/json',
      host: url.host,
      'x-ms-date': date,
      'x-ms-content-sha256': contentHash,
      authorization: `HMAC-SHA256 SignedHeaders=x-ms-date;host;x-ms-content-sha256&Signature=${signature}`,
    }),
  });
}

beforeAll(() => {
  process.env.SMTP_HOST = 'smtp.test.com';
  process.env.SMTP_USER = 'test@test.com';
  process.env.SMTP_PASS = 'testpass';
  process.env.SMTP_FROM = 'test@test.com';
  process.env.SMTP_PORT = '587';
  process.env.VIPPS_WEBHOOK_SECRET = WEBHOOK_SECRET;
});
afterAll(() => {
  delete process.env.SMTP_HOST;
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASS;
  delete process.env.SMTP_FROM;
  delete process.env.SMTP_PORT;
  delete process.env.VIPPS_WEBHOOK_SECRET;
});

describe('/api/vipps/webhook', () => {
  beforeEach(() => {
    mockGetOrderByReference.mockResolvedValue({
      orderId: 'FP-TEST-001',
      orderDate: new Date().toISOString(),
      customerName: 'Test User',
      customerEmail: 'test@test.com',
      customerPhone: '0401234567',
      customerAddress: 'Testikatu 1, Helsinki',
      serviceDescription: 'Kappaletavara',
      pickupAddress: 'Testikatu 1, Helsinki',
      deliveryAddress: 'Kohdekatu 2, Espoo',
      totalWithVat: 89,
      netAmount: 70.92,
      vatRate: 24,
      vatAmount: 18.08,
      paymentMethod: 'mobilepay',
      vippsReference: 'FP-TEST-001',
      bookingSelection: null,
    });
    mockMarkOrderAsPaid.mockClear();
    mockSendMail.mockClear();
  });
  it('processes AUTHORIZED event', async () => {
    const payload = {
      reference: 'FP-TEST-001',
      name: 'AUTHORIZED',
      msn: '123',
      amount: { currency: 'EUR', value: 100 },
      timestamp: '2026-01-01T00:00:00Z',
      success: true
    };
    const res = await handler(signedRequest(JSON.stringify(payload)));
    expect(res.status).toBe(200);
    expect(mockMarkOrderAsPaid).toHaveBeenCalled();
    // Kuitti asiakkaalle + ilmoitus operaattorille
    expect(mockSendMail).toHaveBeenCalledTimes(2);
  });
  it('ignores unknown event', async () => {
    const payload = {
      reference: 'FP-TEST-001',
      name: 'UNKNOWN_EVENT',
      msn: '123',
      amount: { currency: 'EUR', value: 100 },
      timestamp: '2026-01-01T00:00:00Z',
      success: true
    };
    const res = await handler(signedRequest(JSON.stringify(payload)));
    expect(res.status).toBe(200);
    expect(mockMarkOrderAsPaid).not.toHaveBeenCalled();
  });

  it('rejects a request without authentication headers', async () => {
    const payload = { reference: 'FP-TEST-001', name: 'AUTHORIZED' };
    const req = new NodeRequest('http://localhost/api/vipps/webhook', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: new NodeHeaders({ 'Content-Type': 'application/json' }),
    });
    const res = await handler(req);
    expect(res.status).toBe(401);
    expect(mockMarkOrderAsPaid).not.toHaveBeenCalled();
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it('rejects a request signed with the wrong secret', async () => {
    const payload = { reference: 'FP-TEST-001', name: 'AUTHORIZED' };
    const res = await handler(signedRequest(JSON.stringify(payload), 'wrong-secret'));
    expect(res.status).toBe(401);
    expect(mockMarkOrderAsPaid).not.toHaveBeenCalled();
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it('rejects a tampered body even with a valid signature header', async () => {
    const original = JSON.stringify({ reference: 'FP-TEST-001', name: 'AUTHORIZED' });
    const signed = signedRequest(original);
    const tampered = new NodeRequest('http://localhost/api/vipps/webhook', {
      method: 'POST',
      body: JSON.stringify({ reference: 'FP-TEST-999', name: 'AUTHORIZED' }),
      headers: signed.headers,
    });
    const res = await handler(tampered);
    expect(res.status).toBe(401);
    expect(mockMarkOrderAsPaid).not.toHaveBeenCalled();
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it('rejects everything when no authentication is configured', async () => {
    const secret = process.env.VIPPS_WEBHOOK_SECRET;
    delete process.env.VIPPS_WEBHOOK_SECRET;
    try {
      const payload = { reference: 'FP-TEST-001', name: 'AUTHORIZED' };
      const res = await handler(signedRequest(JSON.stringify(payload)));
      expect(res.status).toBe(401);
      expect(mockMarkOrderAsPaid).not.toHaveBeenCalled();
      expect(mockSendMail).not.toHaveBeenCalled();
    } finally {
      process.env.VIPPS_WEBHOOK_SECRET = secret;
    }
  });

  it('accepts a bearer token when VIPPS_WEBHOOK_AUTH_TOKEN is configured', async () => {
    process.env.VIPPS_WEBHOOK_AUTH_TOKEN = 'manual-test-token';
    try {
      const payload = { reference: 'FP-TEST-001', name: 'AUTHORIZED' };
      const req = new NodeRequest('http://localhost/api/vipps/webhook', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: new NodeHeaders({
          'Content-Type': 'application/json',
          authorization: 'Bearer manual-test-token',
        }),
      });
      const res = await handler(req);
      expect(res.status).toBe(200);
      expect(mockMarkOrderAsPaid).toHaveBeenCalled();
    } finally {
      delete process.env.VIPPS_WEBHOOK_AUTH_TOKEN;
    }
  });
});
