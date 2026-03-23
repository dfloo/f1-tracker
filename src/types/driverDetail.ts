export interface DriverDetailHeader {
  id: string;
  name: string;
  number: string | null;
  constructorName: string | null;
  currentPoints: number;
}

export interface DriverRaceOption {
  id: string;
  round: number;
  name: string;
}

export interface DriverQualifyingBreakdown {
  q1: string | null;
  q2: string | null;
  q3: string | null;
}

export interface DriverLapTimePoint {
  lap: number;
  time: number;
  minTime?: number;
  maxTime?: number;
  avgTime?: number;
}

export interface DriverSeasonPointsPoint {
  raceId: string;
  round: number;
  name: string;
  racePoints: number;
  cumulativePoints: number;
}

export interface DriverSelectedRaceContext {
  id: string;
  round: number;
  name: string;
  startingPosition: number | null;
  racePoints: number;
  cumulativePoints: number;
  qualifying: DriverQualifyingBreakdown | null;
  raceScore?: number | null;
  seasonScore?: number | null;
  endingPosition?: number | string | null;
  lapTimes: DriverLapTimePoint[];
}

export interface DriverDetailData {
  year: number;
  driver: DriverDetailHeader;
  races: DriverRaceOption[];
  selectedRace: DriverSelectedRaceContext | null;
  seasonPoints: DriverSeasonPointsPoint[];
}

export interface DriverDetailResponse {
  availableYears: number[];
  data: DriverDetailData;
}
