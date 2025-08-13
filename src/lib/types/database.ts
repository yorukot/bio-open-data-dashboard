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

export interface LightDataWithCountyRow {
  id: number;
  time: string; // ISO timestamp
  longitude: number;
  latitude: number;
  brightness: string; // PostgreSQL returns numeric as string
  county: string;
}

export interface LightAggregationRow {
  county: string;
  month: string; // PostgreSQL returns month as string
  avg_brightness: string; // PostgreSQL returns numeric as string
}

export interface CountyBrightnessRow {
  county: string;
  avg_brightness: string; // PostgreSQL returns numeric as string
}

export interface CountyLightData {
  county: string;
  data: Array<{
    month: number;
    light_pollution_average: number;
  }>;
}

export interface AreaLightData {
  area: string;
  light_pollution_average: number;
}

export type DatabaseParams = (string | number)[];