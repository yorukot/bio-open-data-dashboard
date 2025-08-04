"use client";

import React, { useEffect } from "react";
import mapboxgl from "mapbox-gl";
import { renderToString } from "react-dom/server";
import { AnimalPopup } from "@/components/map/animal-popup";
import { getBioGroupMapColor } from "@/lib/utils/bio-group-colors";
import { AnimalGeoJSON } from "@/lib/utils/geojson";

interface UseAnimalMapLayersProps {
  map: mapboxgl.Map | null;
  geoJSON: AnimalGeoJSON | null;
  displayMode: string;
}

export function useAnimalMapLayers({ map, geoJSON, displayMode }: UseAnimalMapLayersProps) {
  // Add animal layer to map when data is ready
  useEffect(() => {
    if (!map || !geoJSON) return;

    const addAnimalLayer = () => {
      if (map.getSource('animals')) {
        const source = map.getSource('animals') as mapboxgl.GeoJSONSource;
        source.setData(geoJSON);
        return;
      }

      // Add GeoJSON source
      map.addSource('animals', {
        type: 'geojson',
        data: geoJSON,
        cluster: true,
        clusterMaxZoom: 12,
        clusterRadius: 50
      });

      // Add cluster circles
      map.addLayer({
        id: 'animal-clusters',
        type: 'circle',
        source: 'animals',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51bbd6',
            10, '#f1f075',
            50, '#f28cb1'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            15, // radius for clusters with < 10 points
            10, 20, // radius for clusters with 10-49 points  
            50, 25 // radius for clusters with 50+ points
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff'
        }
      });

      // Add cluster count labels
      map.addLayer({
        id: 'animal-cluster-count',
        type: 'symbol',
        source: 'animals',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        },
        paint: {
          'text-color': '#fff'
        }
      });

      // Add individual animal points (unclustered)
      map.addLayer({
        id: 'animal-points',
        type: 'circle',
        source: 'animals',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'match',
            ['get', 'bio_group'],
            '鳥類', getBioGroupMapColor('鳥類'),
            '兩棲類', getBioGroupMapColor('兩棲類'), 
            '哺乳類', getBioGroupMapColor('哺乳類'),
            '爬蟲類', getBioGroupMapColor('爬蟲類'),
            '魚類', getBioGroupMapColor('魚類'),
            '昆蟲', getBioGroupMapColor('昆蟲'),
            '蜘蛛', getBioGroupMapColor('蜘蛛'),
            getBioGroupMapColor('') // default color
          ],
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            5, 3,
            10, 6,
            15, 12
          ],
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff',
          'circle-opacity': 0.8
        }
      });

      // Add popup on click using React component
      map.on('click', 'animal-points', (e: mapboxgl.MapMouseEvent) => {
        const feature = e.features![0];
        const geometry = feature.geometry as GeoJSON.Point;
        const coordinates = geometry.coordinates.slice() as [number, number];
        const properties = feature.properties;
        
        if (!properties) return;

        // Create React component and render to HTML string
        const popupContent = renderToString(
          <AnimalPopup
            commonName={properties.common_name_c || '未知'}
            scientificName={properties.scientific_name || 'Unknown'}
            bioGroup={properties.bio_group || '未知'}
            county={properties.county || '未知'}
            municipality={properties.municipality || ''}
            eventDate={properties.event_date}
          />
        );
        
        new mapboxgl.Popup({
          closeButton: true,
          closeOnClick: false,
          maxWidth: 'none',
          className: 'animal-popup'
        })
          .setLngLat(coordinates)
          .setHTML(`
            <div class="react-popup-container">
              ${popupContent}
            </div>
            <style>
              .animal-popup .mapboxgl-popup-content {
                padding: 0 !important;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
                border: none !important;
                background: transparent !important;
              }
              .animal-popup .mapboxgl-popup-close-button {
                position: absolute !important;
                top: 8px !important;
                right: 8px !important;
                z-index: 10 !important;
                width: 24px !important;
                height: 24px !important;
                background: rgba(0, 0, 0, 0.5) !important;
                color: white !important;
                border: none !important;
                border-radius: 50% !important;
                font-size: 14px !important;
                line-height: 1 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                cursor: pointer !important;
                backdrop-filter: blur(4px) !important;
              }
              .animal-popup .mapboxgl-popup-close-button:hover {
                background: rgba(0, 0, 0, 0.7) !important;
              }
              .animal-popup .mapboxgl-popup-tip {
                border-top-color: white !important;
              }
              .react-popup-container {
                font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
                background: white !important;
              }
              .react-popup-container * {
                box-sizing: border-box;
              }
              .react-popup-container .bg-red-500 { background-color: rgb(239 68 68) !important; }
              .react-popup-container .bg-blue-500 { background-color: rgb(59 130 246) !important; }
              .react-popup-container .bg-orange-500 { background-color: rgb(249 115 22) !important; }
              .react-popup-container .bg-green-500 { background-color: rgb(34 197 94) !important; }
              .react-popup-container .bg-purple-500 { background-color: rgb(168 85 247) !important; }
              .react-popup-container .bg-yellow-500 { background-color: rgb(234 179 8) !important; }
              .react-popup-container .bg-gray-600 { background-color: rgb(75 85 99) !important; }
              .react-popup-container .bg-gray-400 { background-color: rgb(156 163 175) !important; }
            </style>
          `)
          .addTo(map);
      });

      // Change cursor on hover
      map.on('mouseenter', 'animal-points', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      
      map.on('mouseleave', 'animal-points', () => {
        map.getCanvas().style.cursor = '';
      });
    };

    if (map.isStyleLoaded()) {
      addAnimalLayer();
    } else {
      map.on('load', addAnimalLayer);
    }

    return () => {
      if (map.getSource('animals')) {
        if (map.getLayer('animal-points')) map.removeLayer('animal-points');
        if (map.getLayer('animal-cluster-count')) map.removeLayer('animal-cluster-count');
        if (map.getLayer('animal-clusters')) map.removeLayer('animal-clusters');
        map.removeSource('animals');
      }
    };
  }, [map, geoJSON]);

  // Control layer visibility based on display mode
  useEffect(() => {
    if (!map) return;

    const setLayerVisibility = () => {
      const shouldShow = displayMode === "bio" || displayMode === "bio-light";
      const visibility = shouldShow ? 'visible' : 'none';
      
      if (map.getLayer('animal-points')) {
        map.setLayoutProperty('animal-points', 'visibility', visibility);
      }
      if (map.getLayer('animal-clusters')) {
        map.setLayoutProperty('animal-clusters', 'visibility', visibility);
      }
      if (map.getLayer('animal-cluster-count')) {
        map.setLayoutProperty('animal-cluster-count', 'visibility', visibility);
      }
    };

    if (map.isStyleLoaded()) {
      setLayerVisibility();
    } else {
      map.on('load', setLayerVisibility);
    }
  }, [map, displayMode]);
}