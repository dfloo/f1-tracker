import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getBackendBaseUrl } from '@/lib/backend';
import { errorJson } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  const driverId = Number(params.id);

  if (!Number.isInteger(driverId)) {
    return errorJson({
      code: 'invalid_path',
      message: 'Driver id must be an integer.',
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
