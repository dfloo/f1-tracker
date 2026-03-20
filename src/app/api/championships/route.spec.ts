import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { GET } from './route';

describe('GET /api/championships', () => {
  it('returns championship data for valid year query', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/championships?year=2024',
    );

    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data.year).toBe(2024);
    expect(Array.isArray(payload.data.drivers)).toBe(true);
    expect(payload.availableYears[0]).toBe(2024);
  });

  it('returns 400 for an invalid year value', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/championships?year=twenty-twenty-four',
    );

    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.message).toMatch(/invalid year/i);
  });

  it('uses 2024 as default year when year is omitted', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/championships',
    );

    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data.year).toBe(2024);
  });
});
