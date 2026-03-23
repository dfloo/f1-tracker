import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getBackendBaseUrl } from '@/lib/backend';
import { errorJson, parseIntegerQuery } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

function parseChampionship(value: string | null) {
  if (value === 'drivers' || value === 'constructors') {
    return value;
  }

  return null;
}

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.has('season')) {
    return errorJson({
      code: 'invalid_query',
      message: 'The season query parameter is not supported. Use year.',
      status: 400,
    });
  }

  const year = parseIntegerQuery(request.nextUrl.searchParams.get('year'));
  const championship = parseChampionship(
    request.nextUrl.searchParams.get('championship'),
  );

  if (year === null) {
    return errorJson({
      code: 'invalid_query',
      message: 'A valid integer year query parameter is required.',
      status: 400,
    });
  }

  if (championship === null) {
    return errorJson({
      code: 'invalid_query',
      message: 'championship must be drivers or constructors.',
      status: 400,
    });
  }

  let upstreamUrl: URL;

  try {
    upstreamUrl = new URL(`${getBackendBaseUrl()}/api/f1/standings`);
  } catch {
    return errorJson({
      code: 'server_misconfigured',
      message: 'API server is not configured.',
      status: 500,
    });
  }

  upstreamUrl.searchParams.set('year', String(year));
  upstreamUrl.searchParams.set('championship', championship);

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
