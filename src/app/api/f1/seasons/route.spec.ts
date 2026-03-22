import { describe, expect, it } from 'vitest';

import { GET } from './route';

describe('GET /api/f1/seasons', () => {
  it('returns available seasons in descending order', async () => {
    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.meta.schema).toBe('f1-tracker');
    expect(Array.isArray(payload.data.years)).toBe(true);
    expect(payload.data.years.length).toBeGreaterThan(0);
    expect(payload.data.years[0]).toBeGreaterThan(payload.data.years.at(-1));
  });
});
