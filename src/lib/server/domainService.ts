import {
  getConstructorColor,
  getDataset,
  type ConstructorStanding,
  type DriverStanding,
  type RaceResult,
  type SessionType,
} from '@/lib/server/f1Repository';

const defaultColor = '#8A8A8A';

type PointsPoint = {
  eventId: number;
  cumulativePoints: number;
};

type StandingSeries = {
  id: string;
  name: string;
  color: string;
  pointsByEvent: PointsPoint[];
  latestPoints: number;
  position: number | null;
};

function getDriverName(driverId: number) {
  const dataset = getDataset();
  const driver = dataset.driversById.get(driverId);

  if (!driver) {
    return `Driver ${driverId}`;
  }

  return `${driver.forename} ${driver.surname}`.trim();
}

function getDriverColorForSeason(driverId: number, raceIds: number[]) {
  const dataset = getDataset();

  for (let index = raceIds.length - 1; index >= 0; index -= 1) {
    const raceId = raceIds[index];
    const raceResults = dataset.resultsByRaceId.get(raceId) ?? [];
    const result = raceResults.find((entry) => entry.driverId === driverId);

    if (!result?.constructorId) {
      continue;
    }

    const constructor = dataset.constructorsById.get(result.constructorId);
    return getConstructorColor(constructor?.constructorRef ?? null);
  }

  return defaultColor;
}

function toStandingSeriesFromDrivers(params: {
  raceIds: number[];
  standingsByRaceId: Map<number, DriverStanding[]>;
}): StandingSeries[] {
  const allDriverIds = new Set<number>();

  for (const raceId of params.raceIds) {
    for (const row of params.standingsByRaceId.get(raceId) ?? []) {
      allDriverIds.add(row.driverId);
    }
  }

  const series = Array.from(allDriverIds).map((driverId) => {
    let latestPoints = 0;
    let latestPosition: number | null = null;

    const pointsByEvent: PointsPoint[] = params.raceIds.map((raceId) => {
      const row = (params.standingsByRaceId.get(raceId) ?? []).find(
        (entry) => entry.driverId === driverId,
      );

      if (row) {
        latestPoints = row.points;
        latestPosition = row.position;
      }

      return {
        eventId: raceId,
        cumulativePoints: latestPoints,
      };
    });

    return {
      id: String(driverId),
      name: getDriverName(driverId),
      color: getDriverColorForSeason(driverId, params.raceIds),
      pointsByEvent,
      latestPoints,
      position: latestPosition,
    };
  });

  return series.sort((left, right) => {
    if (right.latestPoints !== left.latestPoints) {
      return right.latestPoints - left.latestPoints;
    }

    return left.name.localeCompare(right.name);
  });
}

function toStandingSeriesFromConstructors(params: {
  raceIds: number[];
  standingsByRaceId: Map<number, ConstructorStanding[]>;
}): StandingSeries[] {
  const dataset = getDataset();
  const allConstructorIds = new Set<number>();

  for (const raceId of params.raceIds) {
    for (const row of params.standingsByRaceId.get(raceId) ?? []) {
      allConstructorIds.add(row.constructorId);
    }
  }

  const series = Array.from(allConstructorIds).map((constructorId) => {
    let latestPoints = 0;
    let latestPosition: number | null = null;

    const pointsByEvent: PointsPoint[] = params.raceIds.map((raceId) => {
      const row = (params.standingsByRaceId.get(raceId) ?? []).find(
        (entry) => entry.constructorId === constructorId,
      );

      if (row) {
        latestPoints = row.points;
        latestPosition = row.position;
      }

      return {
        eventId: raceId,
        cumulativePoints: latestPoints,
      };
    });

    const constructor = dataset.constructorsById.get(constructorId);

    return {
      id: String(constructorId),
      name: constructor?.name ?? `Constructor ${constructorId}`,
      color: getConstructorColor(constructor?.constructorRef ?? null),
      pointsByEvent,
      latestPoints,
      position: latestPosition,
    };
  });

  return series.sort((left, right) => {
    if (right.latestPoints !== left.latestPoints) {
      return right.latestPoints - left.latestPoints;
    }

    return left.name.localeCompare(right.name);
  });
}

