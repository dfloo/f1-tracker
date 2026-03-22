import type { NextRequest } from 'next/server';

import { getEventsBySeason } from '@/lib/server/domainService';
import { errorJson, okJson, parseIntegerQuery } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const season = parseIntegerQuery(request.nextUrl.searchParams.get('season'));

  if (season === null) {
    return errorJson({
      code: 'invalid_query',
      message: 'A valid integer season query parameter is required.',
      status: 400,
    });
  }

  const events = getEventsBySeason(season);

  if (!events) {
    return errorJson({
      code: 'season_not_found',
      message: 'Requested season was not found.',
      status: 404,
    });
  }

  return okJson({ season, events });
}
