import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { buildBackendApiUrl } from '@/lib/backend';
import { errorJson, parseIntegerQuery } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

const defaultYear = 2024;

export async function GET(request: NextRequest) {
  const hasYearParam = request.nextUrl.searchParams.has('year');
  const yearParam = request.nextUrl.searchParams.get('year');
  const year = hasYearParam ? parseIntegerQuery(yearParam) : defaultYear;

  if (year === null) {
    return errorJson({
      code: 'invalid_query',
      message: 'Invalid year query parameter.',
      status: 400,
    });
  }

  let upstreamUrl: string;

  try {
    upstreamUrl = buildBackendApiUrl('/api/f1/championships', {
      year: String(year),
    });
  } catch {
    return errorJson({
      code: 'server_misconfigured',
      message: 'API server is not configured.',
      status: 500,
    });
  }

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
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
