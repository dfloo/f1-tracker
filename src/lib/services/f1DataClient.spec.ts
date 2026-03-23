import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clearF1DataClientCache,
  CLIENT_CACHE_TTL_MS,
  fetchChampionshipByYear,
  fetchConstructorsByYear,
  fetchDriverDetail,
  fetchDriversByYear,
  fetchEventsByYear,
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
        events: [],
        drivers: [],
      },
    };
    const eventsPayload = {
      availableYears: [2024],
      data: {
        year: 2024,
        events: [],
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
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => eventsPayload,
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
    await fetchEventsByYear({
      year: 2024,
      signal: new AbortController().signal,
    });

    expect(fetchMock).toHaveBeenCalledTimes(4);
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
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      '/api/f1/events?year=2024',
      expect.objectContaining({ cache: 'no-store', method: 'GET' }),
    );
  });

  it('requests events endpoint with year query and caches by year', async () => {
    const payload = {
      availableYears: [2024],
      data: {
        year: 2024,
        events: [
          {
            id: 'bahrain-2024',
            round: 1,
            name: 'Bahrain Grand Prix',
          },
        ],
      },
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    });

    vi.stubGlobal('fetch', fetchMock);

    const first = await fetchEventsByYear({
      year: 2024,
      signal: new AbortController().signal,
    });
    const second = await fetchEventsByYear({
      year: 2024,
      signal: new AbortController().signal,
    });

    expect(first).toEqual(payload);
    expect(second).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/f1/events?year=2024',
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

  it('uses separate cache entries for different raceId values on driver detail requests', async () => {
    const firstPayload = {
      availableYears: [2024],
      data: {
        year: 2024,
        driver: {
          id: '1',
          name: 'Max Verstappen',
          number: '1',
          constructorName: 'Red Bull',
          currentPoints: 50,
        },
        races: [],
        selectedRace: {
          id: 'bahrain',
          round: 1,
          name: 'Bahrain Grand Prix',
          racePoints: 25,
          cumulativePoints: 25,
          qualifying: null,
          lapTimes: [],
        },
        seasonPoints: [],
      },
    };
    const secondPayload = {
      ...firstPayload,
      data: {
        ...firstPayload.data,
        selectedRace: {
          ...firstPayload.data.selectedRace,
          id: 'jeddah',
          round: 2,
          name: 'Saudi Arabian Grand Prix',
        },
      },
    };

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => firstPayload,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => secondPayload,
      });

    vi.stubGlobal('fetch', fetchMock);

    const first = await fetchDriverDetail({
      driverId: '1',
      year: 2024,
      raceId: 'bahrain',
      signal: new AbortController().signal,
    });
    const second = await fetchDriverDetail({
      driverId: '1',
      year: 2024,
      raceId: 'jeddah',
      signal: new AbortController().signal,
    });

    expect(first.data.selectedRace?.id).toBe('bahrain');
    expect(second.data.selectedRace?.id).toBe('jeddah');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      '/api/f1/drivers/1?year=2024&raceId=bahrain',
      expect.objectContaining({ cache: 'no-store', method: 'GET' }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/f1/drivers/1?year=2024&raceId=jeddah',
      expect.objectContaining({ cache: 'no-store', method: 'GET' }),
    );
  });
});
