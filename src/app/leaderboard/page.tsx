import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Award, Users, TrendingUp, Database } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  name: string;
  value: string;
  change?: number;
  avatar?: string;
}

interface LeaderboardData {
  title: string;
  entries: LeaderboardEntry[];
  icon: React.ReactNode;
}

const leaderboardData = {
  researchers: [
    {
      title: "光害影響最嚴重的物種",
      icon: <Trophy className="w-5 h-5 text-yellow-500" />,
      entries: [
        { rank: 1, name: "海龜 (Chelonia mydas)", value: "4,782 影響案例", change: 256 },
        { rank: 2, name: "夜行性鳥類 (Nycticorax nycticorax)", value: "3,845 影響案例", change: 198 },
        { rank: 3, name: "螢火蟲 (Lampyridae)", value: "3,156 影響案例", change: 334 },
        { rank: 4, name: "蝙蝠 (Chiroptera)", value: "2,934 影響案例", change: 167 },
        { rank: 5, name: "夜蛾 (Noctuidae)", value: "2,567 影響案例", change: 189 },
        { rank: 6, name: "海鳥 (Puffinus puffinus)", value: "1,983 影響案例", change: 145 },
        { rank: 7, name: "蜘蛛 (Araneae)", value: "1,745 影響案例", change: 123 },
        { rank: 8, name: "青蛙 (Hyla arborea)", value: "1,492 影響案例", change: 178 },
        { rank: 9, name: "甲蟲 (Coleoptera)", value: "1,256 影響案例", change: 134 },
        { rank: 10, name: "蚊子 (Culicidae)", value: "1,134 影響案例", change: 156 },
        { rank: 11, name: "夜鷹 (Caprimulgus europaeus)", value: "976 影響案例", change: 143 },
        { rank: 12, name: "魚類 (Cyprinidae)", value: "865 影響案例", change: 129 },
        { rank: 13, name: "貓頭鷹 (Strigiformes)", value: "732 影響案例", change: 118 },
        { rank: 14, name: "蜜蜂 (Apis mellifera)", value: "643 影響案例", change: 125 },
        { rank: 15, name: "蚯蚓 (Lumbricidae)", value: "587 影響案例", change: 131 }
      ]
    },
    {
      title: "光害敏感度研究進展",
      icon: <Award className="w-5 h-5 text-blue-500" />,
      entries: [
        { rank: 1, name: "海龜 (Chelonia mydas)", value: "98.8% 完成", change: 12 },
        { rank: 2, name: "螢火蟲 (Photinus pyralis)", value: "95.5% 完成", change: 8 },
        { rank: 3, name: "蝙蝠 (Myotis lucifugus)", value: "92.2% 完成", change: 15 },
        { rank: 4, name: "夜蛾 (Spodoptera frugiperda)", value: "88.9% 完成", change: 6 },
        { rank: 5, name: "海鳥 (Puffinus puffinus)", value: "85.7% 完成", change: 11 },
        { rank: 6, name: "青蛙 (Hyla cinerea)", value: "82.4% 完成", change: 9 },
        { rank: 7, name: "蜘蛛 (Nephila clavipes)", value: "79.1% 完成", change: 7 },
        { rank: 8, name: "甲蟲 (Photinus consanguineus)", value: "75.8% 完成", change: 13 },
        { rank: 9, name: "蚊子 (Aedes aegypti)", value: "72.5% 完成", change: 5 },
        { rank: 10, name: "夜鷹 (Chordeiles minor)", value: "69.2% 完成", change: 10 },
        { rank: 11, name: "魚類 (Clupea harengus)", value: "65.9% 完成", change: 4 },
        { rank: 12, name: "貓頭鷹 (Tyto alba)", value: "62.6% 完成", change: 8 },
        { rank: 13, name: "蜜蜂 (Bombus terrestris)", value: "59.3% 完成", change: 6 },
        { rank: 14, name: "蚯蚓 (Eisenia fetida)", value: "56.0% 完成", change: 3 },
        { rank: 15, name: "珊瑚 (Acropora cervicornis)", value: "52.7% 完成", change: 7 }
      ]
    }
  ],
  institutions: [
    {
      title: "光害研究機構",
      icon: <Users className="w-5 h-5 text-green-500" />,
      entries: [
        { rank: 1, name: "國際暗夜協會 (IDA)", value: "1,234 研究項目", change: 89 },
        { rank: 2, name: "光污染科學技術研究所", value: "987 研究項目", change: 67 },
        { rank: 3, name: "生態光學實驗室", value: "854 研究項目", change: 124 },
        { rank: 4, name: "夜間生態學研究中心", value: "723 研究項目", change: 56 },
        { rank: 5, name: "海洋光害研究所", value: "645 研究項目", change: 78 },
        { rank: 6, name: "昆蟲光敏感性實驗室", value: "567 研究項目", change: 43 },
        { rank: 7, name: "鳥類遷徙光害研究中心", value: "489 研究項目", change: 91 },
        { rank: 8, name: "植物光週期研究所", value: "412 研究項目", change: 35 },
        { rank: 9, name: "城市生態光學中心", value: "356 研究項目", change: 62 },
        { rank: 10, name: "哺乳動物晝夜節律實驗室", value: "298 研究項目", change: 28 },
        { rank: 11, name: "珊瑚礁光害研究站", value: "234 研究項目", change: 47 },
        { rank: 12, name: "兩棲動物光感應研究室", value: "187 研究項目", change: 19 },
        { rank: 13, name: "魚類行為光學實驗室", value: "143 研究項目", change: 33 },
        { rank: 14, name: "天文生物學研究中心", value: "98 研究項目", change: 14 },
        { rank: 15, name: "光污染政策研究所", value: "67 研究項目", change: 22 }
      ]
    },
    {
      title: "光害防治成效",
      icon: <TrendingUp className="w-5 h-5 text-purple-500" />,
      entries: [
        { rank: 1, name: "暗夜保護區 - 加拿大", value: "89% 光害減少", change: 15 },
        { rank: 2, name: "海龜保護海灘 - 佛羅里達", value: "76% 光害減少", change: 23 },
        { rank: 3, name: "螢火蟲棲地 - 日本", value: "68% 光害減少", change: 18 },
        { rank: 4, name: "鳥類遷徙廊道 - 德國", value: "61% 光害減少", change: 31 },
        { rank: 5, name: "蝙蝠棲息地 - 英國", value: "54% 光害減少", change: 12 },
        { rank: 6, name: "珊瑚礁保護區 - 澳洲", value: "47% 光害減少", change: -5 },
        { rank: 7, name: "夜行性昆蟲棲地 - 荷蘭", value: "41% 光害減少", change: 28 },
        { rank: 8, name: "兩棲動物繁殖池 - 瑞典", value: "36% 光害減少", change: 9 },
        { rank: 9, name: "夜鷹築巢地 - 美國", value: "32% 光害減少", change: 17 },
        { rank: 10, name: "蜘蛛網生態系 - 法國", value: "28% 光害減少", change: 6 },
        { rank: 11, name: "蚯蚓土壤生態 - 丹麥", value: "24% 光害減少", change: 14 },
        { rank: 12, name: "魚類產卵場 - 挪威", value: "21% 光害減少", change: 11 },
        { rank: 13, name: "蜜蜂覓食路徑 - 瑞士", value: "18% 光害減少", change: 8 },
        { rank: 14, name: "貓頭鷹狩獵區 - 芬蘭", value: "15% 光害減少", change: 4 },
        { rank: 15, name: "夜開花植物區 - 西班牙", value: "12% 光害減少", change: 7 }
      ]
    }
  ],
  datasets: [
    {
      title: "光害強度測量",
      icon: <Database className="w-5 h-5 text-orange-500" />,
      entries: [
        { rank: 1, name: "東京都心 (Tokyo)", value: "25.8 cd/m²", change: 12 },
        { rank: 2, name: "紐約市 (New York)", value: "23.4 cd/m²", change: 8 },
        { rank: 3, name: "上海市中心 (Shanghai)", value: "21.7 cd/m²", change: 15 },
        { rank: 4, name: "倫敦市區 (London)", value: "19.2 cd/m²", change: 6 },
        { rank: 5, name: "首爾江南 (Seoul)", value: "17.8 cd/m²", change: 9 },
        { rank: 6, name: "巴黎市中心 (Paris)", value: "16.3 cd/m²", change: 4 },
        { rank: 7, name: "洛杉磯 (Los Angeles)", value: "14.9 cd/m²", change: 11 },
        { rank: 8, name: "柏林市區 (Berlin)", value: "13.5 cd/m²", change: 7 },
        { rank: 9, name: "雪梨港灣 (Sydney)", value: "12.1 cd/m²", change: -2 },
        { rank: 10, name: "羅馬古城 (Rome)", value: "10.7 cd/m²", change: 13 },
        { rank: 11, name: "多倫多市中心 (Toronto)", value: "9.3 cd/m²", change: 5 },
        { rank: 12, name: "阿姆斯特丹 (Amsterdam)", value: "7.9 cd/m²", change: 3 },
        { rank: 13, name: "斯德哥爾摩 (Stockholm)", value: "6.5 cd/m²", change: 8 },
        { rank: 14, name: "哥本哈根 (Copenhagen)", value: "5.1 cd/m²", change: 2 },
        { rank: 15, name: "赫爾辛基 (Helsinki)", value: "3.7 cd/m²", change: 6 }
      ]
    },
    {
      title: "生物光敏感性指數",
      icon: <Medal className="w-5 h-5 text-red-500" />,
      entries: [
        { rank: 1, name: "海龜幼體 (Chelonia mydas)", value: "9.8 敏感度", change: 0 },
        { rank: 2, name: "螢火蟲 (Photinus pyralis)", value: "9.6 敏感度", change: 0 },
        { rank: 3, name: "夜蛾 (Noctuidae)", value: "9.3 敏感度", change: 0 },
        { rank: 4, name: "蝙蝠幼體 (Myotis lucifugus)", value: "9.1 敏感度", change: 0 },
        { rank: 5, name: "海鳥雛鳥 (Puffinus puffinus)", value: "8.8 敏感度", change: 0 },
        { rank: 6, name: "夜行性蜘蛛 (Nephila clavipes)", value: "8.5 敏感度", change: 0 },
        { rank: 7, name: "青蛙蝌蚪 (Hyla cinerea)", value: "8.2 敏感度", change: 0 },
        { rank: 8, name: "夜開花植物 (Epiphyllum oxypetalum)", value: "7.9 敏感度", change: 0 },
        { rank: 9, name: "深海魚類 (Myctophidae)", value: "7.6 敏感度", change: 0 },
        { rank: 10, name: "夜鷹 (Chordeiles minor)", value: "7.3 敏感度", change: 0 },
        { rank: 11, name: "珊瑚蟲 (Acropora cervicornis)", value: "7.0 敏感度", change: 0 },
        { rank: 12, name: "貓頭鷹 (Tyto alba)", value: "6.7 敏感度", change: 0 },
        { rank: 13, name: "蜜蜂 (Apis mellifera)", value: "6.4 敏感度", change: 0 },
        { rank: 14, name: "蚯蚓 (Eisenia fetida)", value: "6.1 敏感度", change: 0 },
        { rank: 15, name: "浮游生物 (Calanus finmarchicus)", value: "5.8 敏感度", change: 0 }
      ]
    }
  ]
};

