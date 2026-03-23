import type {
  ChampionshipYearResponse,
  ConstructorsSeasonResponse,
  DriversSeasonResponse,
  EventsSeasonResponse,
} from '@/types/championship';

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

function getCacheKey(pathname: string, year: number) {
  return `${pathname}:${year}`;
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
  queryKey: string;
  year: number;
}) {
  const searchParams = new URLSearchParams({
    [params.queryKey]: String(params.year),
  });
  return `${params.pathname}?${searchParams.toString()}`;
}

async function fetchFromApi<T>(params: {
  pathname: string;
  year: number;
  queryKey?: string;
  signal: AbortSignal;
  fallbackMessage: string;
}): Promise<T> {
  if (params.signal.aborted) {
    throw new DOMException('The operation was aborted.', 'AbortError');
  }

  const cacheKey = getCacheKey(params.pathname, params.year);
  const cachedValue = getCachedValue<T>(cacheKey);

  if (cachedValue !== null) {
    return cachedValue;
  }

  const response = await fetch(
    buildRelativeApiUrl({
      pathname: params.pathname,
      queryKey: params.queryKey ?? 'year',
      year: params.year,
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
    year: params.year,
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
    year: params.year,
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
    year: params.year,
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
    year: params.year,
    signal: params.signal,
    fallbackMessage: 'Failed to load events.',
  });
}