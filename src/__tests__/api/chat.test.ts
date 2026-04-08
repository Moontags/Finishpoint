/**
 * @jest-environment node
 */
import { POST as handler } from '../../app/api/chat/route';
import { Request as NodeRequest, Headers as NodeHeaders } from 'undici';

beforeAll(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({
      content: [{ type: 'text', text: 'Mocked AI reply' }]
    })
  }) as jest.Mock;
});

describe('/api/chat', () => {
  it('returns reply for fi language', async () => {
    const req = new NodeRequest('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hei' }],
        language: 'fi'
      }),
      headers: new NodeHeaders({ 'Content-Type': 'application/json' }),
    });
    const res = await handler(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.reply).toBe('Mocked AI reply');
  });
  it('returns reply for en language', async () => {
    const req = new NodeRequest('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        language: 'en'
      }),
      headers: new NodeHeaders({ 'Content-Type': 'application/json' }),
    });
    const res = await handler(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.reply).toBe('Mocked AI reply');
  });
});
