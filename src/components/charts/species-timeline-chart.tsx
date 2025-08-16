"use client"

import { useState } from "react"
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BIO_GROUPS } from "@/lib/types/api"
import { getAvailableYears } from "@/lib/config/time-range"
import { useSpeciesTimeline } from "@/lib/hooks/use-api"

const chartConfig = {
  event_count: {
    label: "事件數量",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

interface SpeciesTimelineChartProps {
  className?: string
}

export function SpeciesTimelineChart({ className }: SpeciesTimelineChartProps) {
  const currentYear = new Date().getFullYear()
  const [selectedBioGroup, setSelectedBioGroup] = useState<string>(BIO_GROUPS[0])
  const [selectedYear, setSelectedYear] = useState<number>(currentYear)

  const { data, isLoading, error } = useSpeciesTimeline({
    animal_type: selectedBioGroup,
    year: selectedYear,
  })

  const { data: previousYearData } = useSpeciesTimeline({
    animal_type: selectedBioGroup,
    year: selectedYear - 1,
  })

  const yearTotal = data?.data.reduce((sum, item) => sum + item.event_count, 0) || 0
  const previousYearTotal = previousYearData?.data.reduce((sum, item) => sum + item.event_count, 0)
  
  const growthRate = previousYearTotal && previousYearTotal > 0 
    ? ((yearTotal - previousYearTotal) / previousYearTotal * 100)
    : null

  const chartData = data?.data.map(item => ({
    month: `${item.month}月`,
    event_count: item.event_count,
  })) || []

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">生物種類時間段(年成長/年增率)</CardTitle>
        <CardDescription>
          選擇生物種類和年份查看月度事件數量變化趨勢
        </CardDescription>
        <div className="flex gap-4">
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {getAvailableYears().map((year) => (
                <SelectItem key={year} value={year}>
                  {year}年
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedBioGroup} onValueChange={setSelectedBioGroup}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BIO_GROUPS.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="text-muted-foreground">載入中...</div>
          </div>
        ) : error ? (
          <div className="h-80 flex items-center justify-center">
            <div className="text-destructive">載入數據時發生錯誤</div>
          </div>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="event_count"
                    stroke="var(--color-event_count)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-event_count)", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{yearTotal.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground">年總數</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">
                    {growthRate !== null ? (
                      <>
                        {growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}%
                      </>
                    ) : (
                      'N/A'
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">年增率</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}