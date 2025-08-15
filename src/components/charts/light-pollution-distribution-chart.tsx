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
import { useLightPollutionDistribution } from "@/lib/hooks/use-api";
import React, { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const YEARS = [
  "2025",
  "2024",
  "2023",
  "2022",
  "2021",
  "2020",
  "2019",
  "2018",
  "2017",
  "2016",
  "2015",
  "2014",
  "2013",
  "2012",
];
const MONTHS = [
  { value: "1", label: "1 月" },
  { value: "2", label: "2 月" },
  { value: "3", label: "3 月" },
  { value: "4", label: "4 月" },
  { value: "5", label: "5 月" },
  { value: "6", label: "6 月" },
  { value: "7", label: "7 月" },
  { value: "8", label: "8 月" },
  { value: "9", label: "9 月" },
  { value: "10", label: "10 月" },
  { value: "11", label: "11 月" },
  { value: "12", label: "12 月" },
];

const chartConfig = {
  light_pollution_average: {
    label: "光害強度",
    color: "var(--chart-1)",
  },
};

export function LightPollutionDistributionChart() {
  const [selectedYear, setSelectedYear] = useState("2024");
  const [selectedMonth, setSelectedMonth] = useState("all");

  const startTime =
    selectedMonth === "all"
      ? `${selectedYear}-01-01T00:00:00Z`
      : `${selectedYear}-${selectedMonth.padStart(2, "0")}-01T00:00:00Z`;

  const endTime =
    selectedMonth === "all"
      ? `${selectedYear}-12-31T23:59:59Z`
      : (() => {
          const year = parseInt(selectedYear);
          const month = parseInt(selectedMonth);
          const lastDay = new Date(year, month, 0).getDate();
          return `${selectedYear}-${selectedMonth.padStart(2, "0")}-${lastDay
            .toString()
            .padStart(2, "0")}T23:59:59Z`;
        })();

  const { data, isLoading, error } = useLightPollutionDistribution({
    start_time: startTime,
    end_time: endTime,
  });

  // Transform data for chart - each county is a bar
  const chartData = React.useMemo(() => {
    if (!data?.data) return [];

    // Calculate average light pollution for each county
    return data.data
      .map((county) => {
        const totalBrightness = county.data.reduce(
          (sum, item) => sum + item.light_pollution_average,
          0
        );
        const averageBrightness =
          county.data.length > 0 ? totalBrightness / county.data.length : 0;

        return {
          county: county.county,
          light_pollution_average: Math.round(averageBrightness * 100) / 100,
        };
      })
      .sort((a, b) => b.light_pollution_average - a.light_pollution_average); // Sort by brightness descending
  }, [data]);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>台灣光害強度分佈圖</CardTitle>
          <CardDescription>查看各縣市光害強度隨時間的變化趨勢</CardDescription>
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
        <CardTitle>台灣光害強度分佈圖</CardTitle>
        <CardDescription>各縣市每月的平均光害強度 </CardDescription>
        <div className="flex gap-4">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="選擇年份" />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}年
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="選擇月份" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全年</SelectItem>
              {MONTHS.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-muted-foreground">載入中...</div>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
                top: 12,
                bottom: 60,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="county"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                angle={-45}
                textAnchor="end"
                height={80}
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
                    formatter={(value, name) => [
                      `${Number(value).toFixed(2)}`,
                      " 平均光害強度",
                    ]}
                    labelFormatter={(label) => label}
                  />
                }
              />
              <Bar
                dataKey="light_pollution_average"
                fill="var(--color-light_pollution_average)"
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
