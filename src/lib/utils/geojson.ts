import { TBIARecord } from "@/lib/types/api";

export interface AnimalGeoJSONFeature {
  type: "Feature";
  properties: {
    id: number;
    scientific_name: string;
    common_name_c: string;
    bio_group: string;
    event_date?: string;
    county: string;
    municipality: string;
  };
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
}

export interface AnimalGeoJSON {
  type: "FeatureCollection";
  features: AnimalGeoJSONFeature[];
}

// Taiwan bounds for filtering valid coordinates
const TAIWAN_BOUNDS = {
  minLat: 21.8,
  maxLat: 26.5,
  minLng: 118.0,
  maxLng: 122.2
};

export function convertTBIADataToGeoJSON(data: TBIARecord[]): AnimalGeoJSON | null {
  if (!data) return null;

  const validRecords = data.filter(record => 
    record.standard_latitude != null && 
    record.standard_longitude != null &&
    record.standard_latitude >= TAIWAN_BOUNDS.minLat && 
    record.standard_latitude <= TAIWAN_BOUNDS.maxLat &&
    record.standard_longitude >= TAIWAN_BOUNDS.minLng && 
    record.standard_longitude <= TAIWAN_BOUNDS.maxLng
  );

  const features: AnimalGeoJSONFeature[] = validRecords.map(record => ({
    type: "Feature" as const,
    properties: {
      id: record.id,
      scientific_name: record.scientific_name || "Unknown",
      common_name_c: record.common_name_c || "未知",
      bio_group: record.bio_group || "未知",
      event_date: record.event_date,
      county: record.county || "未知",
      municipality: record.municipality || ""
    },
    geometry: {
      type: "Point" as const,
      coordinates: [record.standard_longitude!, record.standard_latitude!]
    }
  }));

  const geoJSON: AnimalGeoJSON = {
    type: "FeatureCollection" as const,
    features
  };

  console.log(`Generated ${geoJSON.features.length} animal points for map`);
  return geoJSON;
}