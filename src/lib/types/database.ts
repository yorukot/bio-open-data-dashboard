export interface AnimalAggregatedRow {
  county: string;
  animal_type: string;
  year: number;
  month: number;
  season: number;
  total_amount: string; // PostgreSQL returns numeric as string
  event_count: string; // PostgreSQL returns numeric as string
}

export interface DatasetStatsRow {
  dataset: string;
  county: string;
  year: number;
  month: number;
  count: string; // PostgreSQL returns numeric as string
}

export interface CountyAnimalData {
  county: string;
  animals: Array<{
    animal_type: string;
    total_amount: number;
    event_count: number;
  }>;
}

export interface MonthlyEventData {
  month: number;
  event_count: number;
}

export interface CountyTotalData {
  county: string;
  total_amount: number;
}

export interface DatasetStatsData {
  dataset: string;
  count: number;
}

export type DatabaseParams = (string | number)[];