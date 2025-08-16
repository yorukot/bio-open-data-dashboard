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
import { useDatasetStats } from "@/lib/hooks/use-api";
import { useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";


// Color palette for datasets
const DATASET_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "hsl(210, 100%, 50%)",
  "hsl(300, 100%, 40%)",
  "hsl(45, 100%, 60%)",
  "hsl(180, 100%, 40%)",
  "hsl(330, 100%, 50%)",
];

export function DatasetStatsChart() {
  const [selectedArea, setSelectedArea] = useState("全部");
  const [hoveredDataset, setHoveredDataset] = useState<string | null>(null);
  const availableAreas = ["北部", "中部", "南部", "東部", "全部"];

  // Build query params based on selected area
  const queryParams = useMemo(() => {
    if (selectedArea === "全部") {
      return { county: "all" };
    }
    return { county: selectedArea };
  }, [selectedArea]);

  const { data, isLoading, error } = useDatasetStats(queryParams);

  // Process data for chart
  const chartData = useMemo(() => {
    if (!data?.data || data.data.length === 0) return [];

    const total = data.data.reduce((sum, item) => sum + item.count, 0);
    
    return data.data.map((item, index) => ({
      dataset: item.dataset,
      count: item.count,
      percentage: (item.count / total) * 100,
      fill: DATASET_COLORS[index % DATASET_COLORS.length],
    }));
  }, [data]);

  // Generate chart config dynamically
  const chartConfig = useMemo(() => {
    if (!data?.data) return {};
    
    const config: Record<string, { label: string; color: string }> = {};
    data.data.forEach((item, index) => {
      config[item.dataset] = {
        label: item.dataset,
        color: DATASET_COLORS[index % DATASET_COLORS.length],
      };
    });
    return config;
  }, [data]);

  // Skeleton component for loading state
  const ChartSkeleton = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Skeleton className="h-6 w-48 mx-auto" />
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
      <div className="space-y-4">
        <div className="h-[60px] flex items-center justify-center gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
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
          <CardTitle>資料集統計</CardTitle>
          <CardDescription>各資料集在資料庫中的數量分佈</CardDescription>
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
        <CardTitle>資料集統計</CardTitle>
        <CardDescription>
          各資料集在資料庫中的數量分佈和比例
        </CardDescription>
        <div className="flex flex-wrap gap-2 sm:gap-4">
          <Select value={selectedArea} onValueChange={setSelectedArea}>
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
        {isLoading ? (
          <ChartSkeleton />
        ) : (
          <div className="space-y-6">
            {/* Area info */}
            <div className="text-center">
              <h4 className="text-xl font-semibold">
                {selectedArea === "全部" ? "全台" : selectedArea} - 資料集分佈
              </h4>
              <p className="text-muted-foreground">
                總計 {chartData.reduce((sum, item) => sum + item.count, 0).toLocaleString()} 筆資料
              </p>
            </div>

            {chartData.length === 0 ? (
              <div className="h-[400px] flex items-center justify-center bg-muted rounded-lg">
                <span className="text-muted-foreground">
                  {selectedArea} 無數據
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

                {/* Pie chart */}
                <ChartContainer
                  config={chartConfig}
                  className="h-[400px] w-full"
                >
                  <PieChart>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          nameKey="dataset"
                          formatter={(value) => [
                            `${Number(value).toLocaleString()} (${(
                              ((value as number) /
                                chartData.reduce(
                                  (sum, item) => sum + item.count,
                                  0
                                )) *
                              100
                            ).toFixed(1)}%)`,
                            " 筆",
                          ]}
                        />
                      }
                    />
                    <Pie
                      data={chartData}
                      dataKey="count"
                      nameKey="dataset"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label={(entry) => {
                        if (hoveredDataset === entry.dataset) {
                          return `${entry.dataset} ${entry.percentage.toFixed(1)}%`;
                        }
                        return "";
                      }}
                      labelLine={false}
                      onMouseEnter={(data, index) => {
                        setHoveredDataset(data.dataset);
                      }}
                      onMouseLeave={() => {
                        setHoveredDataset(null);
                      }}
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
