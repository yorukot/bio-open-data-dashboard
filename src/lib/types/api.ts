export interface LightDataRecord {
  time: string;
  longitude: number;
  latitude: number;
  brightness: number;
}

export interface TBIADataRecord {
  id: number;
  source_scientific_name?: string | null;
  scientific_name?: string | null;
  common_name_c?: string | null;
  bio_group?: '鳥類' | '兩棲類' | '哺乳類' | '爬蟲類' | '魚類' | '昆蟲' | '蜘蛛' | null;
  event_date?: string | null;
  created?: string | null;
  dataset_name?: string | null;
  basis_of_record?: string | null;
  standard_latitude?: number | null;
  standard_longitude?: number | null;
  county?: string | null;
  municipality?: string | null;
  locality?: string | null;
  organism_quantity?: string | null;
  taxon_id?: string | null;
  catalog_number?: string | null;
  record_number?: string | null;
}

export interface PaginationInfo {
  total: number;
  limit?: number | null;
  offset: number;
  has_more: boolean;
}

export interface TimeRange {
  start: string;
  end: string;
}

export interface TBIAFilters {
  time_range: TimeRange;
  bio_group?: string | null;
  common_name_c?: string | null;
  county?: string | null;
  municipality?: string | null;
  locality?: string | null;
}

export interface ApiError {
  error: string;
}

export interface LightDataParams {
  start_time: string;
  end_time: string;
  limit?: number;
  offset?: number;
}

export interface TBIADataParams {
  start_time?: string;
  end_time?: string;
  bio_group?: '鳥類' | '兩棲類' | '哺乳類' | '爬蟲類' | '魚類' | '昆蟲' | '蜘蛛';
  common_name_c?: string;
  county?: string;
  municipality?: string;
  locality?: string;
  limit?: number;
  offset?: number;
}

export interface LightDataResponse {
  data: LightDataRecord[];
  pagination: PaginationInfo;
  time_range: TimeRange;
}

export interface TBIADataResponse {
  data: TBIADataRecord[];
  pagination: PaginationInfo;
  filters: TBIAFilters;
}

export type BioGroup = '鳥類' | '兩棲類' | '哺乳類' | '爬蟲類' | '魚類' | '昆蟲' | '蜘蛛';

export const BIO_GROUPS: BioGroup[] = ['鳥類', '兩棲類', '哺乳類', '爬蟲類', '魚類', '昆蟲', '蜘蛛'];

export interface AreaAnimalParams {
  start_time: string;
  end_time: string;
}

export interface AreaAnimalData {
  county: string;
  animals: Array<{
    animal_type: string;
    total_amount: number;
    event_count: number;
  }>;
}

export interface AreaAnimalResponse {
  data: AreaAnimalData[];
  time_range: TimeRange;
}

export interface AreaRatioParams {
  start_time: string;
  end_time: string;
}

export interface AreaRatioData {
  county: string;
  animals: Array<{
    animal_type: string;
    total_amount: number;
    event_count: number;
  }>;
}

export interface AreaRatioResponse {
  data: AreaRatioData[];
  time_range: TimeRange;
}

export interface SpeciesTimelineParams {
  animal_type: string;
  year: number;
}

export interface SpeciesTimelineData {
  month: number;
  event_count: number;
}

export interface SpeciesTimelineResponse {
  data: SpeciesTimelineData[];
  animal_type: string;
  year: number;
}

export interface DatasetStatsParams {
  county?: string;
}

export interface DatasetStatsData {
  dataset: string;
  count: number;
}

export interface DatasetStatsResponse {
  data: DatasetStatsData[];
  county: string;
}

export interface SeasonAnimalAmountParams {
  year: string;
  season: string;
  county?: string;
}

export interface SeasonAnimalAmountData {
  county: string;
  animals: Array<{
    animal_type: string;
    total_amount: number;
    event_count: number;
  }>;
}

export interface SeasonAnimalAmountResponse {
  data: SeasonAnimalAmountData[];
  year: number;
  season: number;
  county: string;
}

// Season Animal Ratio (same data shape as amount; used for pie chart ratios)
export interface SeasonAnimalRatioParams {
  year: string;
  season: string;
  county?: string;
}

export interface SeasonAnimalRatioData {
  county: string;
  animals: Array<{
    animal_type: string;
    total_amount: number;
    event_count: number;
  }>;
}

export interface SeasonAnimalRatioResponse {
  data: SeasonAnimalRatioData[];
  year: number;
  season: number;
  county: string;
}
