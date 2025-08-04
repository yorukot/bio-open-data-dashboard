"use client";

import { Button } from "@/components/ui/button";

export type DisplayMode = "bio" | "light" | "bio-light";

interface DisplayModeSelectorProps {
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
}

export function DisplayModeSelector({ displayMode, onDisplayModeChange }: DisplayModeSelectorProps) {
  const displayModeOptions = [
    { value: "bio" as const, label: "生物" },
    { value: "light" as const, label: "光害" },
    { value: "bio-light" as const, label: "生物 + 光害" },
  ];

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs font-medium text-muted-foreground">
        顯示模式
      </span>
      <div className="flex gap-1">
        {displayModeOptions.map((option) => (
          <Button
            key={option.value}
            variant={
              displayMode === option.value ? "default" : "outline"
            }
            size="sm"
            onClick={() => onDisplayModeChange(option.value)}
            className="h-8 px-3 text-xs"
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}