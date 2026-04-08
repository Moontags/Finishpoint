/**
 * @jest-environment node
 */
import { POST as handler } from '../../app/api/order/route';
import { Request as NodeRequest, Headers as NodeHeaders } from 'undici';

const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'mock-id' });
jest.mock('nodemailer', () => ({
  createTransport: () => ({ sendMail: mockSendMail })
}));
jest.mock('@/lib/supabase-admin', () => ({
  getSupabaseAdminClient: () => ({
    from: () => ({
      select: () => ({ gte: () => ({ lte: () => ({ eq: () => ({ order: () => ({ data: [], error: null }) }) }) }) }),
      insert: () => ({ select: () => ({ single: () => ({ data: { id: 'mock-id' }, error: null }) }) }),
      update: () => ({ eq: () => ({ data: null, error: null }) }),
    })
  })
}));
jest.mock('@/lib/order-store', () => ({
  saveOrder: jest.fn().mockResolvedValue({ id: 'mock-order-id' }),
  getOrderByReference: jest.fn().mockResolvedValue({
    orderId: 'FP-TEST-001',
    customerEmail: 'test@test.com',
    customerName: 'Test User',
    serviceDescription: 'Kappaletavara',
    totalWithVat: 89,
    netAmount: 70.92,
    vatRate: 0.255,
    vatAmount: 18.08,
    paymentMethod: 'mobilepay',
  }),
  markOrderAsPaid: jest.fn().mockResolvedValue(undefined),
}));

beforeAll(() => {
  process.env.SMTP_HOST = 'smtp.test.com';
  process.env.NEXT_PUBLIC_MOBILEPAY_PAYMENT_LINK = 'https://pay.test.fi/mock';
  process.env.SMTP_USER = 'test@test.com';
  process.env.SMTP_PASS = 'testpass';
  process.env.SMTP_FROM = 'test@test.com';
  process.env.SMTP_PORT = '587';
});
afterAll(() => {
  delete process.env.SMTP_HOST;
  delete process.env.NEXT_PUBLIC_MOBILEPAY_PAYMENT_LINK;
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASS;
  delete process.env.SMTP_FROM;
  delete process.env.SMTP_PORT;
});

describe('/api/order', () => {
  it('returns 400 if price is missing', async () => {
    const req = new NodeRequest('http://localhost/api/order', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', name: 'Test', phone: '123', pickupAddress: 'A', deliveryAddress: 'B' }),
      headers: new NodeHeaders({ 'Content-Type': 'application/json' }),
    });
    const res = await handler(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 if email is invalid', async () => {
    const req = new NodeRequest('http://localhost/api/order', {
      method: 'POST',
      body: JSON.stringify({ email: 'invalid', name: 'Test', phone: '123', pickupAddress: 'A', deliveryAddress: 'B', estimatedPriceVat0: 100 }),
      headers: new NodeHeaders({ 'Content-Type': 'application/json' }),
    });
    const res = await handler(req);
    expect(res.status).toBe(400);
  });

  it('returns 200 with paymentUrl on valid payload', async () => {
    const req = new NodeRequest('http://localhost/api/order', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', name: 'Test User', phone: '0401234567', serviceType: 'Kappaletavara', addresses: 'Nouto: Katu 1 -> Toimitus: Katu 2', pickupAddress: 'Katu 1', deliveryAddress: 'Katu 2', message: '', estimatedPriceVat0: 89, estimatedPriceVatIncl: 112 }),
      headers: new NodeHeaders({ 'Content-Type': 'application/json' }),
    });
    const res = await handler(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.paymentUrl).toBeDefined();
    const orderStore = require('@/lib/order-store');
    expect(orderStore.saveOrder).toHaveBeenCalled();
  });
});
