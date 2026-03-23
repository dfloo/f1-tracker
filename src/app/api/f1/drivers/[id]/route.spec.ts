import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GET } from './route';

describe('GET /api/f1/drivers/[id]', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubEnv('API_SERVER_URL', 'https://backend.example.com');
  });

  it('proxies response when year is provided and raceId is omitted', async () => {
    const upstreamPayload = {
      driver: {
        id: 'max_verstappen',
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
      'http://localhost:3000/api/f1/drivers/1?year=2024',
    );

    const response = await GET(request, {
      params: Promise.resolve({ id: '1' }),
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://backend.example.com/api/f1/drivers/1?year=2024',
      expect.objectContaining({ cache: 'no-store', method: 'GET' }),
    );
    expect(payload.driver.id).toBe('max_verstappen');
  });

  it('proxies response when year and raceId are provided', async () => {
    const upstreamPayload = {
      selectedRace: {
        id: 'melbourne-grand-prix',
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
      'http://localhost:3000/api/f1/drivers/1?year=2024&raceId=melbourne-grand-prix',
    );

    const response = await GET(request, {
      params: Promise.resolve({ id: '1' }),
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://backend.example.com/api/f1/drivers/1?year=2024&raceId=melbourne-grand-prix',
      expect.objectContaining({ cache: 'no-store', method: 'GET' }),
    );
    expect(payload.selectedRace.id).toBe('melbourne-grand-prix');
  });

  it('returns 400 when year query is missing', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const request = new NextRequest('http://localhost:3000/api/f1/drivers/1');

    const response = await GET(request, {
      params: Promise.resolve({ id: '1' }),
    });
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe('invalid_query');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid year query values', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const request = new NextRequest(
      'http://localhost:3000/api/f1/drivers/1?year=bad-year',
    );

    const response = await GET(request, {
      params: Promise.resolve({ id: '1' }),
    });
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe('invalid_query');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 400 for empty raceId query values', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const request = new NextRequest(
      'http://localhost:3000/api/f1/drivers/1?year=2024&raceId=',
    );

    const response = await GET(request, {
      params: Promise.resolve({ id: '1' }),
    });
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe('invalid_query');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid path id values', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const request = new NextRequest(
      'http://localhost:3000/api/f1/drivers/not-a-number?year=2024',
    );

    const response = await GET(request, {
      params: Promise.resolve({ id: 'not-a-number' }),
    });
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe('invalid_path');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 502 when upstream is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

    const request = new NextRequest(
      'http://localhost:3000/api/f1/drivers/1?year=2024',
    );

    const response = await GET(request, {
      params: Promise.resolve({ id: '1' }),
    });
    const payload = await response.json();

    expect(response.status).toBe(502);
    expect(payload.error.code).toBe('upstream_unavailable');
  });
});
