import type { NextRequest } from 'next/server';

import { getResultsBySeason } from '@/lib/server/domainService';
import { errorJson, okJson, parseIntegerQuery } from '@/lib/server/http';

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
  const season = parseIntegerQuery(request.nextUrl.searchParams.get('season'));
  const sessionType = parseSessionType(
    request.nextUrl.searchParams.get('sessionType'),
  );

  if (season === null) {
    return errorJson({
      code: 'invalid_query',
      message: 'A valid integer season query parameter is required.',
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

  const result = getResultsBySeason({ season, sessionType });

  if (!result) {
    return errorJson({
      code: 'season_not_found',
      message: 'Requested season was not found.',
      status: 404,
    });
  }

  return okJson(result);
}
