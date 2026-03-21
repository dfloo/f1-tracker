import { NextRequest, NextResponse } from 'next/server';

import {
  getDriversByYear,
  isSupportedDriverYear,
  toDriverServiceError,
} from '@/lib/server/drivers';

export const dynamic = 'force-dynamic';

const defaultYear = 2024;

export async function GET(request: NextRequest) {
  const yearParam = request.nextUrl.searchParams.get('year');

  const year = yearParam ? Number(yearParam) : defaultYear;

  if (Number.isNaN(year) || !Number.isInteger(year)) {
    return NextResponse.json(
      { message: 'Invalid year query parameter.' },
      { status: 400 },
    );
  }

  if (!isSupportedDriverYear(year)) {
    return NextResponse.json(
      { message: 'Unsupported driver season.' },
      { status: 400 },
    );
  }

  try {
    const response = await getDriversByYear({ year });
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const serviceError = toDriverServiceError(error);
    return NextResponse.json(
      {
        message: serviceError.message,
      },
      { status: serviceError.status },
    );
  }
}