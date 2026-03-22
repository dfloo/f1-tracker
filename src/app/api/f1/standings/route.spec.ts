import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { GET } from './route';

describe('GET /api/f1/standings', () => {
  it('returns driver standings timeline for a valid season', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/f1/standings?season=2021&championship=drivers',
    );

    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data.season).toBe(2021);
    expect(payload.data.championship).toBe('drivers');
    expect(Array.isArray(payload.data.timeline)).toBe(true);
    expect(payload.data.timeline.length).toBeGreaterThan(0);
    expect(Array.isArray(payload.data.series)).toBe(true);
    expect(payload.data.series.length).toBeGreaterThan(0);
  });

  it('returns 400 for invalid championship values', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/f1/standings?season=2021&championship=teams',
    );

    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe('invalid_query');
  });
});
