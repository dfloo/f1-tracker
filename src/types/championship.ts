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