export function getAvailableSeasons() {
  const dataset = getDataset();
  return dataset.years;
}

export function getEventsBySeason(season: number) {
  const dataset = getDataset();
  const events = dataset.eventsByYear.get(season);

  if (!events || events.length === 0) {
    return null;
  }

  return events.map((event) => ({
    eventId: event.raceId,
    season: event.year,
    round: event.round,
    name: event.name,
    date: event.date,
    time: event.time,
    circuit:
      event.circuitId !== null ? dataset.circuitsById.get(event.circuitId) ?? null : null,
    sessions: {
      practice1: event.sessions.fp1Date
        ? { date: event.sessions.fp1Date, time: event.sessions.fp1Time }
        : null,
      practice2: event.sessions.fp2Date
        ? { date: event.sessions.fp2Date, time: event.sessions.fp2Time }
        : null,
      practice3: event.sessions.fp3Date
        ? { date: event.sessions.fp3Date, time: event.sessions.fp3Time }
        : null,
      qualifying: event.sessions.qualifyingDate
        ? { date: event.sessions.qualifyingDate, time: event.sessions.qualifyingTime }
        : null,
      sprint: event.sessions.sprintDate
        ? { date: event.sessions.sprintDate, time: event.sessions.sprintTime }
        : null,
    },
  }));
}

