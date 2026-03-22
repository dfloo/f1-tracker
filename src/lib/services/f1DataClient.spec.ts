import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clearF1DataClientCache,
  CLIENT_CACHE_TTL_MS,
  fetchChampionshipByYear,
  fetchConstructorsByYear,
  fetchDriversByYear,
} from './f1DataClient';

describe('f1DataClient cache', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearF1DataClientCache();
  });

  it('returns cached drivers response for repeated requests of the same year', async () => {
    const payload = {
      availableYears: [2024],
      data: {
        year: 2024,
        drivers: [
          {
            id: '1',
            name: 'Max Verstappen',
            latestPoints: 100,
          },
        ],
      },
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    });

    vi.stubGlobal('fetch', fetchMock);

    const first = await fetchDriversByYear({
      year: 2024,
      signal: new AbortController().signal,
    });
    const second = await fetchDriversByYear({
      year: 2024,
      signal: new AbortController().signal,
    });

    expect(first).toEqual(payload);
    expect(second).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/f1/drivers?year=2024',
      expect.objectContaining({ cache: 'no-store', method: 'GET' }),
    );
  });

  it('uses separate cache entries per endpoint', async () => {
    const driversPayload = {
      availableYears: [2024],
      data: {
        year: 2024,
        drivers: [],
      },
    };
    const constructorsPayload = {
      availableYears: [2024],
      data: {
        year: 2024,
        constructors: [],
      },
    };
    const championshipPayload = {
      availableYears: [2024],
      data: {
        year: 2024,
        races: [],
        drivers: [],
      },
    };

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => driversPayload,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => constructorsPayload,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => championshipPayload,
      });

    vi.stubGlobal('fetch', fetchMock);

    await fetchDriversByYear({
      year: 2024,
      signal: new AbortController().signal,
    });
    await fetchConstructorsByYear({
      year: 2024,
      signal: new AbortController().signal,
    });
    await fetchChampionshipByYear({
      year: 2024,
      signal: new AbortController().signal,
    });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      '/api/f1/drivers?year=2024',
      expect.objectContaining({ cache: 'no-store', method: 'GET' }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/f1/constructors?year=2024',
      expect.objectContaining({ cache: 'no-store', method: 'GET' }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      '/api/f1/championships?year=2024',
      expect.objectContaining({ cache: 'no-store', method: 'GET' }),
    );
  });

  it('refetches when the cache entry expires', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    const payload = {
      availableYears: [2024],
      data: {
        year: 2024,
        drivers: [],
      },
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    });

    vi.stubGlobal('fetch', fetchMock);

    await fetchDriversByYear({
      year: 2024,
      signal: new AbortController().signal,
    });

    vi.advanceTimersByTime(CLIENT_CACHE_TTL_MS + 1);

    await fetchDriversByYear({
      year: 2024,
      signal: new AbortController().signal,
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });

  it('treats falsy cached values as cache hits', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => 0,
    });

    vi.stubGlobal('fetch', fetchMock);

    const first = await fetchDriversByYear({
      year: 2024,
      signal: new AbortController().signal,
    });
    const second = await fetchDriversByYear({
      year: 2024,
      signal: new AbortController().signal,
    });

    expect(first as unknown).toBe(0);
    expect(second as unknown).toBe(0);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('uses nested API error message when request fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        error: {
          message: 'Backend validation failed.',
        },
      }),
    });

    vi.stubGlobal('fetch', fetchMock);

    await expect(
      fetchDriversByYear({
        year: 2024,
        signal: new AbortController().signal,
      }),
    ).rejects.toThrow('Backend validation failed.');
  });
});