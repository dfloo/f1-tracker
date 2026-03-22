import type { NextRequest } from 'next/server';

import { getStandingsBySeason } from '@/lib/server/domainService';
import { errorJson, okJson, parseIntegerQuery } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

function parseChampionship(value: string | null) {
  if (value === 'drivers' || value === 'constructors') {
    return value;
  }

  return null;
}

export async function GET(request: NextRequest) {
  const season = parseIntegerQuery(request.nextUrl.searchParams.get('season'));
  const championship = parseChampionship(
    request.nextUrl.searchParams.get('championship'),
  );

  if (season === null) {
    return errorJson({
      code: 'invalid_query',
      message: 'A valid integer season query parameter is required.',
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

  const standings = getStandingsBySeason({ season, championship });

  if (!standings) {
    return errorJson({
      code: 'season_not_found',
      message: 'Requested season was not found.',
      status: 404,
    });
  }

  return okJson(standings);
}
