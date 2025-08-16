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
import { useAreaAnimalAmount } from "@/lib/hooks/use-api";
import { BIO_GROUPS } from "@/lib/types/api";
import React, { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

// County to region mapping
const COUNTY_TO_REGION: Record<string, string> = {
  // 北部 (Northern)
  臺北市: "北部",
  新北市: "北部",
  桃園市: "北部",
  基隆市: "北部",
  新竹市: "北部",
  新竹縣: "北部",

  // 中部 (Central)
  臺中市: "中部",
  苗栗縣: "中部",
  彰化縣: "中部",
  南投縣: "中部",
  雲林縣: "中部",

  // 南部 (Southern)
  嘉義市: "南部",
  嘉義縣: "南部",
  臺南市: "南部",
  高雄市: "南部",
  屏東縣: "南部",

  // 東部 (Eastern)
  宜蘭縣: "東部",
  花蓮縣: "東部",
  臺東縣: "東部",

  // 離島 (將歸類到相鄰地區)
  澎湖縣: "南部",
  金門縣: "南部",
  連江縣: "北部",
};

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
    color: "var(--chart-1)",
  },
  蜘蛛: {
    label: "蜘蛛",
    color: "var(--chart-2)",
  },
};

export function AreaAnimalAmountChart() {
  const defaultDate = getDefaultDate();
  const [selectedYear, setSelectedYear] = useState(
    defaultDate.getFullYear().toString()
  );

  const availableYears = useMemo(() => getAvailableYears(), []);

  const startTime = `${selectedYear}-01-01T00:00:00Z`;
  const endTime = `${selectedYear}-12-31T23:59:59Z`;

  const { data, isLoading, error } = useAreaAnimalAmount({
    start_time: startTime,
    end_time: endTime,
  });

  // Transform data for chart - aggregate by region and animal type
  const chartData = React.useMemo(() => {
    if (!data?.data) return [];

    // Aggregate data by region and animal type
    const regionMap = new Map<string, Record<string, number>>();

    // Initialize regions
    const regions = ["北部", "中部", "南部", "東部"];
    regions.forEach((region) => {
      regionMap.set(region, {});
      BIO_GROUPS.forEach((bioGroup) => {
        regionMap.get(region)![bioGroup] = 0;
      });
    });

    // Aggregate county data into regions
    data.data.forEach((county) => {
      const region = COUNTY_TO_REGION[county.county];
      if (region && regionMap.has(region)) {
        const regionData = regionMap.get(region)!;

        county.animals.forEach((animal) => {
          if (BIO_GROUPS.includes(animal.animal_type as any)) {
            regionData[animal.animal_type] += animal.total_amount;
          }
        });
      }
    });

    // Convert to chart format
    return regions.map((region) => {
      const regionData = regionMap.get(region)!;
      return {
        region,
        ...regionData,
      };
    });
  }, [data]);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>四區對應生物數量</CardTitle>
          <CardDescription>各地區的生物數量分佈統計</CardDescription>
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
        <CardTitle>四區對應生物數量</CardTitle>
        <CardDescription>
          台灣北部、中部、南部、東部各地區的七類生物數量分佈
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
                dataKey="region"
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
                    formatter={(value, name) => [
                      `${Number(value).toLocaleString()}`,
                      chartConfig[name as keyof typeof chartConfig]?.label ||
                        name,
                    ]}
                    labelFormatter={(label) => `${label}地區`}
                  />
                }
              />
              {BIO_GROUPS.map((bioGroup) => (
                <Bar
                  key={bioGroup}
                  dataKey={bioGroup}
                  fill={`var(--color-${bioGroup})`}
                  radius={4}
                />
              ))}
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
