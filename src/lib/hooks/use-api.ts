import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { apiClient, APIError } from '../api-client';
import {
  LightDataParams,
  TBIADataParams,
  LightDataResponse,
  TBIADataResponse
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

export type UseLightDataOptions = Omit<UseQueryOptions<LightDataResponse, APIError>, 'queryKey' | 'queryFn'>;
export type UseTBIADataOptions = Omit<UseQueryOptions<TBIADataResponse, APIError>, 'queryKey' | 'queryFn'>;