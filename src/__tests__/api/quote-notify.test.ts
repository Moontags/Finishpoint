import { vi } from 'vitest';

const mockSendMail = vi.hoisted(() => vi.fn().mockResolvedValue({ messageId: 'mock-id' }));

vi.mock('nodemailer', () => ({
  default: {
    createTransport: () => ({ sendMail: mockSendMail }),
  },
  createTransport: () => ({ sendMail: mockSendMail }),
}));

// Reitin pitaa loytya polusta app/api/quote/notify/route.ts, muuten
// ChatWidgetin POST /api/quote/notify palauttaa 404.
import { POST as handler } from '../../app/api/quote/notify/route';
import { Request as NodeRequest, Headers as NodeHeaders } from 'undici';

beforeAll(() => {
  process.env.SMTP_HOST = 'smtp.test.com';
  process.env.SMTP_USER = 'test@test.com';
  process.env.SMTP_PASS = 'testpass';
  process.env.SMTP_FROM = 'test@test.com';
  process.env.SMTP_PORT = '587';
  process.env.QUOTE_RECIPIENT = 'kuljetus@pakuvie.fi';
});

afterAll(() => {
  delete process.env.SMTP_HOST;
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASS;
  delete process.env.SMTP_FROM;
  delete process.env.SMTP_PORT;
  delete process.env.QUOTE_RECIPIENT;
});

function notifyRequest(body: unknown) {
  return new NodeRequest('http://localhost/api/quote/notify', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: new NodeHeaders({ 'Content-Type': 'application/json' }),
  });
}

describe('/api/quote/notify', () => {
  beforeEach(() => {
    mockSendMail.mockClear();
  });

  it('sends the chat notification to the operator with the customer as replyTo', async () => {
    const res = await handler(notifyRequest({
      name: 'Maija',
      phone: '0401234567',
      email: 'maija@example.com',
      pickupAddress: 'Katu 1',
      deliveryAddress: 'Katu 2',
      message: 'Sohva',
    }));

    expect(res.status).toBe(200);
    expect(mockSendMail).toHaveBeenCalledTimes(1);
    const mailOptions = mockSendMail.mock.calls[0][0];
    expect(mailOptions.to).toBe('kuljetus@pakuvie.fi');
    expect(mailOptions.replyTo).toBe('maija@example.com');
    expect(mailOptions.html).toContain('Maija');
  });

  it('omits replyTo when the chat did not capture a valid email', async () => {
    const res = await handler(notifyRequest({ name: 'Maija', email: '-' }));

    expect(res.status).toBe(200);
    const mailOptions = mockSendMail.mock.calls[0][0];
    expect(mailOptions.replyTo).toBeUndefined();
    expect(mailOptions.to).toBe('kuljetus@pakuvie.fi');
  });
});
