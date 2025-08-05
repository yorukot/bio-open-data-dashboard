"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/lib/api-client';
import { LightDataParams, LightDataRecord } from '@/lib/types/api';

interface UseProgressiveLightDataProps {
  params: LightDataParams;
  enabled?: boolean;
  batchSize?: number;
}

interface ProgressiveLightDataResult {
  data: LightDataRecord[];
  isLoading: boolean;
  error: Error | null;
  progress: {
    loaded: number;
    total: number | null;
    hasMore: boolean;
    currentPage: number;
  };
}

export function useProgressiveLightData({ 
  params, 
  enabled = true, 
  batchSize = 5000 
}: UseProgressiveLightDataProps): ProgressiveLightDataResult {
  const [data, setData] = useState<LightDataRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState({
    loaded: 0,
    total: null as number | null,
    hasMore: true,
    currentPage: 0
  });
  
  const currentRequestRef = useRef<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchBatch = useCallback(async (offset: number) => {
    try {
      const response = await apiClient.getLightData({
        ...params,
        limit: batchSize,
        offset
      });

      return {
        data: response.data || [],
        total: response.pagination?.total || 0,
        hasMore: response.pagination?.has_more || false
      };
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to fetch light data');
    }
  }, [JSON.stringify(params), batchSize]);

  const loadAllData = useCallback(async () => {
    if (!enabled || !params.start_time || !params.end_time) return;

    // Prevent multiple simultaneous loads
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    setData([]);
    setProgress({
      loaded: 0,
      total: null,
      hasMore: true,
      currentPage: 0
    });

    try {
      let offset = 0;
      let hasMore = true;
      let allData: LightDataRecord[] = [];
      let totalRecords: number | null = null;
      let currentPage = 0;

      console.log('Starting progressive light data fetch...');

      while (hasMore) {
        console.log(`Fetching batch ${currentPage + 1}, offset: ${offset}`);
        
        const batch = await fetchBatch(offset);
        
        // Set total on first batch
        if (totalRecords === null) {
          totalRecords = batch.total;
          console.log(`Total light pollution records available: ${totalRecords}`);
        }

        // Add new data
        allData = [...allData, ...batch.data];
        hasMore = batch.hasMore && batch.data.length > 0;
        currentPage++;

        // Calculate progress percentage
        const progressPercent = totalRecords ? (allData.length / totalRecords) * 100 : 0;
        
        // Only update state/render at specific milestones: 25%, 50%, 75%, 100%
        const shouldRender = progressPercent >= 25 && (
          progressPercent >= 100 || // Always render at 100%
          (progressPercent >= 75 && allData.length <= totalRecords * 0.76) || // Render once at 75%
          (progressPercent >= 50 && allData.length <= totalRecords * 0.51) || // Render once at 50%  
          (progressPercent >= 25 && allData.length <= totalRecords * 0.26)    // Render once at 25%
        );

        if (shouldRender || !hasMore) {
          console.log(`🎯 Rendering at ${progressPercent.toFixed(1)}% - ${allData.length}/${totalRecords} records`);
          setData([...allData]);
        }

        // Always update progress for loading indicator
        setProgress({
          loaded: allData.length,
          total: totalRecords,
          hasMore,
          currentPage
        });

        console.log(`Light data progress: ${allData.length}/${totalRecords} (${progressPercent.toFixed(1)}%)`);

        // Move to next batch
        offset += batchSize;

        // Small delay to prevent overwhelming the API
        if (hasMore) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      console.log(`Completed loading ${allData.length} light pollution records`);
      
    } catch (err) {
      console.error('Error loading progressive light data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [enabled, params.start_time, params.end_time, fetchBatch, isLoading]);

  // Start loading when key params change
  useEffect(() => {
    const requestKey = `${enabled}-${params.start_time}-${params.end_time}`;
    
    // Only load if this is a new request
    if (requestKey !== currentRequestRef.current && enabled && params.start_time && params.end_time) {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      currentRequestRef.current = requestKey;
      abortControllerRef.current = new AbortController();
      
      loadAllData();
    }
  }, [enabled, params.start_time, params.end_time, loadAllData]);

  return {
    data,
    isLoading,
    error,
    progress
  };
}