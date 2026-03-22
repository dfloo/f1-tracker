import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GET } from './route';

describe('GET /api/f1/drivers', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubEnv('API_SERVER_URL', 'https://backend.example.com');
  });

  it('proxies season response when year is provided', async () => {
    const upstreamPayload = {
      availableYears: [2024, 2023],
      data: {
        year: 2024,
        drivers: [],
      },
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
      'http://localhost:3000/api/f1/drivers?year=2024',
    );

    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://backend.example.com/api/f1/drivers?year=2024',
      expect.objectContaining({ cache: 'no-store', method: 'GET' }),
    );
    expect(payload.data.year).toBe(2024);
  });

  it('proxies directory response when no year or season is provided', async () => {
    const upstreamPayload = {
      years: [2024, 2023],
      drivers: [],
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

    const request = new NextRequest('http://localhost:3000/api/f1/drivers');

    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://backend.example.com/api/f1/drivers',
      expect.objectContaining({ cache: 'no-store', method: 'GET' }),
    );
    expect(payload.years).toEqual([2024, 2023]);
  });

  it('returns 400 for invalid year values', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const request = new NextRequest(
      'http://localhost:3000/api/f1/drivers?year=bad-year',
    );

    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe('invalid_query');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 502 when upstream is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

    const request = new NextRequest(
      'http://localhost:3000/api/f1/drivers?year=2024',
    );

    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(502);
    expect(payload.error.code).toBe('upstream_unavailable');
  });
});
