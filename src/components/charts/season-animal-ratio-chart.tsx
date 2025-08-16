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
  ChartLegend,
  ChartLegendContent,
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
import { useSeasonAnimalRatio } from "@/lib/hooks/use-api";
import { BIO_GROUPS } from "@/lib/types/api";
import React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

const chartConfig = {
  鳥類: { label: "鳥類", color: "var(--chart-1)" },
  兩棲類: { label: "兩棲類", color: "var(--chart-2)" },
  哺乳類: { label: "哺乳類", color: "var(--chart-3)" },
  爬蟲類: { label: "爬蟲類", color: "var(--chart-4)" },
  魚類: { label: "魚類", color: "var(--chart-5)" },
  昆蟲: { label: "昆蟲", color: "hsl(210, 100%, 50%)" },
  蜘蛛: { label: "蜘蛛", color: "hsl(300, 100%, 40%)" },
};

const COLORS: Record<string, string> = {
  鳥類: "var(--chart-1)",
  兩棲類: "var(--chart-2)",
  哺乳類: "var(--chart-3)",
  爬蟲類: "var(--chart-4)",
  魚類: "var(--chart-5)",
  昆蟲: "hsl(210, 100%, 50%)",
  蜘蛛: "hsl(300, 100%, 40%)",
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

// County to area mapping (duplicated here to keep component self-contained)
const COUNTY_TO_REGION: Record<string, string> = {
  // 北部
  臺北市: "北部",
  新北市: "北部",
  基隆市: "北部",
  桃園市: "北部",
  新竹市: "北部",
  新竹縣: "北部",
  // 中部
  苗栗縣: "中部",
  臺中市: "中部",
  彰化縣: "中部",
  南投縣: "中部",
  雲林縣: "中部",
  // 南部
  嘉義市: "南部",
  嘉義縣: "南部",
  臺南市: "南部",
  高雄市: "南部",
  屏東縣: "南部",
  // 東部
  宜蘭縣: "東部",
  花蓮縣: "東部",
  臺東縣: "東部",
  澎湖縣: "東部",
  金門縣: "東部",
  連江縣: "東部",
};

export function SeasonAnimalRatioChart() {
  const defaultDate = getDefaultDate();
  const [selectedYear, setSelectedYear] = React.useState(
    defaultDate.getFullYear().toString()
  );
  const [selectedSeason, setSelectedSeason] = React.useState("1");
  const [selectedArea, setSelectedArea] = React.useState("全");

  const availableYears = React.useMemo(() => getAvailableYears(), []);

  // Always fetch all counties, aggregate by area on the client
  const { data, isLoading, error } = useSeasonAnimalRatio({
    year: selectedYear,
    season: selectedSeason,
    county: "all",
  });

  const chartData = React.useMemo(() => {
    if (!data?.data) return [] as Array<{
      animal_type: string;
      total_amount: number;
      percentage: number;
      fill: string;
    }>;

    const animalCounts: Record<string, number> = {};
    BIO_GROUPS.forEach((g) => (animalCounts[g] = 0));

    data.data.forEach((county) => {
      const region = COUNTY_TO_REGION[county.county] || "";
      if (selectedArea === "全" || region === selectedArea) {
        county.animals.forEach((animal) => {
          if (animalCounts[animal.animal_type] !== undefined) {
            animalCounts[animal.animal_type] += animal.total_amount;
          }
        });
      }
    });

    const total = Object.values(animalCounts).reduce((s, v) => s + v, 0);
    if (total === 0) return [];

    return Object.entries(animalCounts)
      .filter(([, amount]) => amount > 0)
      .map(([animal_type, total_amount]) => ({
        animal_type,
        total_amount,
        percentage: (total_amount / total) * 100,
        fill: COLORS[animal_type] || COLORS["鳥類"],
      }));
  }, [data, selectedArea]);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>季節占比生物比例</CardTitle>
          <CardDescription>不同季節與區域的生物類型分佈比例</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">載入數據時發生錯誤: {error.message}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>季節占比生物比例</CardTitle>
        <CardDescription>選擇年份、季節與區域，查看七類生物比例</CardDescription>
        <div className="flex flex-wrap gap-2 sm:gap-4">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="選擇年份" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((year) => (
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
              {SEASONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedArea} onValueChange={setSelectedArea}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="選擇區域" />
            </SelectTrigger>
            <SelectContent>
              {AREAS.map((a) => (
                <SelectItem key={a.value} value={a.value}>
                  {a.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-6">
            <div className="h-[60px]" />
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              載入中...
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center bg-muted rounded-lg">
            <span className="text-muted-foreground">
              {selectedArea} 在 {selectedYear} 年{SEASONS.find(s=>s.value===selectedSeason)?.label}無數據
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            <ChartContainer config={chartConfig} className="h-[60px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <ChartContainer config={chartConfig} className="h-[400px] w-full">
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      nameKey="animal_type"
                      formatter={(value) => [
                        `${Number(value).toLocaleString()} (${(
                          ((value as number) /
                            chartData.reduce((sum, d) => sum + d.total_amount, 0)) *
                          100
                        ).toFixed(1)}%)`,
                        " 數量",
                      ]}
                    />
                  }
                />
                <Pie
                  data={chartData}
                  dataKey="total_amount"
                  nameKey="animal_type"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={({ animal_type, percentage }) =>
                    `${animal_type} ${percentage.toFixed(1)}%`
                  }
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
