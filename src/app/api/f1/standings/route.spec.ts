import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GET } from './route';

describe('GET /api/f1/standings', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubEnv('API_SERVER_URL', 'https://backend.example.com');
  });

  it('proxies standings response for a valid season request', async () => {
    const upstreamPayload = {
      season: 2021,
      championship: 'drivers',
      timeline: [],
      series: [],
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(upstreamPayload),
      headers: new Headers({
        'content-type': 'application/json',
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const request = new NextRequest(
      'http://localhost:3000/api/f1/standings?season=2021&championship=drivers',
    );

    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://backend.example.com/api/f1/standings?season=2021&championship=drivers',
      expect.objectContaining({ cache: 'no-store', method: 'GET' }),
    );
    expect(payload.season).toBe(2021);
    expect(payload.championship).toBe('drivers');
  });

  it('returns 400 for invalid championship values', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const request = new NextRequest(
      'http://localhost:3000/api/f1/standings?season=2021&championship=team',
    );

    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe('invalid_query');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
