"use client";

import React, { useRef, useEffect, useState } from "react";
import Map, { MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useSidebar } from "@/components/ui/sidebar";
import { MapControlPanel, DisplayMode } from "@/components/map-control-panel";
import { useTBIAData } from "@/lib/hooks/use-api";
import { convertTBIADataToGeoJSON } from "@/lib/utils/geojson";
import { useAnimalMapLayers } from "@/hooks/use-animal-map-layers";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

function MapContent() {
  const mapRef = useRef<MapRef>(null);
  const { open } = useSidebar();
  const [displayMode, setDisplayMode] = useState<DisplayMode>("bio");
  const [currentDate, setCurrentDate] = useState(new Date());

  // Generate date range for the selected month
  const dateRange = React.useMemo(() => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
    
    return {
      start_time: startOfMonth.toISOString(),
      end_time: endOfMonth.toISOString()
    };
  }, [currentDate]);

  // Fetch animal data for the selected month
  const { data: animalData, error } = useTBIAData({
    ...dateRange,
    limit: 1000, // Reasonable limit for map performance
  }, {
    enabled: displayMode === "bio" || displayMode === "bio-light"
  });

  // Debug logging
  useEffect(() => {
    if (error) {
      console.error('TBIA API Error:', error);
    }
    if (animalData) {
      console.log('TBIA data loaded:', animalData.data?.length, 'records');
    }
  }, [animalData, error]);

  // Convert TBIA data to GeoJSON format
  const animalGeoJSON = React.useMemo(() => {
    return convertTBIADataToGeoJSON(animalData?.data || []);
  }, [animalData]);

  // Use custom hook for map layer management
  useAnimalMapLayers({
    map: mapRef.current?.getMap() || null,
    geoJSON: animalGeoJSON,
    displayMode
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
          onDisplayModeChange={setDisplayMode}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
        />
      </div>
    </main>
  );
}

export default function MapPage() {
  return <MapContent />;
}
