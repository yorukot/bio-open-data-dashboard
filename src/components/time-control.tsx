"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { MonthPicker } from "./month-picker";

interface TimeControlProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export function TimeControl({ currentDate, onDateChange }: TimeControlProps) {
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

  const handlePreviousMonth = () => {
    const newDate = subMonths(currentDate, 1);
    if (newDate >= new Date(2012, 0, 1)) {
      onDateChange(newDate);
    }
  };

  const handleNextMonth = () => {
    const newDate = addMonths(currentDate, 1);
    const now = new Date();
    if (newDate <= endOfMonth(now)) {
      onDateChange(newDate);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs font-medium text-muted-foreground">
        時間
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousMonth}
          disabled={currentDate <= new Date(2012, 0, 1)}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <MonthPicker
          currentDate={currentDate}
          onDateChange={onDateChange}
          isOpen={isMonthPickerOpen}
          onOpenChange={setIsMonthPickerOpen}
        />

        <Button
          variant="outline"
          size="sm"
          onClick={handleNextMonth}
          disabled={currentDate >= startOfMonth(new Date())}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}