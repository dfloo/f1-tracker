import type {
  ChampionshipYearResponse,
  ConstructorsSeasonResponse,
  DriversSeasonResponse,
  EventsSeasonResponse,
} from '@/types/championship';
import type { DriverDetailResponse } from '@/types/driverDetail';

type ApiErrorPayload = {
  message?: string;
  error?: {
    message?: string;
  };
};

type CacheEntry = {
  expiresAt: number;
  value: unknown;
};

export const CLIENT_CACHE_TTL_MS = 300_000;

const responseCache = new Map<string, CacheEntry>();

function toStableQueryString(query: Record<string, string>) {
  const entries = Object.entries(query).sort(([a], [b]) => a.localeCompare(b));
  const searchParams = new URLSearchParams();

  for (const [key, value] of entries) {
    searchParams.set(key, value);
  }

  return searchParams.toString();
}

function getCacheKey(pathname: string, query: Record<string, string>) {
  return `${pathname}?${toStableQueryString(query)}`;
}

function getCachedValue<T>(cacheKey: string) {
  const entry = responseCache.get(cacheKey);

  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    responseCache.delete(cacheKey);
    return null;
  }

  return entry.value as T;
}

function setCachedValue(cacheKey: string, value: unknown) {
  responseCache.set(cacheKey, {
    value,
    expiresAt: Date.now() + CLIENT_CACHE_TTL_MS,
  });
}

export function clearF1DataClientCache() {
  responseCache.clear();
}

function buildRelativeApiUrl(params: {
  pathname: string;
  query: Record<string, string>;
}) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params.query)) {
    searchParams.set(key, value);
  }

  return `${params.pathname}?${searchParams.toString()}`;
}

async function fetchFromApi<T>(params: {
  pathname: string;
  query: Record<string, string>;
  signal: AbortSignal;
  fallbackMessage: string;
}): Promise<T> {
  if (params.signal.aborted) {
    throw new DOMException('The operation was aborted.', 'AbortError');
  }

  const cacheKey = getCacheKey(params.pathname, params.query);
  const cachedValue = getCachedValue<T>(cacheKey);

  if (cachedValue !== null) {
    return cachedValue;
  }

  const response = await fetch(
    buildRelativeApiUrl({
      pathname: params.pathname,
      query: params.query,
    }),
    {
      method: 'GET',
      signal: params.signal,
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    let payload: ApiErrorPayload | null = null;

    try {
      payload = (await response.json()) as ApiErrorPayload;
    } catch {
      payload = null;
    }

    const errorMessage = payload?.message ?? payload?.error?.message;
    throw new Error(errorMessage ?? params.fallbackMessage);
  }

  const parsedValue = (await response.json()) as T;
  setCachedValue(cacheKey, parsedValue);

  return parsedValue;
}

export function fetchChampionshipByYear(params: {
  year: number;
  signal: AbortSignal;
}) {
  return fetchFromApi<ChampionshipYearResponse>({
    pathname: '/api/f1/championships',
    query: {
      year: String(params.year),
    },
    signal: params.signal,
    fallbackMessage: 'Failed to load championship progress.',
  });
}

export function fetchDriversByYear(params: {
  year: number;
  signal: AbortSignal;
}) {
  return fetchFromApi<DriversSeasonResponse>({
    pathname: '/api/f1/drivers',
    query: {
      year: String(params.year),
    },
    signal: params.signal,
    fallbackMessage: 'Failed to load drivers.',
  });
}

export function fetchConstructorsByYear(params: {
  year: number;
  signal: AbortSignal;
}) {
  return fetchFromApi<ConstructorsSeasonResponse>({
    pathname: '/api/f1/constructors',
    query: {
      year: String(params.year),
    },
    signal: params.signal,
    fallbackMessage: 'Failed to load constructors.',
  });
}

export function fetchEventsByYear(params: {
  year: number;
  signal: AbortSignal;
}) {
  return fetchFromApi<EventsSeasonResponse>({
    pathname: '/api/f1/events',
    query: {
      year: String(params.year),
    },
    signal: params.signal,
    fallbackMessage: 'Failed to load events.',
  });
}

export function fetchDriverDetail(params: {
  driverId: string;
  year: number;
  raceId?: string;
  signal: AbortSignal;
}) {
  const query: Record<string, string> = {
    year: String(params.year),
  };

  if (params.raceId) {
    query.raceId = params.raceId;
  }

  return fetchFromApi<DriverDetailResponse>({
    pathname: `/api/f1/drivers/${params.driverId}`,
    query,
    signal: params.signal,
    fallbackMessage: 'Failed to load driver details.',
  });
}
