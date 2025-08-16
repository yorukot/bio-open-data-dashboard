"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAvailableYears, getDefaultDate } from "@/lib/config/time-range";
import { useSeasonAnimalAmount } from "@/lib/hooks/use-api";
import { BIO_GROUPS, BioGroup } from "@/lib/types/api";
import React, { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartConfig = {
  鳥類: {
    label: "鳥類",
    color: "var(--chart-1)",
  },
  兩棲類: {
    label: "兩棲類",
    color: "var(--chart-2)",
  },
  哺乳類: {
    label: "哺乳類",
    color: "var(--chart-3)",
  },
  爬蟲類: {
    label: "爬蟲類",
    color: "var(--chart-4)",
  },
  魚類: {
    label: "魚類",
    color: "var(--chart-5)",
  },
  昆蟲: {
    label: "昆蟲",
    color: "hsl(210, 100%, 50%)",
  },
  蜘蛛: {
    label: "蜘蛛",
    color: "hsl(300, 100%, 40%)",
  },
};

const SEASONS = [
  { value: "1", label: "春季" },
  { value: "2", label: "夏季" },
  { value: "3", label: "秋季" },
  { value: "4", label: "冬季" },
];

const AREAS = [
  { value: "北部", label: "北部" },
  { value: "中部", label: "中部" },
  { value: "南部", label: "南部" },
  { value: "東部", label: "東部" },
  { value: "全", label: "全台" },
];

export function SeasonAnimalAmountChart() {
  const defaultDate = getDefaultDate();
  const [selectedYear, setSelectedYear] = useState(
    defaultDate.getFullYear().toString()
  );
  const [selectedSeason, setSelectedSeason] = useState("1");
  const [selectedArea, setSelectedArea] = useState("全");

  const availableYears = useMemo(() => getAvailableYears(), []);

  const { data, isLoading, error } = useSeasonAnimalAmount({
    year: selectedYear,
    season: selectedSeason,
    county: selectedArea === "全" ? "all" : selectedArea,
  });

  // Transform data for chart
  const chartData = React.useMemo(() => {
    if (!data?.data) return [];

    // Aggregate data by animal type
    const animalTypeMap = new Map<string, number>();

    // Initialize all bio groups with 0
    BIO_GROUPS.forEach((bioGroup) => {
      animalTypeMap.set(bioGroup, 0);
    });

    // Aggregate data from all counties
    data.data.forEach((county) => {
      county.animals.forEach((animal) => {
        if (BIO_GROUPS.includes(animal.animal_type as BioGroup)) {
          const current = animalTypeMap.get(animal.animal_type) || 0;
          animalTypeMap.set(animal.animal_type, current + animal.total_amount);
        }
      });
    });

    // Convert to chart format and sort by amount
    return Array.from(animalTypeMap.entries())
      .map(([animalType, totalAmount]) => ({
        animalType,
        totalAmount,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);
  }, [data]);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>季節對應生物數量</CardTitle>
          <CardDescription>不同季節各類生物的數量分佈統計</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">
            載入數據時發生錯誤: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>季節對應生物數量</CardTitle>
        <CardDescription>
          特定年份、季節和地區的七類生物數量分佈
        </CardDescription>
        <div className="flex gap-4">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="選擇年份" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((year: string) => (
                <SelectItem key={year} value={year}>
                  {year} 年
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSeason} onValueChange={setSelectedSeason}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="選擇季節" />
            </SelectTrigger>
            <SelectContent>
              {SEASONS.map((season) => (
                <SelectItem key={season.value} value={season.value}>
                  {season.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedArea} onValueChange={setSelectedArea}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="選擇區域" />
            </SelectTrigger>
            <SelectContent>
              {AREAS.map((area) => (
                <SelectItem key={area.value} value={area.value}>
                  {area.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[500px] flex items-center justify-center">
            <div className="text-muted-foreground">載入中...</div>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[500px] w-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
                top: 12,
                bottom: 40,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="animalType"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `${value}`}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value) => [
                      `${Number(value).toLocaleString()}`,
                      "數量",
                    ]}
                    labelFormatter={(label) => `${label}`}
                  />
                }
              />
              <Bar
                dataKey="totalAmount"
                fill="var(--chart-1)"
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}