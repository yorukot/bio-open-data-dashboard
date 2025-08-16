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
import { getAvailableMonths, getAvailableYears } from "@/lib/config/time-range";
import { useLightPollutionSourceRatio } from "@/lib/hooks/use-api";
import React, { useMemo, useState } from "react";
import { Cell, Pie, PieChart } from "recharts";

// TODO: Fix the horrible color

const chartConfig = {
  light_pollution_average: {
    label: "平均光害強度",
  },
  北區: {
    label: "北區",
    color: "var(--chart-1)",
  },
  中區: {
    label: "中區",
    color: "var(--chart-2)",
  },
  南區: {
    label: "南區",
    color: "var(--chart-3)",
  },
  東區: {
    label: "東區",
    color: "var(--chart-4)",
  },
  其他: {
    label: "其他",
    color: "var(--chart-5)",
  },
};

const COLORS = {
  北區: "var(--chart-1)",
  中區: "var(--chart-2)",
  南區: "var(--chart-3)",
  東區: "var(--chart-4)",
  其他: "var(--chart-5)",
};

export function LightPollutionSourceRatioChart() {
  const [selectedYear, setSelectedYear] = useState("2024");
  const [selectedMonth, setSelectedMonth] = useState("1");

  const availableYears = useMemo(() => getAvailableYears(), []);
  const availableMonths = useMemo(() => getAvailableMonths(), []);

  const { data, isLoading, error } = useLightPollutionSourceRatio({
    month: parseInt(selectedMonth),
    year: parseInt(selectedYear),
  });

  const chartData = React.useMemo(() => {
    if (!data?.data) return [];

    const total = data.data.reduce(
      (sum, item) => sum + item.light_pollution_average,
      0
    );

    return data.data.map((item) => ({
      area: item.area,
      light_pollution_average: item.light_pollution_average,
      percentage: total > 0 ? (item.light_pollution_average / total) * 100 : 0,
      fill: COLORS[item.area as keyof typeof COLORS] || COLORS.其他,
    }));
  }, [data]);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>光害來源比例</CardTitle>
          <CardDescription>各區域光害強度分佈比例</CardDescription>
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
        <CardTitle>光害來源比例</CardTitle>
        <CardDescription>各區域在選定月份的光害強度分佈比例</CardDescription>
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
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="選擇月份" />
            </SelectTrigger>
            <SelectContent>
              {availableMonths.map(
                (month: { value: string; label: string }) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                )
              )}
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
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    nameKey="area"
                    formatter={(value, name) => [
                      `${Number(value).toFixed(2)} (${(
                        ((value as number) /
                          chartData.reduce(
                            (sum, item) => sum + item.light_pollution_average,
                            0
                          )) *
                        100
                      ).toFixed(1)}%)`,
                    ]}
                  />
                }
              />
              <Pie
                data={chartData}
                dataKey="light_pollution_average"
                nameKey="area"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={({ area, percentage }) =>
                  `${area} ${percentage.toFixed(1)}%`
                }
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
