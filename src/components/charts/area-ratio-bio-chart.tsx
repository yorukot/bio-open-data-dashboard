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
import { useAreaRatio } from "@/lib/hooks/use-api";
import { BIO_GROUPS } from "@/lib/types/api";
import { useEffect, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

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

const COLORS = {
  鳥類: "var(--chart-1)",
  兩棲類: "var(--chart-2)",
  哺乳類: "var(--chart-3)",
  爬蟲類: "var(--chart-4)",
  魚類: "var(--chart-5)",
  昆蟲: "hsl(210, 100%, 50%)",
  蜘蛛: "hsl(300, 100%, 40%)",
};

// Map counties to regions
const COUNTY_TO_REGION = {
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

export function AreaRatioBioChart() {
  const defaultDate = getDefaultDate();
  const [selectedYear, setSelectedYear] = useState(
    defaultDate.getFullYear().toString()
  );
  const [selectedArea, setSelectedArea] = useState("北部");
  const [isAreaChanging, setIsAreaChanging] = useState(false);

  const availableYears = useMemo(() => getAvailableYears(), []);
  const availableAreas = ["北部", "中部", "南部", "東部"];

  const startTime = `${selectedYear}-01-01T00:00:00Z`;
  const endTime = `${selectedYear}-12-31T23:59:59Z`;

  const { data, isLoading, error } = useAreaRatio({
    start_time: startTime,
    end_time: endTime,
  });

  // Handle area changes with skeleton state
  useEffect(() => {
    if (isAreaChanging) {
      const timer = setTimeout(() => {
        setIsAreaChanging(false);
      }, 300); // Show skeleton for 300ms
      return () => clearTimeout(timer);
    }
  }, [isAreaChanging]);

  const handleAreaChange = (newArea: string) => {
    setIsAreaChanging(true);
    setSelectedArea(newArea);
  };

  const chartData = useMemo(() => {
    if (!data?.data) return [];

    // Initialize animal counts for selected area
    const animalCounts: Record<string, number> = {};
    BIO_GROUPS.forEach((bioGroup) => {
      animalCounts[bioGroup] = 0;
    });

    // Aggregate data for counties in the selected area
    data.data.forEach((county) => {
      const region =
        COUNTY_TO_REGION[county.county as keyof typeof COUNTY_TO_REGION];
      if (region === selectedArea) {
        county.animals.forEach((animal) => {
          if (animalCounts[animal.animal_type] !== undefined) {
            animalCounts[animal.animal_type] += animal.total_amount;
          }
        });
      }
    });

    // Convert to chart format
    const total = Object.values(animalCounts).reduce(
      (sum, amount) => sum + amount,
      0
    );

    if (total > 0) {
      return Object.entries(animalCounts)
        .filter(([, amount]) => amount > 0)
        .map(([animalType, amount]) => ({
          animal_type: animalType,
          total_amount: amount,
          percentage: (amount / total) * 100,
          fill: COLORS[animalType as keyof typeof COLORS] || COLORS.鳥類,
        }));
    } else {
      return [];
    }
  }, [data, selectedArea]);

  // Skeleton component for the chart
  const ChartSkeleton = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Skeleton className="h-6 w-48 mx-auto" />
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
      <div className="space-y-4">
        {/* Legend skeleton */}
        <div className="h-[60px] flex items-center justify-center gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-4 w-8" />
            </div>
          ))}
        </div>
        {/* Chart skeleton */}
        <div className="h-[400px] flex items-center justify-center">
          <Skeleton className="h-64 w-64 rounded-full" />
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>四區占比的生物比例</CardTitle>
          <CardDescription>各區域生物類型分佈比例</CardDescription>
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
        <CardTitle>四區占比的生物比例</CardTitle>
        <CardDescription>
          選擇特定年份和區域查看七類生物分佈比例
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
          <Select value={selectedArea} onValueChange={handleAreaChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="選擇區域" />
            </SelectTrigger>
            <SelectContent>
              {availableAreas.map((area: string) => (
                <SelectItem key={area} value={area}>
                  {area}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading || isAreaChanging ? (
          <ChartSkeleton />
        ) : (
          <div className="space-y-6">
            {/* Area and year info */}
            <div className="text-center">
              <h4 className="text-xl font-semibold">
                {selectedArea} - {selectedYear} 年
              </h4>
              <p className="text-muted-foreground">七類生物分佈比例</p>
            </div>

            {chartData.length === 0 ? (
              <div className="h-[400px] flex items-center justify-center bg-muted rounded-lg">
                <span className="text-muted-foreground">
                  {selectedArea} 在 {selectedYear} 年無數據
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Legend */}
                <ChartContainer
                  config={chartConfig}
                  className="h-[60px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <ChartLegend content={<ChartLegendContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>

                {/* Single pie chart */}
                <ChartContainer
                  config={chartConfig}
                  className="h-[400px] w-full"
                >
                  <PieChart>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          nameKey="animal_type"
                          formatter={(value) => [
                            `${Number(value).toLocaleString()} (${(
                              ((value as number) /
                                chartData.reduce(
                                  (sum, item) => sum + item.total_amount,
                                  0
                                )) *
                              100
                            ).toFixed(1)}%)`,
                            " 隻",
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