function LeaderboardCard({ data }: { data: LeaderboardData }) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          {data.icon}
          <h3 className="text-lg font-semibold">{data.title}</h3>
        </div>
        <div className="space-y-3">
          {data.entries.map((entry) => (
            <div key={entry.rank} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                  {entry.rank}
                </div>
                <div>
                  <div className="font-medium">{entry.name}</div>
                  <div className="text-sm text-muted-foreground">{entry.value}</div>
                </div>
              </div>
              {entry.change !== undefined && entry.change !== 0 && (
                <div className={`flex items-center text-sm ${
                  entry.change > 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {entry.change > 0 ? '↗' : '↘'} {Math.abs(entry.change)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
              {/* Header Section */}
              <div className="mb-6">
                <h2 className="text-3xl font-bold tracking-tight mb-2">排行榜</h2>
                <p className="text-muted-foreground">
                  追蹤研究人員、機構和數據集的頂尖表現者
                </p>
              </div>
              
              {/* Tabs Section */}
              <Tabs defaultValue="researchers" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="researchers">研究人員</TabsTrigger>
                  <TabsTrigger value="institutions">機構</TabsTrigger>
                  <TabsTrigger value="datasets">數據集</TabsTrigger>
                </TabsList>
                
                <TabsContent value="researchers" className="space-y-6 mt-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {leaderboardData.researchers.map((data, index) => (
                      <LeaderboardCard key={index} data={data} />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="institutions" className="space-y-6 mt-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {leaderboardData.institutions.map((data, index) => (
                      <LeaderboardCard key={index} data={data} />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="datasets" className="space-y-6 mt-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {leaderboardData.datasets.map((data, index) => (
                      <LeaderboardCard key={index} data={data} />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
        </div>
      </div>
    </main>
  );
}