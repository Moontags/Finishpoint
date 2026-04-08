/**
 * @jest-environment node
 */
import { TextDecoder, TextEncoder } from 'util';
if (!globalThis.TextDecoder) globalThis.TextDecoder = TextDecoder;
if (!globalThis.TextEncoder) globalThis.TextEncoder = TextEncoder;
import { Request as NodeRequest, Response as NodeResponse, Headers as NodeHeaders } from 'undici';

if (!globalThis.Request) {
  // @ts-ignore
  globalThis.Request = NodeRequest;
  // @ts-ignore
  globalThis.Response = NodeResponse;
  // @ts-ignore
  globalThis.Headers = NodeHeaders;
}

import { POST as handler } from '../../app/api/quote/route';

jest.mock('@/lib/supabase-admin', () => ({
  getSupabaseAdminClient: () => ({
    from: () => ({
      select: () => ({ gte: () => ({ lte: () => ({ eq: () => ({ order: () => ({ data: [], error: null }) }) }) }) }),
      insert: () => ({ select: () => ({ single: () => ({ data: { id: 'mock-id' }, error: null }) }) }),
      update: () => ({ eq: () => ({ data: null, error: null }) }),
    })
  })
}));

const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'mock-id' });
jest.mock('nodemailer', () => ({
  createTransport: () => ({
    sendMail: mockSendMail
  })
}));

describe('/api/quote', () => {
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


  it('returns 400 if email is invalid', async () => {
    const req = new Request('http://localhost/api/quote', {
      method: 'POST',
      body: JSON.stringify({ email: 'invalid', name: 'Test', phone: '123', pickupAddress: 'A', deliveryAddress: 'B' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await handler(req);
    expect(res.status).toBe(400);
  });

  it('returns 200 and sends email with valid payload', async () => {
    const req = new Request('http://localhost/api/quote', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', name: 'Test User', phone: '0401234567', serviceType: 'Kappaletavara', addresses: 'Nouto: Katu 1 -> Toimitus: Katu 2', message: '' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await handler(req);
    expect(res.status).toBe(200);
    expect(mockSendMail).toHaveBeenCalledTimes(1);
  });
});
