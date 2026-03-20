import { NextRequest, NextResponse } from 'next/server';

import {
  getChampionshipByYear,
  isSupportedYear,
  toServiceError,
} from '@/lib/server/championships';

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

  if (!isSupportedYear(year)) {
    return NextResponse.json(
      { message: 'Unsupported championship year.' },
      { status: 400 },
    );
  }

  try {
    const response = await getChampionshipByYear({ year });
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const serviceError = toServiceError(error);
    return NextResponse.json(
      {
        message: serviceError.message,
      },
      { status: serviceError.status },
    );
  }
}
