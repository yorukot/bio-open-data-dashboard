"use client";

import { useEffect } from "react";
import mapboxgl from "mapbox-gl";
import { LightGeoJSON } from "@/lib/utils/light-geojson";

interface UseLightMapLayersProps {
  map: mapboxgl.Map | null;
  geoJSON: LightGeoJSON | null;
  displayMode: string;
}

export function useLightMapLayers({ map, geoJSON, displayMode }: UseLightMapLayersProps) {
  // Add light pollution layers to map when data is ready
  useEffect(() => {
    if (!map || !geoJSON) return;

    const addLightLayers = () => {
      if (map.getSource('light-pollution')) {
        const source = map.getSource('light-pollution') as mapboxgl.GeoJSONSource;
        source.setData(geoJSON);
        return;
      }

      console.log('Adding light pollution layers with', geoJSON.features.length, 'data points');

      // Add GeoJSON source for light pollution data
      map.addSource('light-pollution', {
        type: 'geojson',
        data: geoJSON
      });

      // Add heatmap layer following Mapbox example (below animal layers)
      // Try to insert before the first animal layer if it exists
      const beforeLayer = map.getLayer('animal-clusters') ? 'animal-clusters' : undefined;
      
      // Determine visibility for new layers
      const shouldShow = displayMode === "light" || displayMode === "bio-light";
      const visibility = shouldShow ? 'visible' : 'none';
      
      // Try a simplified heatmap first
      map.addLayer({
        id: 'light-pollution-heatmap',
        type: 'heatmap',
        source: 'light-pollution',
        layout: {
          'visibility': visibility
        },
        paint: {
          // Simple weight - every point has weight 1
          'heatmap-weight': 1,
          // Very high intensity to make it extremely visible
          'heatmap-intensity': 20,
          // Simple color gradient
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0,0,255,0)',
            0.1, 'rgba(0,0,255,0.5)',
            0.3, 'rgba(0,255,0,0.7)',
            0.5, 'rgba(255,255,0,0.8)',
            0.7, 'rgba(255,165,0,0.9)',
            1, 'rgba(255,0,0,1)'
          ],
          // Very large radius to make it extremely visible
          'heatmap-radius': 100,
          // Full opacity
          'heatmap-opacity': 1
        }
      }, beforeLayer);

      // Add circle layer for higher zoom levels - simplified for debugging
      map.addLayer({
        id: 'light-pollution-points',
        type: 'circle',
        source: 'light-pollution',
        layout: {
          'visibility': visibility
        },
        paint: {
          // Simple fixed size
          'circle-radius': 8,
          // Bright red color to make it very visible
          'circle-color': 'red',
          'circle-stroke-color': 'white',
          'circle-stroke-width': 2,
          // Full opacity
          'circle-opacity': 1
        }
      }, beforeLayer);

      console.log('Added light pollution source with', geoJSON.features.length, 'data points');
      console.log('First 3 light records:', 
        geoJSON.features.slice(0, 3).map(f => ({ 
          coordinates: f.geometry.coordinates, 
          brightness: f.properties.brightness 
        }))
      );
      
      // Verify coordinate bounds for Taiwan (avoiding stack overflow with large arrays)
      if (geoJSON.features.length > 0) {
        let minLng = Infinity, maxLng = -Infinity;
        let minLat = Infinity, maxLat = -Infinity;
        
        for (const feature of geoJSON.features) {
          const [lng, lat] = feature.geometry.coordinates;
          if (lng < minLng) minLng = lng;
          if (lng > maxLng) maxLng = lng;
          if (lat < minLat) minLat = lat;
          if (lat > maxLat) maxLat = lat;
        }
        
        console.log('Longitude range:', minLng.toFixed(6), 'to', maxLng.toFixed(6));
        console.log('Latitude range:', minLat.toFixed(6), 'to', maxLat.toFixed(6));
        console.log('Taiwan bounds check - lng should be ~118-122, lat should be ~22-26');
      }
      
      // Debug layer existence
      console.log('Light pollution layers added:');
      console.log('- Heatmap layer exists:', !!map.getLayer('light-pollution-heatmap'));
      console.log('- Points layer exists:', !!map.getLayer('light-pollution-points'));
      console.log('- Source exists:', !!map.getSource('light-pollution'));
      
      // Check layer visibility
      if (map.getLayer('light-pollution-heatmap')) {
        console.log('- Heatmap visibility:', map.getLayoutProperty('light-pollution-heatmap', 'visibility'));
      }
      if (map.getLayer('light-pollution-points')) {
        console.log('- Points visibility:', map.getLayoutProperty('light-pollution-points', 'visibility'));
      }

      console.log('Light pollution layers created with visibility:', visibility);
      console.log('Display mode:', displayMode);
      console.log('Should show:', shouldShow);
    };

    if (map.isStyleLoaded()) {
      addLightLayers();
    } else {
      map.on('load', addLightLayers);
    }

    return () => {
      if (map.getSource('light-pollution')) {
        if (map.getLayer('light-pollution-points')) map.removeLayer('light-pollution-points');
        if (map.getLayer('light-pollution-heatmap')) map.removeLayer('light-pollution-heatmap');
        map.removeSource('light-pollution');
      }
    };
  }, [map, geoJSON, displayMode]);

  // Control layer visibility based on display mode
  useEffect(() => {
    if (!map) return;

    const setLayerVisibility = () => {
      const shouldShow = displayMode === "light" || displayMode === "bio-light";
      const visibility = shouldShow ? 'visible' : 'none';
      
      console.log('Setting light pollution layer visibility:', visibility);
      
      if (map.getLayer('light-pollution-heatmap')) {
        map.setLayoutProperty('light-pollution-heatmap', 'visibility', visibility);
      }
      if (map.getLayer('light-pollution-points')) {
        map.setLayoutProperty('light-pollution-points', 'visibility', visibility);
      }
    };

    if (map.isStyleLoaded()) {
      setLayerVisibility();
    } else {
      map.on('load', setLayerVisibility);
    }
  }, [map, displayMode]);
}