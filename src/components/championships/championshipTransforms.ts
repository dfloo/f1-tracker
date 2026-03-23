import type {
  ChampionshipProgress,
  ChampionshipSeries,
  ChampionshipYearData,
} from '@/types/championship';

export function toDriversProgress(data: ChampionshipYearData): ChampionshipProgress {
  const series: ChampionshipSeries[] = data.drivers.map((driver) => ({
    id: driver.id,
    name: driver.name,
    color: driver.color,
    points: driver.cumulativePoints,
  }));

  return {
    year: data.year,
    category: 'drivers',
    events: data.events,
    series,
  };
}

export function toConstructorsProgress(
  data: ChampionshipYearData,
): ChampionshipProgress {
  const rounds = data.events.length;
  const constructorMap = new Map<
    string,
    { id: string; name: string; color: string; points: number[]; total: number }
  >();

  for (let roundIndex = 0; roundIndex < rounds; roundIndex += 1) {
    const roundTotals = new Map<string, number>();

    for (const driver of data.drivers) {
      const roundResult = driver.raceResults[roundIndex];

      if (!roundResult || !roundResult.constructorId) {
        continue;
      }

      const constructorId = roundResult.constructorId;
      const racePoints = roundResult.racePoints;

      roundTotals.set(
        constructorId,
        (roundTotals.get(constructorId) ?? 0) + racePoints,
      );

      if (!constructorMap.has(constructorId)) {
        constructorMap.set(constructorId, {
          id: constructorId,
          name: roundResult.constructorName ?? constructorId,
          color: roundResult.constructorColor,
          points: Array.from({ length: rounds }, () => 0),
          total: 0,
        });
      }
    }

    for (const constructor of constructorMap.values()) {
      const roundPoints = roundTotals.get(constructor.id) ?? 0;
      constructor.total += roundPoints;
      constructor.points[roundIndex] = Number(constructor.total.toFixed(1));
    }
  }

  const series: ChampionshipSeries[] = Array.from(constructorMap.values())
    .filter((constructor) => constructor.total > 0)
    .sort((a, b) => b.total - a.total)
    .map(({ id, name, color, points }) => ({ id, name, color, points }));

  return {
    year: data.year,
    category: 'constructors',
    events: data.events,
    series,
  };
}
