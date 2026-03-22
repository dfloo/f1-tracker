import { parseCsvFile, toNullableNumber, toNullableString } from '@/lib/server/csv';

export type SessionType = 'race' | 'sprint';

export type Circuit = {
  circuitId: number;
  name: string;
  location: string;
  country: string;
};

export type Event = {
  raceId: number;
  year: number;
  round: number;
  name: string;
  date: string;
  time: string | null;
  circuitId: number | null;
  sessions: {
    fp1Date: string | null;
    fp1Time: string | null;
    fp2Date: string | null;
    fp2Time: string | null;
    fp3Date: string | null;
    fp3Time: string | null;
    qualifyingDate: string | null;
    qualifyingTime: string | null;
    sprintDate: string | null;
    sprintTime: string | null;
  };
};

export type Driver = {
  driverId: number;
  driverRef: string;
  code: string | null;
  forename: string;
  surname: string;
  nationality: string;
};

export type Constructor = {
  constructorId: number;
  constructorRef: string;
  name: string;
  nationality: string;
};

export type RaceResult = {
  resultId: number;
  raceId: number;
  driverId: number;
  constructorId: number | null;
  position: number | null;
  positionOrder: number;
  points: number;
  statusId: number | null;
  sessionType: SessionType;
};

export type DriverStanding = {
  raceId: number;
  driverId: number;
  points: number;
  position: number | null;
  wins: number;
};

export type ConstructorStanding = {
  raceId: number;
  constructorId: number;
  points: number;
  position: number | null;
  wins: number;
};

export type F1Dataset = {
  years: number[];
  eventsByYear: Map<number, Event[]>;
  eventByRaceId: Map<number, Event>;
  circuitsById: Map<number, Circuit>;
  driversById: Map<number, Driver>;
  constructorsById: Map<number, Constructor>;
  statusById: Map<number, string>;
  resultsByRaceId: Map<number, RaceResult[]>;
  sprintResultsByRaceId: Map<number, RaceResult[]>;
  driverStandingsByRaceId: Map<number, DriverStanding[]>;
  constructorStandingsByRaceId: Map<number, ConstructorStanding[]>;
};

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

let cachedDataset: F1Dataset | null = null;

export function getConstructorColor(constructorRef: string | null) {
  if (!constructorRef) {
    return '#8A8A8A';
  }

  return constructorColors[constructorRef] ?? '#8A8A8A';
}

function addToMapArray<T>(map: Map<number, T[]>, key: number, value: T) {
  if (!map.has(key)) {
    map.set(key, []);
  }

  map.get(key)?.push(value);
}

