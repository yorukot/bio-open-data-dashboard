import { LightDataRecord } from '../types/api';

export interface LightGeoJSON {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: {
      type: 'Point';
      coordinates: [number, number];
    };
    properties: {
      brightness: number;
      timestamp: string;
      lat: number;
      lng: number;
    };
  }>;
}

/**
 * Convert light pollution data to GeoJSON format for Mapbox heatmap layer
 */
export function convertLightDataToGeoJSON(lightData: LightDataRecord[]): LightGeoJSON {
  console.log('Converting light data to GeoJSON:', lightData.length, 'features');
  
  const validFeatures = lightData
    .filter(point => {
      // Filter out invalid coordinates and brightness values
      const hasValidCoords = point.longitude !== null && point.latitude !== null && 
                           !isNaN(point.longitude) && !isNaN(point.latitude) &&
                           point.longitude >= -180 && point.longitude <= 180 &&
                           point.latitude >= -90 && point.latitude <= 90;
      const hasValidBrightness = point.brightness !== null && !isNaN(point.brightness);
      
      if (!hasValidCoords || !hasValidBrightness) {
        console.warn('Skipping invalid light data point:', point);
        return false;
      }
      
      return true;
    })
    .map(point => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [point.longitude, point.latitude] as [number, number]
      },
      properties: {
        brightness: point.brightness,
        timestamp: point.time,
        lat: point.latitude,
        lng: point.longitude
      }
    }));

  console.log('Valid light features after filtering:', validFeatures.length);
  
  if (validFeatures.length > 0) {
    // Use reduce to avoid stack overflow with large arrays
    let minBrightness = Infinity;
    let maxBrightness = -Infinity;
    
    for (const feature of validFeatures) {
      const brightness = feature.properties.brightness;
      if (brightness < minBrightness) minBrightness = brightness;
      if (brightness > maxBrightness) maxBrightness = brightness;
    }
    
    console.log(`Brightness range: ${minBrightness.toFixed(6)} to ${maxBrightness.toFixed(6)}`);
  }

  return {
    type: 'FeatureCollection',
    features: validFeatures
  };
}