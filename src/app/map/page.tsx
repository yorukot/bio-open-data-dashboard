"use client";

import React, { useRef, useEffect } from "react";
import Map from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useSidebar } from "@/components/ui/sidebar";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

function MapContent() {
  const mapRef = useRef<any>(null);
  const { open } = useSidebar();

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
      <div className="flex-1 overflow-hidden">
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
        />
      </div>
    </main>
  );
}

export default function MapPage() {
  return <MapContent />;
}
