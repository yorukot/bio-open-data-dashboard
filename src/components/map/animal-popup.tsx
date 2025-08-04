import React from "react";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPinIcon } from "lucide-react";
import { getBioGroupColor } from "@/lib/utils/bio-group-colors";

interface AnimalPopupProps {
  commonName: string;
  scientificName: string;
  bioGroup: string;
  county: string;
  municipality: string;
  eventDate?: string;
}

export function AnimalPopup({ commonName, scientificName, bioGroup, county, municipality, eventDate }: AnimalPopupProps) {
  // Handle empty/null values properly
  const displayName = commonName && commonName.trim() !== '' ? commonName : '未知物種';
  const displayScientificName = scientificName && scientificName.trim() !== '' && scientificName !== 'Unknown' ? scientificName : null;
  const displayBioGroup = bioGroup && bioGroup.trim() !== '' && bioGroup !== '未知' ? bioGroup : '未分類';
  const displayCounty = county && county.trim() !== '' && county !== '未知' ? county : '位置未知';
  const displayMunicipality = municipality && municipality.trim() !== '' ? municipality : null;
  
  // Build location string
  let locationText = displayCounty;
  if (displayMunicipality) {
    locationText += `, ${displayMunicipality}`;
  }
  
  return (
    <div className="w-80 bg-white">
      <div className="p-6 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 leading-tight">
              {displayName}
            </h3>
            {displayScientificName && (
              <p className="text-sm text-gray-600 italic mt-1">
                {displayScientificName}
              </p>
            )}
          </div>
          <Badge className={`${getBioGroupColor(displayBioGroup)} text-white shrink-0`}>
            {displayBioGroup}
          </Badge>
        </div>
      </div>
      <div className="px-6 pb-4">
        <div className="space-y-3">
          <div className="flex items-start gap-2 text-sm">
            <MapPinIcon className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
            <span className="text-gray-700">
              {locationText}
            </span>
          </div>
          {eventDate && (
            <div className="flex items-start gap-2 text-sm">
              <CalendarIcon className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
              <span className="text-gray-700">
                {new Date(eventDate).toLocaleDateString('zh-TW', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}