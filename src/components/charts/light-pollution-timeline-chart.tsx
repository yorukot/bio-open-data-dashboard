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
import { getMonthNames, getAvailableYears } from "@/lib/config/time-range";
import { useLightPollutionTimeline } from "@/lib/hooks/use-api";
import React, { useState, useMemo } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

const COUNTIES = [
  "臺北市",
  "嘉義市",
  "新竹市",
  "彰化縣",
  "桃園市",
  "基隆市",
  "臺中市",
  "臺南市",
  "高雄市",
  "雲林縣",
  "新北市",
  "澎湖縣",
  "新竹縣",
  "屏東縣",
  "苗栗縣",
  "嘉義縣",
  "南投縣",
  "宜蘭縣",
  "花蓮縣",
  "臺東縣",
  "金門縣",
];

const chartConfig = {
  light_pollution_average: {
    label: "光害強度",
    color: "var(--chart-1)",
  },
};

export function LightPollutionTimelineChart() {
  const [selectedYear, setSelectedYear] = useState("2024");
  const [selectedCounty, setSelectedCounty] = useState("臺北市");

  const availableYears = useMemo(() => getAvailableYears(), []);
  const monthNames = useMemo(() => getMonthNames(), []);

  const { data, isLoading, error } = useLightPollutionTimeline({
    county: selectedCounty,
    year: selectedYear,
  });

  // Transform data for line chart
  const chartData = React.useMemo(() => {
    if (!data?.data) return [];

    // Create an array with all 12 months, filling missing months with null
    const monthsData = Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      const dataPoint = data.data.find((item) => item.month === month);

      return {
        month: monthNames[index],
        monthNumber: month,
        light_pollution_average: dataPoint
          ? dataPoint.light_pollution_average
          : null,
      };
    });

    return monthsData;
  }, [data, monthNames]);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>光害強度時間變化圖</CardTitle>
          <CardDescription>
            查看特定縣市各月份的光害強度變化趨勢
          </CardDescription>
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
        <CardTitle>光害強度時間變化圖</CardTitle>
        <CardDescription>特定縣市各月份的平均光害強度變化趨勢</CardDescription>
        <div className="flex flex-wrap gap-2 sm:gap-4">
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
          <Select value={selectedCounty} onValueChange={setSelectedCounty}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="選擇縣市" />
            </SelectTrigger>
            <SelectContent>
              {COUNTIES.map((county) => (
                <SelectItem key={county} value={county}>
                  {county}
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
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
                top: 12,
                bottom: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
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
                      value !== null ? `${Number(value).toFixed(2)}` : "無數據",
                      "平均光害強度",
                    ]}
                    labelFormatter={(label) => label}
                  />
                }
              />
              <Line
                dataKey="light_pollution_average"
                type="monotone"
                stroke="var(--color-light_pollution_average)"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
