"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";

interface MonthPickerProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MonthPicker({ currentDate, onDateChange, isOpen, onOpenChange }: MonthPickerProps) {
  const handleMonthSelect = (year: number, month: number) => {
    const newDate = new Date(year, month, 1);
    onDateChange(newDate);
    onOpenChange(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs min-w-[80px]"
        >
          {format(currentDate, "yyyy年M月", { locale: zhTW })}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2" align="center">
        <div className="max-h-60 overflow-y-auto space-y-2">
          {(() => {
            const currentYear = new Date().getFullYear();
            const years = [];
            for (let year = currentYear; year >= 2012; year--) {
              years.push(year);
            }

            return years.map((year, yearIndex) => {
              const maxMonth =
                year === currentYear ? new Date().getMonth() : 11;
              const months = [];
              for (let month = maxMonth; month >= 0; month--) {
                months.push(month);
              }

              return (
                <div key={year}>
                  {yearIndex > 0 && <Separator className="mb-2" />}
                  <div className="text-xs font-medium text-muted-foreground text-center my-1">
                    {year}
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {months.map((month) => {
                      const date = new Date(year, month, 1);
                      const isSelected =
                        currentDate.getFullYear() === year &&
                        currentDate.getMonth() === month;

                      return (
                        <Button
                          key={`${year}-${month}`}
                          variant={isSelected ? "default" : "ghost"}
                          size="sm"
                          onClick={() =>
                            handleMonthSelect(year, month)
                          }
                          className="h-8 text-xs justify-center"
                        >
                          {format(date, "M 月", {
                            locale: zhTW,
                          })}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </PopoverContent>
    </Popover>
  );
}