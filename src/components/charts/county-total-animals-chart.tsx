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
import { getAvailableYears } from "@/lib/config/time-range";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface CountyTotalData {
  county: string;
  total_amount: number;
}

interface APIResponse {
  data: CountyTotalData[];
  year: number;
}

const chartConfig = {
  total_amount: {
    label: "總生物數",
    color: "var(--chart-1)",
  },
};

export function CountyTotalAnimalsChart() {
  const [selectedYear, setSelectedYear] = useState("2024");

  const availableYears = useMemo(() => getAvailableYears(), []);

  const { data, isLoading, error } = useQuery<APIResponse>({
    queryKey: ["county-total-animals", selectedYear],
    queryFn: async () => {
      const response = await fetch(
        `/api/charts/night-animals/county-total?year=${selectedYear}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch county total animals data");
      }
      return response.json();
    },
  });

  const chartData = React.useMemo(() => {
    if (!data?.data) return [];
    return data.data;
  }, [data]);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>各縣市總生物數</CardTitle>
          <CardDescription>各縣市在選定年份的總生物數量統計</CardDescription>
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
        <CardTitle>各縣市總生物數</CardTitle>
        <CardDescription>各縣市在選定年份的總生物數量統計</CardDescription>
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
                    formatter={(value) => [
                      `${Number(value).toLocaleString()}`,
                      " 隻",
                    ]}
                    labelFormatter={(label) => label}
                  />
                }
              />
              <Bar
                dataKey="total_amount"
                fill="var(--color-total_amount)"
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
