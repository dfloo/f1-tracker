function normalizeBaseUrl(value: string) {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

export function getBackendBaseUrl() {
  const baseUrl = process.env.API_SERVER_URL;

  if (!baseUrl) {
    throw new Error('Missing API_SERVER_URL configuration.');
  }

  return normalizeBaseUrl(baseUrl);
}

export function buildBackendApiUrl(pathname: string, query: Record<string, string>) {
  const endpoint = new URL(`${getBackendBaseUrl()}${pathname}`);

  for (const [key, value] of Object.entries(query)) {
    endpoint.searchParams.set(key, value);
  }

  return endpoint.toString();
}
