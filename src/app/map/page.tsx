"use client";

import React, { useRef, useEffect, useMemo, useCallback } from "react";
import Map, { MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useSearchParams, useRouter } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";
import { MapControlPanel, DisplayMode } from "@/components/map-control-panel";
import { useTBIAData } from "@/lib/hooks/use-api";
import { useProgressiveLightData } from "@/hooks/use-progressive-light-data";
import { convertTBIADataToGeoJSON } from "@/lib/utils/geojson";
import { convertLightDataToGeoJSON } from "@/lib/utils/light-geojson";
import { useAnimalMapLayers } from "@/hooks/use-animal-map-layers";
import { useLightMapLayers } from "@/hooks/use-light-map-layers";
import { LightPollutionLoading } from "@/components/light-pollution-loading";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

interface MapContentProps {
  displayMode: DisplayMode;
  currentDate: Date;
  onDisplayModeChange: (mode: DisplayMode) => void;
  onDateChange: (date: Date) => void;
}

function MapContent({
  displayMode,
  currentDate,
  onDisplayModeChange,
  onDateChange,
}: MapContentProps) {
  const mapRef = useRef<MapRef>(null);
  const { open } = useSidebar();

  // Generate date range for the selected month
  const dateRange = useMemo(() => {
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    return {
      start_time: startOfMonth.toISOString(),
      end_time: endOfMonth.toISOString(),
    };
  }, [currentDate]);

  // Fetch animal data for the selected month
  const { data: animalData, error: animalError } = useTBIAData(
    {
      ...dateRange,
      limit: 1000, // Reasonable limit for map performance
    },
    {
      enabled: displayMode === "bio" || displayMode === "bio-light",
    }
  );

  // Fetch light pollution data progressively for the selected month
  const {
    data: lightDataRecords,
    error: lightError,
    isLoading: lightLoading,
    progress: lightProgress,
  } = useProgressiveLightData({
    params: {
      ...dateRange,
    },
    enabled: displayMode === "light" || displayMode === "bio-light",
    batchSize: 100000,
  });

  // Debug logging
  useEffect(() => {
    if (animalError) {
      console.error("TBIA API Error:", animalError);
    }
    if (animalData) {
      console.log("TBIA data loaded:", animalData.data?.length, "records");
    }
  }, [animalData, animalError]);

  useEffect(() => {
    if (lightError) {
      console.error("Light API Error:", lightError);
    }
    if (lightDataRecords.length > 0) {
      console.log("Light data loaded:", lightDataRecords.length, "records");
      console.log(
        "Progress:",
        lightProgress.loaded,
        "/",
        lightProgress.total,
        `(${
          lightProgress.total
            ? ((lightProgress.loaded / lightProgress.total) * 100).toFixed(1)
            : 0
        }%)`
      );
    }
  }, [lightDataRecords, lightError, lightProgress]);

  // Convert TBIA data to GeoJSON format
  const animalGeoJSON = React.useMemo(() => {
    return convertTBIADataToGeoJSON(animalData?.data || []);
  }, [animalData]);

  // Convert light data to GeoJSON format
  const lightGeoJSON = React.useMemo(() => {
    return convertLightDataToGeoJSON(lightDataRecords);
  }, [lightDataRecords]);

  // Use custom hooks for map layer management
  useAnimalMapLayers({
    map: mapRef.current?.getMap() || null,
    geoJSON: animalGeoJSON,
    displayMode,
  });

  useLightMapLayers({
    map: mapRef.current?.getMap() || null,
    geoJSON: lightGeoJSON,
    displayMode,
  });

  useEffect(() => {
    // Trigger map resize when sidebar state changes
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    }, 300); // Wait for sidebar animation to complete

    return () => clearTimeout(timer);
  }, [open]);

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-hidden relative">
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: 120.9605,
            latitude: 23.6978,
            zoom: 7,
          }}
          maxBounds={[
            [118.0, 21.8], // Southwest corner
            [122.2, 26.5], // Northeast corner
          ]}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
          mapboxAccessToken={MAPBOX_TOKEN}
          language="zh-Hant"
        />
        <MapControlPanel
          displayMode={displayMode}
          onDisplayModeChange={onDisplayModeChange}
          currentDate={currentDate}
          onDateChange={onDateChange}
        />

        <LightPollutionLoading
          isVisible={
            (displayMode === "light" || displayMode === "bio-light") &&
            lightLoading
          }
          progress={lightProgress}
        />
      </div>
    </main>
  );
}

export default function MapPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get URL parameters with fallback defaults
  const urlDisplayMode = searchParams.get("mode") as DisplayMode;
  const urlMonth = searchParams.get("month");

  // Validate display mode from URL
  const validDisplayModes: DisplayMode[] = ["bio", "light", "bio-light"];
  const displayMode = validDisplayModes.includes(urlDisplayMode)
    ? urlDisplayMode
    : "bio";

  // Parse date from URL or use current date
  const currentDate = useMemo(() => {
    if (urlMonth && /^\d{4}-\d{2}$/.test(urlMonth)) {
      const [year, month] = urlMonth.split("-").map(Number);
      return new Date(year, month - 1, 1);
    }
    return new Date();
  }, [urlMonth]);

  // Helper function to update URL without adding to history
  const updateURL = useCallback(
    (newMode?: DisplayMode, newDate?: Date) => {
      const params = new URLSearchParams(searchParams.toString());

      if (newMode) {
        params.set("mode", newMode);
      }

      if (newDate) {
        const year = newDate.getFullYear();
        const month = String(newDate.getMonth() + 1).padStart(2, "0");
        params.set("month", `${year}-${month}`);
      }

      router.replace(`/map?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  // State update handlers that also update URL
  const handleDisplayModeChange = useCallback(
    (mode: DisplayMode) => {
      updateURL(mode, undefined);
    },
    [updateURL]
  );

  const handleDateChange = useCallback(
    (date: Date) => {
      updateURL(undefined, date);
    },
    [updateURL]
  );

  // Initialize URL parameters on first load
  useEffect(() => {
    const hasParams = searchParams.has("mode") || searchParams.has("month");
    if (!hasParams) {
      updateURL(displayMode, currentDate);
    }
  }, []); // Only run on mount

  return (
    <MapContent
      displayMode={displayMode}
      currentDate={currentDate}
      onDisplayModeChange={handleDisplayModeChange}
      onDateChange={handleDateChange}
    />
  );
}
