import React from "react";

interface LightPollutionLoadingProps {
  isVisible: boolean;
  progress: {
    loaded: number;
    total: number | null;
  };
}

export function LightPollutionLoading({
  isVisible,
  progress,
}: LightPollutionLoadingProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="absolute top-4 right-4 bg-black/80 text-white px-4 py-2 rounded-lg">
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
        <span className="text-sm">
          載入光污染數據：{progress.loaded.toLocaleString()}
          {progress.total && ` / ${progress.total.toLocaleString()}`}
          {progress.total &&
            ` (${((progress.loaded / progress.total) * 100).toFixed(1)}%)`}
        </span>
      </div>
    </div>
  );
}
