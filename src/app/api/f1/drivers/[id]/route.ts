import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getBackendBaseUrl } from '@/lib/backend';
import { errorJson, parseIntegerQuery } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  const driverId = Number(params.id);
  const hasRaceIdParam = request.nextUrl.searchParams.has('raceId');
  const raceIdParam = request.nextUrl.searchParams.get('raceId');
  const year = parseIntegerQuery(request.nextUrl.searchParams.get('year'));

  if (!Number.isInteger(driverId)) {
    return errorJson({
      code: 'invalid_path',
      message: 'Driver id must be an integer.',
      status: 400,
    });
  }

  if (year === null) {
    return errorJson({
      code: 'invalid_query',
      message: 'A valid integer year query parameter is required.',
      status: 400,
    });
  }

  if (hasRaceIdParam && (!raceIdParam || raceIdParam.trim().length === 0)) {
    return errorJson({
      code: 'invalid_query',
      message: 'raceId must be a non-empty string when provided.',
      status: 400,
    });
  }

  let upstreamUrl: URL;

  try {
    upstreamUrl = new URL(`${getBackendBaseUrl()}/api/f1/drivers/${driverId}`);
  } catch {
    return errorJson({
      code: 'server_misconfigured',
      message: 'API server is not configured.',
      status: 500,
    });
  }

  upstreamUrl.searchParams.set('year', String(year));

  if (raceIdParam) {
    upstreamUrl.searchParams.set('raceId', raceIdParam);
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
