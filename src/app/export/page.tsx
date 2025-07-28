"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// Taiwan counties and cities
const taiwanRegions = [
  "台北市", "新北市", "桃園市", "台中市", "台南市", "高雄市",
  "新竹縣", "苗栗縣", "彰化縣", "南投縣", "雲林縣", "嘉義縣",
  "屏東縣", "宜蘭縣", "花蓮縣", "台東縣", "澎湖縣", "金門縣", "連江縣",
  "基隆市", "新竹市", "嘉義市"
]

// Sample species data
const speciesOptions = [
  "台灣獼猴 (Macaca cyclopis)",
  "台灣黑熊 (Ursus thibetanus formosanus)",
  "石虎 (Prionailurus bengalensis)",
  "台灣野豬 (Sus scrofa taivanus)",
  "梅花鹿 (Cervus nippon)",
  "山羌 (Muntiacus reevesi)",
  "白鼻心 (Paguma larvata)",
  "食蟹獴 (Herpestes urva)",
  "台灣穿山甲 (Manis pentadactyla pentadactyla)",
  "台灣野兔 (Lepus sinensis formosus)"
]

interface ExportFilters {
  region: string | undefined
  startDate: Date | undefined
  endDate: Date | undefined
  species: string | undefined
}

export default function ExportPage() {
  const [filters, setFilters] = useState<ExportFilters>({
    region: undefined,
    startDate: undefined,
    endDate: undefined,
    species: undefined
  })

  const handleDownload = (format: 'json' | 'csv') => {
    // Sample data based on filters
    const sampleData = [
      {
        id: 1,
        species: "台灣獼猴 (Macaca cyclopis)",
        region: filters.region || "台北市",
        date: "2024-01-15",
        count: 12,
        location: "陽明山",
        coordinates: "25.1551, 121.5636"
      },
      {
        id: 2,
        species: "台灣黑熊 (Ursus thibetanus formosanus)",
        region: filters.region || "花蓮縣",
        date: "2024-01-20",
        count: 2,
        location: "玉山國家公園",
        coordinates: "23.4697, 120.9597"
      },
      {
        id: 3,
        species: "石虎 (Prionailurus bengalensis)",
        region: filters.region || "苗栗縣",
        date: "2024-01-25",
        count: 5,
        location: "通霄",
        coordinates: "24.4838, 120.6758"
      }
    ]

    let content: string
    let filename: string
    let mimeType: string

    if (format === 'json') {
      content = JSON.stringify(sampleData, null, 2)
      filename = `bio-data-export-${Date.now()}.json`
      mimeType = 'application/json'
    } else {
      const headers = 'id,species,region,date,count,location,coordinates\n'
      const csvContent = sampleData.map(row => 
        `${row.id},"${row.species}","${row.region}","${row.date}",${row.count},"${row.location}","${row.coordinates}"`
      ).join('\n')
      content = headers + csvContent
      filename = `bio-data-export-${Date.now()}.csv`
      mimeType = 'text/csv'
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            資料導出
          </h2>
          <p className="text-muted-foreground mb-8">
            選擇篩選條件並導出生物資料為 JSON 或 CSV 格式
          </p>

              <div className="space-y-6">
                {/* Region Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">地區</label>
                  <Select value={filters.region || "all"} onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, region: value === "all" ? undefined : value }))
                  }>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="選擇縣市" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部地區</SelectItem>
                      {taiwanRegions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">日期範圍</label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal h-10",
                              !filters.startDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.startDate ? format(filters.startDate, "yyyy-MM-dd") : "開始日期"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={filters.startDate}
                            onSelect={(date) => setFilters(prev => ({ ...prev, startDate: date }))}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal h-10",
                              !filters.endDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.endDate ? format(filters.endDate, "yyyy-MM-dd") : "結束日期"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={filters.endDate}
                            onSelect={(date) => setFilters(prev => ({ ...prev, endDate: date }))}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                {/* Species Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">物種</label>
                  <Select value={filters.species || "all"} onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, species: value === "all" ? undefined : value }))
                  }>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="選擇物種" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部物種</SelectItem>
                      {speciesOptions.map((species) => (
                        <SelectItem key={species} value={species}>
                          {species}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Download Buttons */}
                <div className="flex gap-4 pt-6">
                  <Button onClick={() => handleDownload('json')} className="flex-1 h-10">
                    <Download className="mr-2 h-4 w-4" />
                    下載 JSON
                  </Button>
                  <Button onClick={() => handleDownload('csv')} variant="outline" className="flex-1 h-10">
                    <Download className="mr-2 h-4 w-4" />
                    下載 CSV
                  </Button>
                </div>

                {/* Filter Summary */}
                <div className="mt-8 p-4 bg-muted rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">篩選條件摘要</h3>
                  <div className="space-y-1 text-sm">
                    <div><strong>地區:</strong> {filters.region || "全部地區"}</div>
                    <div><strong>開始日期:</strong> {filters.startDate ? format(filters.startDate, "yyyy-MM-dd") : "未設定"}</div>
                    <div><strong>結束日期:</strong> {filters.endDate ? format(filters.endDate, "yyyy-MM-dd") : "未設定"}</div>
                    <div><strong>物種:</strong> {filters.species || "全部物種"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
  )
}