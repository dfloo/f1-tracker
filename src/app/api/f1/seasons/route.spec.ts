import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GET } from './route';

describe('GET /api/f1/seasons', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubEnv('API_SERVER_URL', 'https://backend.example.com');
  });

  it('proxies upstream seasons response', async () => {
    const upstreamPayload = {
      years: [2024, 2023],
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

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://backend.example.com/api/f1/seasons',
      expect.objectContaining({ cache: 'no-store', method: 'GET' }),
    );
    expect(payload.years).toEqual([2024, 2023]);
  });

  it('returns 502 when upstream is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(502);
    expect(payload.error.code).toBe('upstream_unavailable');
  });
});
