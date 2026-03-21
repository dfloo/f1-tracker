import {
  championshipYears,
  getDriverSeasonFromMocks,
} from '@/lib/mocks/championships';
import type { DriversSeasonResponse } from '@/types/championship';

class DriverServiceError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'DriverServiceError';
    this.status = status;
  }
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function isSupportedDriverYear(year: number) {
  return championshipYears.includes(year);
}

export async function getDriversByYear(params: {
  year: number;
}): Promise<DriversSeasonResponse> {
  await wait(120);

  if (!isSupportedDriverYear(params.year)) {
    throw new DriverServiceError('Requested driver season is not available.', 404);
  }

  const yearData = getDriverSeasonFromMocks(params.year);

  if (!yearData) {
    throw new DriverServiceError('Requested driver season is not available.', 404);
  }

  return {
    availableYears: championshipYears,
    data: yearData,
  };
}

export function toDriverServiceError(error: unknown) {
  if (error instanceof DriverServiceError) {
    return error;
  }

  return new DriverServiceError('Unable to load driver data.', 500);
}