function buildDataset(): F1Dataset {
  const seasonRows = parseCsvFile('seasons.csv');
  const raceRows = parseCsvFile('races.csv');
  const circuitRows = parseCsvFile('circuits.csv');
  const driverRows = parseCsvFile('drivers.csv');
  const constructorRows = parseCsvFile('constructors.csv');
  const statusRows = parseCsvFile('status.csv');
  const resultRows = parseCsvFile('results.csv');
  const sprintRows = parseCsvFile('sprint_results.csv');
  const driverStandingRows = parseCsvFile('driver_standings.csv');
  const constructorStandingRows = parseCsvFile('constructor_standings.csv');

  const years = seasonRows
    .map((row) => toNullableNumber(row.year))
    .filter((value): value is number => value !== null)
    .sort((left, right) => right - left);

  const eventsByYear = new Map<number, Event[]>();
  const eventByRaceId = new Map<number, Event>();

  for (const row of raceRows) {
    const raceId = toNullableNumber(row.raceId);
    const year = toNullableNumber(row.year);
    const round = toNullableNumber(row.round);

    if (raceId === null || year === null || round === null) {
      continue;
    }

    const event: Event = {
      raceId,
      year,
      round,
      name: row.name,
      date: row.date,
      time: toNullableString(row.time),
      circuitId: toNullableNumber(row.circuitId),
      sessions: {
        fp1Date: toNullableString(row.fp1_date),
        fp1Time: toNullableString(row.fp1_time),
        fp2Date: toNullableString(row.fp2_date),
        fp2Time: toNullableString(row.fp2_time),
        fp3Date: toNullableString(row.fp3_date),
        fp3Time: toNullableString(row.fp3_time),
        qualifyingDate: toNullableString(row.quali_date),
        qualifyingTime: toNullableString(row.quali_time),
        sprintDate: toNullableString(row.sprint_date),
        sprintTime: toNullableString(row.sprint_time),
      },
    };

    addToMapArray(eventsByYear, year, event);
    eventByRaceId.set(raceId, event);
  }

  for (const events of eventsByYear.values()) {
    events.sort((left, right) => left.round - right.round);
  }

  const circuitsById = new Map<number, Circuit>();

  for (const row of circuitRows) {
    const circuitId = toNullableNumber(row.circuitId);

    if (circuitId === null) {
      continue;
    }

    circuitsById.set(circuitId, {
      circuitId,
      name: row.name,
      location: row.location,
      country: row.country,
    });
  }

  const driversById = new Map<number, Driver>();

  for (const row of driverRows) {
    const driverId = toNullableNumber(row.driverId);

    if (driverId === null) {
      continue;
    }

    driversById.set(driverId, {
      driverId,
      driverRef: row.driverRef,
      code: toNullableString(row.code),
      forename: row.forename,
      surname: row.surname,
      nationality: row.nationality,
    });
  }

  const constructorsById = new Map<number, Constructor>();

  for (const row of constructorRows) {
    const constructorId = toNullableNumber(row.constructorId);

    if (constructorId === null) {
      continue;
    }

    constructorsById.set(constructorId, {
      constructorId,
      constructorRef: row.constructorRef,
      name: row.name,
      nationality: row.nationality,
    });
  }

  const statusById = new Map<number, string>();

  for (const row of statusRows) {
    const statusId = toNullableNumber(row.statusId);

    if (statusId === null) {
      continue;
    }

    statusById.set(statusId, row.status);
  }

  const resultsByRaceId = new Map<number, RaceResult[]>();

  for (const row of resultRows) {
    const raceId = toNullableNumber(row.raceId);
    const resultId = toNullableNumber(row.resultId);
    const driverId = toNullableNumber(row.driverId);
    const positionOrder = toNullableNumber(row.positionOrder);

    if (
      raceId === null ||
      resultId === null ||
      driverId === null ||
      positionOrder === null
    ) {
      continue;
    }

    addToMapArray(resultsByRaceId, raceId, {
      resultId,
      raceId,
      driverId,
      constructorId: toNullableNumber(row.constructorId),
      position: toNullableNumber(row.position),
      positionOrder,
      points: toNullableNumber(row.points) ?? 0,
      statusId: toNullableNumber(row.statusId),
      sessionType: 'race',
    });
  }

  const sprintResultsByRaceId = new Map<number, RaceResult[]>();

  for (const row of sprintRows) {
    const raceId = toNullableNumber(row.raceId);
    const resultId = toNullableNumber(row.resultId);
    const driverId = toNullableNumber(row.driverId);
    const positionOrder = toNullableNumber(row.positionOrder);

    if (
      raceId === null ||
      resultId === null ||
      driverId === null ||
      positionOrder === null
    ) {
      continue;
    }

    addToMapArray(sprintResultsByRaceId, raceId, {
      resultId,
      raceId,
      driverId,
      constructorId: toNullableNumber(row.constructorId),
      position: toNullableNumber(row.position),
      positionOrder,
      points: toNullableNumber(row.points) ?? 0,
      statusId: toNullableNumber(row.statusId),
      sessionType: 'sprint',
    });
  }

  const driverStandingsByRaceId = new Map<number, DriverStanding[]>();

  for (const row of driverStandingRows) {
    const raceId = toNullableNumber(row.raceId);
    const driverId = toNullableNumber(row.driverId);

    if (raceId === null || driverId === null) {
      continue;
    }

    addToMapArray(driverStandingsByRaceId, raceId, {
      raceId,
      driverId,
      points: toNullableNumber(row.points) ?? 0,
      position: toNullableNumber(row.position),
      wins: toNullableNumber(row.wins) ?? 0,
    });
  }

  const constructorStandingsByRaceId = new Map<number, ConstructorStanding[]>();

  for (const row of constructorStandingRows) {
    const raceId = toNullableNumber(row.raceId);
    const constructorId = toNullableNumber(row.constructorId);

    if (raceId === null || constructorId === null) {
      continue;
    }

    addToMapArray(constructorStandingsByRaceId, raceId, {
      raceId,
      constructorId,
      points: toNullableNumber(row.points) ?? 0,
      position: toNullableNumber(row.position),
      wins: toNullableNumber(row.wins) ?? 0,
    });
  }

  return {
    years,
    eventsByYear,
    eventByRaceId,
    circuitsById,
    driversById,
    constructorsById,
    statusById,
    resultsByRaceId,
    sprintResultsByRaceId,
    driverStandingsByRaceId,
    constructorStandingsByRaceId,
  };
}

export function getDataset() {
  if (!cachedDataset) {
    cachedDataset = buildDataset();
  }

  return cachedDataset;
}
