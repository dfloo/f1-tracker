import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getBackendBaseUrl } from '@/lib/backend';
import { errorJson, parseIntegerQuery } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

function parseSessionType(value: string | null) {
  if (!value || value === 'all') {
    return 'all' as const;
  }

  if (value === 'race' || value === 'sprint') {
    return value;
  }

  return null;
}

export async function GET(request: NextRequest) {
  const year = parseIntegerQuery(request.nextUrl.searchParams.get('year'));
  const sessionType = parseSessionType(
    request.nextUrl.searchParams.get('sessionType'),
  );

  if (year === null) {
    return errorJson({
      code: 'invalid_query',
      message: 'A valid integer year query parameter is required.',
      status: 400,
    });
  }

  if (sessionType === null) {
    return errorJson({
      code: 'invalid_query',
      message: 'sessionType must be one of race, sprint, or all.',
      status: 400,
    });
  }

  let upstreamUrl: URL;

  try {
    upstreamUrl = new URL(`${getBackendBaseUrl()}/api/f1/results`);
  } catch {
    return errorJson({
      code: 'server_misconfigured',
      message: 'API server is not configured.',
      status: 500,
    });
  }

  upstreamUrl.searchParams.set('year', String(year));
  upstreamUrl.searchParams.set('sessionType', sessionType);

  try {
    const upstreamResponse = await fetch(upstreamUrl.toString(), {
      method: 'GET',
      cache: 'no-store',
    });

    const upstreamBody = await upstreamResponse.text();
    const contentType = upstreamResponse.headers.get('content-type');
    const headers = new Headers();

    if (contentType) {
      headers.set('content-type', contentType);
    }

    return new NextResponse(upstreamBody, {
      status: upstreamResponse.status,
      headers,
    });
  } catch {
    return errorJson({
      code: 'upstream_unavailable',
      message: 'Failed to reach upstream API server.',
      status: 502,
    });
  }
}
