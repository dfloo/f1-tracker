export type ChampionshipCategory = 'drivers' | 'constructors';

export interface ChampionshipRace {
  round: number;
  name: string;
}

export interface ChampionshipSeries {
  id: string;
  name: string;
  color: string;
  points: number[];
}

export interface DriverRaceResult {
  constructorId: string | null;
  constructorName: string | null;
  constructorColor: string;
  racePoints: number;
}

export interface ChampionshipDriverSeries {
  id: string;
  name: string;
  color: string;
  cumulativePoints: number[];
  raceResults: DriverRaceResult[];
}

export interface ChampionshipYearData {
  year: number;
  races: ChampionshipRace[];
  drivers: ChampionshipDriverSeries[];
}

export interface ChampionshipProgress {
  year: number;
  category: ChampionshipCategory;
  races: ChampionshipRace[];
  series: ChampionshipSeries[];
}

export interface ChampionshipYearResponse {
  availableYears: number[];
  data: ChampionshipYearData;
}

export interface DriverSeasonCard {
  id: string;
  name: string;
  latestPoints: number;
}

export interface DriversSeasonData {
  year: number;
  drivers: DriverSeasonCard[];
}

export interface DriversSeasonResponse {
  availableYears: number[];
  data: DriversSeasonData;
}

export interface ConstructorSeasonCard {
  id: string;
  name: string;
  latestPoints: number;
  color: string;
}

export interface ConstructorsSeasonData {
  year: number;
  constructors: ConstructorSeasonCard[];
}

export interface ConstructorsSeasonResponse {
  availableYears: number[];
  data: ConstructorsSeasonData;
}

export interface EventSeasonCard {
  id: string | null;
  round: number;
  name: string;
}

export interface EventsSeasonData {
  year: number;
  events: EventSeasonCard[];
}

export interface EventsSeasonResponse {
  availableYears: number[];
  data: EventsSeasonData;
}
