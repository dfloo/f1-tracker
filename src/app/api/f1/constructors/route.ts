import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getBackendBaseUrl } from '@/lib/backend';
import { errorJson, parseIntegerQuery } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const hasYearParam = request.nextUrl.searchParams.has('year');
  const yearParam = request.nextUrl.searchParams.get('year');
  const parsedYear = parseIntegerQuery(yearParam);

  if (hasYearParam && parsedYear === null) {
    return errorJson({
      code: 'invalid_query',
      message: 'A valid integer year query parameter is required.',
      status: 400,
    });
  }

  let upstreamUrl: URL;

  try {
    upstreamUrl = new URL(`${getBackendBaseUrl()}/api/f1/constructors`);
  } catch {
    return errorJson({
      code: 'server_misconfigured',
      message: 'API server is not configured.',
      status: 500,
    });
  }

  if (parsedYear !== null) {
    upstreamUrl.searchParams.set('year', String(parsedYear));
  }

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