export function getDriversDirectory() {
  const dataset = getDataset();

  return Array.from(dataset.driversById.values())
    .map((driver) => ({
      id: String(driver.driverId),
      ref: driver.driverRef,
      name: `${driver.forename} ${driver.surname}`.trim(),
      code: driver.code,
      nationality: driver.nationality,
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function getDriverById(driverId: number) {
  const dataset = getDataset();
  const driver = dataset.driversById.get(driverId);

  if (!driver) {
    return null;
  }

  return {
    id: String(driver.driverId),
    ref: driver.driverRef,
    name: `${driver.forename} ${driver.surname}`.trim(),
    code: driver.code,
    nationality: driver.nationality,
  };
}

export function getConstructorsDirectory() {
  const dataset = getDataset();

  return Array.from(dataset.constructorsById.values())
    .map((constructor) => ({
      id: String(constructor.constructorId),
      ref: constructor.constructorRef,
      name: constructor.name,
      nationality: constructor.nationality,
      color: getConstructorColor(constructor.constructorRef),
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function getConstructorById(constructorId: number) {
  const dataset = getDataset();
  const constructor = dataset.constructorsById.get(constructorId);

  if (!constructor) {
    return null;
  }

  return {
    id: String(constructor.constructorId),
    ref: constructor.constructorRef,
    name: constructor.name,
    nationality: constructor.nationality,
    color: getConstructorColor(constructor.constructorRef),
  };
}

function sortResults(results: RaceResult[]) {
  return [...results].sort((left, right) => left.positionOrder - right.positionOrder);
}

function toResultResponseRows(results: RaceResult[]) {
  const dataset = getDataset();

  return sortResults(results).map((row) => {
    const driver = dataset.driversById.get(row.driverId);
    const constructor =
      row.constructorId !== null ? dataset.constructorsById.get(row.constructorId) : null;

    return {
      resultId: row.resultId,
      eventId: row.raceId,
      sessionType: row.sessionType,
      driver: {
        id: String(row.driverId),
        name: driver
          ? `${driver.forename} ${driver.surname}`.trim()
          : `Driver ${row.driverId}`,
        code: driver?.code ?? null,
      },
      constructor:
        row.constructorId !== null
          ? {
            id: String(row.constructorId),
            name: constructor?.name ?? `Constructor ${row.constructorId}`,
            color: getConstructorColor(constructor?.constructorRef ?? null),
          }
          : null,
      position: row.position,
      points: row.points,
      status:
        row.statusId !== null
          ? (dataset.statusById.get(row.statusId) ?? 'Unknown')
          : 'Unknown',
    };
  });
}

export function getResultsBySeason(params: {
  season: number;
  sessionType: SessionType | 'all';
}) {
  const dataset = getDataset();
  const events = dataset.eventsByYear.get(params.season);

  if (!events || events.length === 0) {
    return null;
  }

  const rows = events.flatMap((event) => {
    if (params.sessionType === 'race') {
      return toResultResponseRows(dataset.resultsByRaceId.get(event.raceId) ?? []);
    }

    if (params.sessionType === 'sprint') {
      return toResultResponseRows(dataset.sprintResultsByRaceId.get(event.raceId) ?? []);
    }

    return [
      ...toResultResponseRows(dataset.resultsByRaceId.get(event.raceId) ?? []),
      ...toResultResponseRows(dataset.sprintResultsByRaceId.get(event.raceId) ?? []),
    ];
  });

  return {
    season: params.season,
    sessionType: params.sessionType,
    results: rows,
  };
}

export function getStandingsBySeason(params: {
  season: number;
  championship: 'drivers' | 'constructors';
}) {
  const dataset = getDataset();
  const events = dataset.eventsByYear.get(params.season);

  if (!events || events.length === 0) {
    return null;
  }

  const timeline = events.map((event) => ({
    eventId: event.raceId,
    round: event.round,
    name: event.name,
    date: event.date,
    sessionType: 'race' as const,
  }));

  const raceIds = timeline.map((entry) => entry.eventId);

  const series =
    params.championship === 'drivers'
      ? toStandingSeriesFromDrivers({
        raceIds,
        standingsByRaceId: dataset.driverStandingsByRaceId,
      })
      : toStandingSeriesFromConstructors({
        raceIds,
        standingsByRaceId: dataset.constructorStandingsByRaceId,
      });

  return {
    season: params.season,
    championship: params.championship,
    timeline,
    series,
  };
}

export function getDriversSeasonCards(season: number) {
  const standings = getStandingsBySeason({
    season,
    championship: 'drivers',
  });

  if (!standings) {
    return null;
  }

  return {
    availableYears: getAvailableSeasons(),
    data: {
      year: season,
      drivers: standings.series.map((row) => ({
        id: row.id,
        name: row.name,
        latestPoints: row.latestPoints,
      })),
    },
  };
}

export function getChampionshipCompatibilityPayload(season: number) {
  const dataset = getDataset();
  const events = dataset.eventsByYear.get(season);
  const standings = getStandingsBySeason({
    season,
    championship: 'drivers',
  });

  if (!events || !standings) {
    return null;
  }

  const raceIds = events.map((event) => event.raceId);

  const drivers = standings.series
    .filter((row) => row.latestPoints > 0)
    .map((row) => {
      const driverId = Number(row.id);

      const raceResults = raceIds.map((raceId) => {
        const result = (dataset.resultsByRaceId.get(raceId) ?? []).find(
          (entry) => entry.driverId === driverId,
        );

        const constructor =
          result?.constructorId !== null && result?.constructorId !== undefined
            ? dataset.constructorsById.get(result.constructorId)
            : null;

        return {
          constructorId:
            result?.constructorId !== null && result?.constructorId !== undefined
              ? String(result.constructorId)
              : null,
          constructorName: constructor?.name ?? null,
          constructorColor: getConstructorColor(constructor?.constructorRef ?? null),
          racePoints: result?.points ?? 0,
        };
      });

      const cumulativePoints = row.pointsByEvent.map((point) => point.cumulativePoints);

      return {
        id: row.id,
        name: row.name,
        color: row.color,
        cumulativePoints,
        raceResults,
      };
    });

  return {
    availableYears: getAvailableSeasons(),
    data: {
      year: season,
      races: events.map((event) => ({ round: event.round, name: event.name })),
      drivers,
    },
  };
}
