import type { NextRequest } from 'next/server';

import { getConstructorById } from '@/lib/server/domainService';
import { errorJson, okJson } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  const constructorId = Number(params.id);

  if (!Number.isInteger(constructorId)) {
    return errorJson({
      code: 'invalid_path',
      message: 'Constructor id must be an integer.',
      status: 400,
    });
  }

  const constructor = getConstructorById(constructorId);

  if (!constructor) {
    return errorJson({
      code: 'constructor_not_found',
      message: 'Constructor was not found.',
      status: 404,
    });
  }

  return okJson(constructor);
}
