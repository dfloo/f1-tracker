import { readFileSync } from 'node:fs';
import path from 'node:path';

import type { ChampionshipYearData } from '@/types/championship';

type RaceInfo = {
  raceId: number;
  year: number;
  round: number;
  name: string;
};

type ConstructorInfo = {
  name: string;
  color: string;
};

type CsvDataset = {
  racesByYear: Map<number, RaceInfo[]>;
  racesById: Map<number, RaceInfo>;
  driverNamesById: Map<number, string>;
  constructorsById: Map<number, ConstructorInfo>;
  cumulativePointsByRaceDriver: Map<number, Map<number, number>>;
  raceResultByRaceDriver: Map<
    number,
    Map<
      number,
      {
        constructorId: number;
        racePoints: number;
      }
    >
  >;
};

const defaultColor = '#8A8A8A';

const constructorColors: Record<string, string> = {
  mclaren: '#FF8700',
  ferrari: '#DC0000',
  red_bull: '#3671C6',
  mercedes: '#27F4D2',
  williams: '#005AFF',
  aston_martin: '#229971',
  alpine: '#0090FF',
  rb: '#6692FF',
  alphatauri: '#4E7C9B',
  sauber: '#52E252',
  haas: '#B6BABD',
  renault: '#FFF500',
};

let cachedDataset: CsvDataset | null = null;

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }

      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

function parseCsvFile(fileName: string) {
  const filePath = path.join(process.cwd(), 'temp-data', fileName);
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/).filter((line) => line.length > 0);

  const [headerLine, ...rowLines] = lines;
  const headers = parseCsvLine(headerLine);

  return rowLines.map((line) => {
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};

    for (let index = 0; index < headers.length; index += 1) {
      row[headers[index]] = values[index] ?? '';
    }

    return row;
  });
}

function toNumber(value: string) {
  if (!value || value === '\\N') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildDataset(): CsvDataset {
  const racesByYear = new Map<number, RaceInfo[]>();
  const racesById = new Map<number, RaceInfo>();
  const driverNamesById = new Map<number, string>();
  const constructorsById = new Map<number, ConstructorInfo>();
  const cumulativePointsByRaceDriver = new Map<number, Map<number, number>>();
  const raceResultByRaceDriver = new Map<
    number,
    Map<number, { constructorId: number; racePoints: number }>
  >();

  for (const row of parseCsvFile('races.csv')) {
    const raceId = toNumber(row.raceId);
    const year = toNumber(row.year);
    const round = toNumber(row.round);

    if (!raceId || !year || !round || year > 2024) {
      continue;
    }

    const race: RaceInfo = {
      raceId,
      year,
      round,
      name: row.name,
    };

    if (!racesByYear.has(year)) {
      racesByYear.set(year, []);
    }

    racesByYear.get(year)?.push(race);
    racesById.set(raceId, race);
  }

  for (const races of racesByYear.values()) {
    races.sort((a, b) => a.round - b.round);
  }

  for (const row of parseCsvFile('drivers.csv')) {
    const driverId = toNumber(row.driverId);

    if (!driverId) {
      continue;
    }

    driverNamesById.set(driverId, `${row.forename} ${row.surname}`.trim());
  }

  for (const row of parseCsvFile('constructors.csv')) {
    const constructorId = toNumber(row.constructorId);

    if (!constructorId) {
      continue;
    }

    constructorsById.set(constructorId, {
      name: row.name,
      color: constructorColors[row.constructorRef] ?? defaultColor,
    });
  }

  for (const row of parseCsvFile('driver_standings.csv')) {
    const raceId = toNumber(row.raceId);
    const driverId = toNumber(row.driverId);
    const points = toNumber(row.points);
    const race = raceId ? racesById.get(raceId) : null;

    if (!race || !driverId || points === null) {
      continue;
    }

    if (!cumulativePointsByRaceDriver.has(race.raceId)) {
      cumulativePointsByRaceDriver.set(race.raceId, new Map());
    }

    cumulativePointsByRaceDriver.get(race.raceId)?.set(driverId, points);
  }

  for (const row of parseCsvFile('results.csv')) {
    const raceId = toNumber(row.raceId);
    const driverId = toNumber(row.driverId);
    const constructorId = toNumber(row.constructorId);
    const racePoints = toNumber(row.points);
    const race = raceId ? racesById.get(raceId) : null;

    if (!race || !driverId || !constructorId || racePoints === null) {
      continue;
    }

    if (!raceResultByRaceDriver.has(race.raceId)) {
      raceResultByRaceDriver.set(race.raceId, new Map());
    }

    raceResultByRaceDriver.get(race.raceId)?.set(driverId, {
      constructorId,
      racePoints,
    });
  }

  return {
    racesByYear,
    racesById,
    driverNamesById,
    constructorsById,
    cumulativePointsByRaceDriver,
    raceResultByRaceDriver,
  };
}

function getDataset() {
  if (!cachedDataset) {
    cachedDataset = buildDataset();
  }

  return cachedDataset;
}

export const championshipYears = Array.from(getDataset().racesByYear.keys()).sort(
  (a, b) => b - a,
);

export function getChampionshipYearFromMocks(year: number): ChampionshipYearData | null {
  const dataset = getDataset();
  const races = dataset.racesByYear.get(year);

  if (!races || races.length === 0) {
    return null;
  }

  const driverIds = new Set<number>();

  for (const race of races) {
    const standings = dataset.cumulativePointsByRaceDriver.get(race.raceId);

    if (standings) {
      for (const driverId of standings.keys()) {
        driverIds.add(driverId);
      }
    }
  }

  const drivers = Array.from(driverIds)
    .map((driverId) => {
      let latestPoints = 0;

      const cumulativePoints = races.map((race) => {
        const racePoints = dataset.cumulativePointsByRaceDriver
          .get(race.raceId)
          ?.get(driverId);

        if (racePoints !== undefined) {
          latestPoints = racePoints;
        }

        return latestPoints;
      });

      const raceResults = races.map((race) => {
        const result = dataset.raceResultByRaceDriver.get(race.raceId)?.get(driverId);
        const constructor = result
          ? dataset.constructorsById.get(result.constructorId)
          : null;

        return {
          constructorId: result ? String(result.constructorId) : null,
          constructorName: constructor?.name ?? null,
          constructorColor: constructor?.color ?? defaultColor,
          racePoints: result?.racePoints ?? 0,
        };
      });

      const preferredColor =
        raceResults.find((result) => result.constructorId)?.constructorColor ??
        defaultColor;

      return {
        id: String(driverId),
        name: dataset.driverNamesById.get(driverId) ?? `Driver ${driverId}`,
        color: preferredColor,
        cumulativePoints,
        raceResults,
      };
    })
    .filter((driver) => (driver.cumulativePoints.at(-1) ?? 0) > 0)
    .sort(
      (a, b) =>
        (b.cumulativePoints.at(-1) ?? 0) - (a.cumulativePoints.at(-1) ?? 0),
    );

  return {
    year,
    races: races.map((race) => ({ round: race.round, name: race.name })),
    drivers,
  };
}
