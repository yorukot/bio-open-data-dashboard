import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { apiClient, APIError } from '../api-client';
import {
  LightDataParams,
  TBIADataParams,
  LightDataResponse,
  TBIADataResponse,
  AreaAnimalParams,
  AreaAnimalResponse,
  AreaRatioParams,
  AreaRatioResponse,
  SpeciesTimelineParams,
  SpeciesTimelineResponse,
  DatasetStatsParams,
  DatasetStatsResponse
} from '../types/api';

export function createQueryKey(endpoint: string, params: Record<string, any> = {}) {
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );
  return [endpoint, filteredParams];
}

export function useLightData(
  params: LightDataParams,
  options?: Omit<UseQueryOptions<LightDataResponse, APIError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: createQueryKey('light-data', params),
    queryFn: () => apiClient.getLightData(params),
    enabled: !!(params.start_time && params.end_time),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useTBIAData(
  params: TBIADataParams = {},
  options?: Omit<UseQueryOptions<TBIADataResponse, APIError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: createQueryKey('tbia-data', params),
    queryFn: () => apiClient.getTBIAData(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useLightPollutionDistribution(
  params: { start_time: string; end_time: string },
  options?: Omit<UseQueryOptions<{ data: Array<{ county: string; data: Array<{ month: number; light_pollution_average: number }> }>; time_range: { start: string; end: string } }, APIError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: createQueryKey('light-pollution-distribution', params),
    queryFn: () => apiClient.getLightPollutionDistribution(params),
    enabled: !!(params.start_time && params.end_time),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useLightPollutionTimeline(
  params: { county: string; year: string },
  options?: Omit<UseQueryOptions<{ county: string; year: number; data: Array<{ month: number; light_pollution_average: number }>; total_months: number }, APIError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: createQueryKey('light-pollution-timeline', params),
    queryFn: () => apiClient.getLightPollutionTimeline(params),
    enabled: !!(params.county && params.year),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useLightPollutionSourceRatio(
  params: { month: number; year?: number },
  options?: Omit<UseQueryOptions<{ data: Array<{ area: string; light_pollution_average: number }>; month: number; year?: number; total_regions: number }, APIError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: createQueryKey('light-pollution-source-ratio', params),
    queryFn: () => apiClient.getLightPollutionSourceRatio(params),
    enabled: !!params.month,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useAreaAnimalAmount(
  params: AreaAnimalParams,
  options?: Omit<UseQueryOptions<AreaAnimalResponse, APIError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: createQueryKey('area-animal-amount', params),
    queryFn: () => apiClient.getAreaAnimalAmount(params),
    enabled: !!(params.start_time && params.end_time),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useAreaRatio(
  params: AreaRatioParams,
  options?: Omit<UseQueryOptions<AreaRatioResponse, APIError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: createQueryKey('area-ratio', params),
    queryFn: () => apiClient.getAreaRatio(params),
    enabled: !!(params.start_time && params.end_time),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useSpeciesTimeline(
  params: SpeciesTimelineParams,
  options?: Omit<UseQueryOptions<SpeciesTimelineResponse, APIError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: createQueryKey('species-timeline', params),
    queryFn: () => apiClient.getSpeciesTimeline(params),
    enabled: !!(params.animal_type && params.year),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useDatasetStats(
  params: DatasetStatsParams = {},
  options?: Omit<UseQueryOptions<DatasetStatsResponse, APIError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: createQueryKey('dataset-stats', params),
    queryFn: () => apiClient.getDatasetStats(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export type UseLightDataOptions = Omit<UseQueryOptions<LightDataResponse, APIError>, 'queryKey' | 'queryFn'>;
export type UseTBIADataOptions = Omit<UseQueryOptions<TBIADataResponse, APIError>, 'queryKey' | 'queryFn'>;