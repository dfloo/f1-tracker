import type { NextRequest } from 'next/server';

import { getDriverById } from '@/lib/server/domainService';
import { errorJson, okJson } from '@/lib/server/http';

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

  const driver = getDriverById(driverId);

  if (!driver) {
    return errorJson({
      code: 'driver_not_found',
      message: 'Driver was not found.',
      status: 404,
    });
  }

  return okJson(driver);
}
