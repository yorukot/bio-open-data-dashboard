"use client";

import { useState } from "react";
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
  const [isHoveringButton, setIsHoveringButton] = useState(false);
  const [isHoveringPanel, setIsHoveringPanel] = useState(false);

  const shouldReduceOpacity = isHoveringPanel && !isHoveringButton;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transition-opacity duration-200 ${
        shouldReduceOpacity ? "opacity-30" : "opacity-90"
      }`}
      onMouseEnter={() => setIsHoveringPanel(true)}
      onMouseLeave={() => setIsHoveringPanel(false)}
    >
      <Card className="shadow-lg">
        <CardContent className="px-4 py-3">
          <div className="flex flex-col gap-3">
            <div
              onMouseEnter={() => setIsHoveringButton(true)}
              onMouseLeave={() => setIsHoveringButton(false)}
            >
              <DisplayModeSelector
                displayMode={displayMode}
                onDisplayModeChange={onDisplayModeChange}
              />
            </div>

            <Separator />

            <div
              onMouseEnter={() => setIsHoveringButton(true)}
              onMouseLeave={() => setIsHoveringButton(false)}
            >
              <TimeControl
                currentDate={currentDate}
                onDateChange={onDateChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
