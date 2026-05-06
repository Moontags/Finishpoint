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
}));

import { POST as handler } from '../../app/api/vipps/webhook/route';
import { Request as NodeRequest, Headers as NodeHeaders } from 'undici';

beforeAll(() => {
  process.env.SMTP_HOST = 'smtp.test.com';
  process.env.SMTP_USER = 'test@test.com';
  process.env.SMTP_PASS = 'testpass';
  process.env.SMTP_FROM = 'test@test.com';
  process.env.SMTP_PORT = '587';
});
afterAll(() => {
  delete process.env.SMTP_HOST;
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASS;
  delete process.env.SMTP_FROM;
  delete process.env.SMTP_PORT;
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
    const req = new NodeRequest('http://localhost/api/vipps/webhook', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: new NodeHeaders({ 'Content-Type': 'application/json' }),
    });
    const res = await handler(req);
    expect(res.status).toBe(200);
    expect(mockMarkOrderAsPaid).toHaveBeenCalled();
    expect(mockSendMail).toHaveBeenCalled();
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
    const req = new NodeRequest('http://localhost/api/vipps/webhook', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: new NodeHeaders({ 'Content-Type': 'application/json' }),
    });
    const res = await handler(req);
    expect(res.status).toBe(200);
    expect(mockMarkOrderAsPaid).not.toHaveBeenCalled();
  });
});
