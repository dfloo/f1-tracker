import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GET } from './route';

describe('GET /api/f1/results', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubEnv('API_SERVER_URL', 'https://backend.example.com');
  });

  it('proxies results response for a valid year request', async () => {
    const upstreamPayload = {
      year: 2024,
      sessionType: 'race',
      results: [],
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
      'http://localhost:3000/api/f1/results?year=2024&sessionType=race',
    );

    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://backend.example.com/api/f1/results?year=2024&sessionType=race',
      expect.objectContaining({ cache: 'no-store', method: 'GET' }),
    );
    expect(payload.year).toBe(2024);
  });

  it('returns 400 when year query is missing', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const request = new NextRequest(
      'http://localhost:3000/api/f1/results?sessionType=all',
    );

    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe('invalid_query');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid year values', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const request = new NextRequest(
      'http://localhost:3000/api/f1/results?year=bad-year&sessionType=all',
    );

    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe('invalid_query');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid sessionType values', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const request = new NextRequest(
      'http://localhost:3000/api/f1/results?year=2024&sessionType=qualifying',
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
      'http://localhost:3000/api/f1/results?year=2024&sessionType=sprint',
    );

    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(502);
    expect(payload.error.code).toBe('upstream_unavailable');
  });
});
