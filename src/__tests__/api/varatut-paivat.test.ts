/**
 * @jest-environment node
 */
import { GET as handler } from '../../app/api/varatut-paivat/route';
import { Request as NodeRequest } from 'undici';

describe('/api/varatut-paivat', () => {
  it('returns empty arrays if no alku param', async () => {
    const req = new NodeRequest('http://localhost/api/varatut-paivat', { method: 'GET' });
    const res = await handler(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.suljetutPaivat).toEqual([]);
    expect(json.varausAjat).toEqual({});
  });

  it('returns varausAjat and suljetutPaivat for date range', async () => {
    const url = 'http://localhost/api/varatut-paivat?alku=2026-01-01&loppu=2026-01-07';
    const req = new NodeRequest(url, { method: 'GET' });
    const res = await handler(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.suljetutPaivat).toBeDefined();
    expect(json.varausAjat).toBeDefined();
  });
});
