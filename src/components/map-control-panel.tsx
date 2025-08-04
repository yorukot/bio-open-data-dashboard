"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DisplayModeSelector, type DisplayMode } from "./display-mode-selector";
import { TimeControl } from "./time-control";

export type { DisplayMode };

interface MapControlPanelProps {
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export function MapControlPanel({
  displayMode,
  onDisplayModeChange,
  currentDate,
  onDateChange,
}: MapControlPanelProps) {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <Card className="shadow-lg">
        <CardContent className="px-4 py-3">
          <div className="flex flex-col gap-3">
            <DisplayModeSelector
              displayMode={displayMode}
              onDisplayModeChange={onDisplayModeChange}
            />

            <Separator />

            <TimeControl
              currentDate={currentDate}
              onDateChange={onDateChange}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
