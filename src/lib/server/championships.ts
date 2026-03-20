import {
  championshipYears,
  getChampionshipYearFromMocks,
} from '@/lib/mocks/championships';
import type { ChampionshipYearResponse } from '@/types/championship';

class ChampionshipServiceError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ChampionshipServiceError';
    this.status = status;
  }
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function isSupportedYear(year: number) {
  return championshipYears.includes(year);
}

export async function getChampionshipByYear(params: {
  year: number;
}): Promise<ChampionshipYearResponse> {
  await wait(120);

  if (!isSupportedYear(params.year)) {
    throw new ChampionshipServiceError('Requested championship year is not available.', 404);
  }

  const yearData = getChampionshipYearFromMocks(params.year);

  if (!yearData) {
    throw new ChampionshipServiceError('Requested championship year is not available.', 404);
  }

  return {
    availableYears: championshipYears,
    data: yearData,
  };
}

export function toServiceError(error: unknown) {
  if (error instanceof ChampionshipServiceError) {
    return error;
  }

  return new ChampionshipServiceError('Unable to load championship data.', 500);
}
