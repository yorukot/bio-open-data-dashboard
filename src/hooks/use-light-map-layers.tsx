"use client";

import { useEffect } from "react";
import mapboxgl from "mapbox-gl";
import { LightGeoJSON } from "@/lib/utils/light-geojson";

interface UseLightMapLayersProps {
  map: mapboxgl.Map | null;
  geoJSON: LightGeoJSON | null;
  displayMode: string;
}

// Helper function to determine if light pollution layers should be visible
function shouldShowLightLayers(displayMode: string): boolean {
  return displayMode === "light" || displayMode === "bio-light";
}

export function useLightMapLayers({
  map,
  geoJSON,
  displayMode,
}: UseLightMapLayersProps) {
  // Add light pollution layers to map when data is ready
  useEffect(() => {
    if (!map || !geoJSON) return;

    const addLightLayers = () => {
      if (map.getSource("light-pollution")) {
        const source = map.getSource(
          "light-pollution"
        ) as mapboxgl.GeoJSONSource;
        source.setData(geoJSON);
        return;
      }

      console.log(
        "Adding light pollution layers with",
        geoJSON.features.length,
        "data points"
      );

      // Add GeoJSON source for light pollution data
      map.addSource("light-pollution", {
        type: "geojson",
        data: geoJSON,
      });

      // Add heatmap layer following Mapbox example (below animal layers)
      // Try to insert before the first animal layer if it exists
      const beforeLayer = map.getLayer("animal-clusters")
        ? "animal-clusters"
        : undefined;

      // Determine visibility for new layers
      const visibility = shouldShowLightLayers(displayMode)
        ? "visible"
        : "none";

      // Try a simplified heatmap first
      map.addLayer(
        {
          id: "light-pollution-heatmap",
          type: "heatmap",
          source: "light-pollution",
          layout: {
            visibility: visibility,
          },
          paint: {
            // Use brightness property as weight if available, otherwise default to 1
            "heatmap-weight": [
              "case",
              ["has", "brightness"],
              ["get", "brightness"],
              1,
            ],
            // Very low intensity at far zoom, increases with zoom
            "heatmap-intensity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0,
              0.3,
              4,
              0.8,
              8,
              1.5,
              12,
              2.5,
            ],
            // Light pollution color gradient (blue to red)
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0,
              "rgba(0,0,0,0)",
              0.2,
              "rgba(0,0,255,0.3)",
              0.4,
              "rgba(0,255,255,0.5)",
              0.6,
              "rgba(255,255,0,0.7)",
              0.8,
              "rgba(255,165,0,0.8)",
              1,
              "rgba(255,0,0,0.9)",
            ],
            // Much smaller radius for all zoom levels
            "heatmap-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0,
              0.3,
              4,
              1,
              8,
              3,
              12,
              5,
            ],
            // Moderate opacity
            "heatmap-opacity": 0.7,
          },
        },
        beforeLayer
      );

      console.log(
        "Added light pollution source with",
        geoJSON.features.length,
        "data points"
      );
      console.log(
        "First 3 light records:",
        geoJSON.features.slice(0, 3).map((f) => ({
          coordinates: f.geometry.coordinates,
          brightness: f.properties.brightness,
        }))
      );

      // Verify coordinate bounds for Taiwan (avoiding stack overflow with large arrays)
      if (geoJSON.features.length > 0) {
        let minLng = Infinity,
          maxLng = -Infinity;
        let minLat = Infinity,
          maxLat = -Infinity;

        for (const feature of geoJSON.features) {
          const [lng, lat] = feature.geometry.coordinates;
          if (lng < minLng) minLng = lng;
          if (lng > maxLng) maxLng = lng;
          if (lat < minLat) minLat = lat;
          if (lat > maxLat) maxLat = lat;
        }

        console.log(
          "Longitude range:",
          minLng.toFixed(6),
          "to",
          maxLng.toFixed(6)
        );
        console.log(
          "Latitude range:",
          minLat.toFixed(6),
          "to",
          maxLat.toFixed(6)
        );
        console.log(
          "Taiwan bounds check - lng should be ~118-122, lat should be ~22-26"
        );
      }

      // Debug layer existence
      console.log("Light pollution heatmap layer added:");
      console.log(
        "- Heatmap layer exists:",
        !!map.getLayer("light-pollution-heatmap")
      );
      console.log("- Source exists:", !!map.getSource("light-pollution"));

      // Check layer visibility
      if (map.getLayer("light-pollution-heatmap")) {
        console.log(
          "- Heatmap visibility:",
          map.getLayoutProperty("light-pollution-heatmap", "visibility")
        );
      }

      console.log(
        "Light pollution heatmap created with visibility:",
        visibility
      );
      console.log("Display mode:", displayMode);
      console.log("Display mode:", displayMode);
    };

    if (map.isStyleLoaded()) {
      addLightLayers();
    } else {
      map.on("load", addLightLayers);
    }

    return () => {
      map.off("load", addLightLayers);
      if (map.getSource("light-pollution")) {
        if (map.getLayer("light-pollution-heatmap"))
          map.removeLayer("light-pollution-heatmap");
        map.removeSource("light-pollution");
      }
    };
  }, [map, geoJSON, displayMode]);

  // Control layer visibility based on display mode
  useEffect(() => {
    if (!map) return;

    const setLayerVisibility = () => {
      const visibility = shouldShowLightLayers(displayMode)
        ? "visible"
        : "none";

      console.log("Setting light pollution heatmap visibility:", visibility);

      if (map.getLayer("light-pollution-heatmap")) {
        map.setLayoutProperty(
          "light-pollution-heatmap",
          "visibility",
          visibility
        );
      }
    };

    if (map.isStyleLoaded()) {
      setLayerVisibility();
    } else {
      map.on("load", setLayerVisibility);
    }

    return () => {
      map.off("load", setLayerVisibility);
    };
  }, [map, displayMode]);
}
