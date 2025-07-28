import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
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
      title: "研究最多的物種",
      icon: <Trophy className="w-5 h-5 text-yellow-500" />,
      entries: [
        { rank: 1, name: "小家鼠 (Mus musculus)", value: "45,782 項研究", change: 156 },
        { rank: 2, name: "果蠅 (Drosophila melanogaster)", value: "38,245 項研究", change: 98 },
        { rank: 3, name: "斑馬魚 (Danio rerio)", value: "32,156 項研究", change: 134 },
        { rank: 4, name: "挪威鼠 (Rattus norvegicus)", value: "28,934 項研究", change: 67 },
        { rank: 5, name: "恆河猴 (Macaca mulatta)", value: "24,567 項研究", change: 89 },
        { rank: 6, name: "非洲爪蟾 (Xenopus laevis)", value: "19,823 項研究", change: 45 },
        { rank: 7, name: "黑猩猩 (Pan troglodytes)", value: "16,745 項研究", change: 23 },
        { rank: 8, name: "家犬 (Canis familiaris)", value: "14,892 項研究", change: 78 },
        { rank: 9, name: "家貓 (Felis catus)", value: "12,456 項研究", change: 34 },
        { rank: 10, name: "豬 (Sus scrofa)", value: "11,234 項研究", change: 56 },
        { rank: 11, name: "雞 (Gallus gallus)", value: "9,876 項研究", change: 43 },
        { rank: 12, name: "牛 (Bos taurus)", value: "8,765 項研究", change: 29 },
        { rank: 13, name: "馬 (Equus caballus)", value: "7,432 項研究", change: 18 },
        { rank: 14, name: "綿羊 (Ovis aries)", value: "6,543 項研究", change: 25 },
        { rank: 15, name: "兔 (Oryctolagus cuniculus)", value: "5,987 項研究", change: 31 }
      ]
    },
    {
      title: "基因組測序進展",
      icon: <Award className="w-5 h-5 text-blue-500" />,
      entries: [
        { rank: 1, name: "小鼠 (Mus musculus)", value: "99.8% 完成", change: 2 },
        { rank: 2, name: "大鼠 (Rattus norvegicus)", value: "99.5% 完成", change: 1 },
        { rank: 3, name: "斑馬魚 (Danio rerio)", value: "99.2% 完成", change: 3 },
        { rank: 4, name: "果蠅 (Drosophila melanogaster)", value: "98.9% 完成", change: 0 },
        { rank: 5, name: "黑猩猩 (Pan troglodytes)", value: "98.7% 完成", change: 4 },
        { rank: 6, name: "狗 (Canis familiaris)", value: "98.4% 完成", change: 2 },
        { rank: 7, name: "獼猴 (Macaca mulatta)", value: "98.1% 完成", change: 1 },
        { rank: 8, name: "豬 (Sus scrofa)", value: "97.8% 完成", change: 5 },
        { rank: 9, name: "貓 (Felis catus)", value: "97.5% 完成", change: 3 },
        { rank: 10, name: "雞 (Gallus gallus)", value: "97.2% 完成", change: 2 },
        { rank: 11, name: "牛 (Bos taurus)", value: "96.9% 完成", change: 1 },
        { rank: 12, name: "蛙 (Xenopus laevis)", value: "96.6% 完成", change: 4 },
        { rank: 13, name: "馬 (Equus caballus)", value: "96.3% 完成", change: 2 },
        { rank: 14, name: "綿羊 (Ovis aries)", value: "96.0% 完成", change: 3 },
        { rank: 15, name: "兔 (Oryctolagus cuniculus)", value: "95.7% 完成", change: 1 }
      ]
    }
  ],
  institutions: [
    {
      title: "疾病研究模型",
      icon: <Users className="w-5 h-5 text-green-500" />,
      entries: [
        { rank: 1, name: "小鼠 (Mus musculus)", value: "癌症、糖尿病、阿茲海默症", change: 23 },
        { rank: 2, name: "大鼠 (Rattus norvegicus)", value: "高血壓、神經疾病", change: 18 },
        { rank: 3, name: "斑馬魚 (Danio rerio)", value: "心臟病、發育", change: 34 },
        { rank: 4, name: "果蠅 (Drosophila)", value: "老化、神經退化", change: 12 },
        { rank: 5, name: "獼猴 (Macaca mulatta)", value: "HIV、免疫學", change: 45 },
        { rank: 6, name: "狗 (Canis familiaris)", value: "遺傳疾病", change: 8 },
        { rank: 7, name: "豬 (Sus scrofa)", value: "器官移植", change: 29 },
        { rank: 8, name: "貓 (Felis catus)", value: "病毒感染", change: 15 },
        { rank: 9, name: "兔 (Oryctolagus cuniculus)", value: "心血管疾病", change: 7 },
        { rank: 10, name: "雪貂 (Mustela putorius)", value: "呼吸道疾病", change: 19 },
        { rank: 11, name: "天竺鼠 (Cavia porcellus)", value: "結核病、過敏", change: 11 },
        { rank: 12, name: "雞 (Gallus gallus)", value: "流感、發育", change: 6 },
        { rank: 13, name: "綿羊 (Ovis aries)", value: "朊蛋白疾病", change: 4 },
        { rank: 14, name: "牛 (Bos taurus)", value: "BSE、代謝", change: 9 },
        { rank: 15, name: "馬 (Equus caballus)", value: "肌肉疾病", change: 3 }
      ]
    },
    {
      title: "保育優先級",
      icon: <TrendingUp className="w-5 h-5 text-purple-500" />,
      entries: [
        { rank: 1, name: "大熊貓 (Ailuropoda melanoleuca)", value: "極危", change: 5 },
        { rank: 2, name: "雪豹 (Panthera uncia)", value: "易危", change: 8 },
        { rank: 3, name: "非洲象 (Loxodonta africana)", value: "瀕危", change: -2 },
        { rank: 4, name: "東北虎 (Panthera tigris altaica)", value: "瀕危", change: 12 },
        { rank: 5, name: "北極熊 (Ursus maritimus)", value: "易危", change: -4 },
        { rank: 6, name: "山地大猩猩 (Gorilla beringei)", value: "極危", change: 15 },
        { rank: 7, name: "紅毛猩猩 (Pongo pygmaeus)", value: "極危", change: 7 },
        { rank: 8, name: "黑犀牛 (Diceros bicornis)", value: "極危", change: 9 },
        { rank: 9, name: "獵豹 (Acinonyx jubatus)", value: "易危", change: 3 },
        { rank: 10, name: "藍鯨 (Balaenoptera musculus)", value: "瀕危", change: 6 },
        { rank: 11, name: "加州鼠海豚 (Phocoena sinus)", value: "極危", change: -8 },
        { rank: 12, name: "爪哇犀牛 (Rhinoceros sondaicus)", value: "極危", change: 2 },
        { rank: 13, name: "玳瑁 (Eretmochelys imbricata)", value: "極危", change: 4 },
        { rank: 14, name: "蘇門答臘象 (Elephas maximus)", value: "極危", change: 1 },
        { rank: 15, name: "克羅斯河大猩猩 (Gorilla gorilla)", value: "極危", change: 3 }
      ]
    }
  ],
  datasets: [
    {
      title: "遺傳多樣性指數",
      icon: <Database className="w-5 h-5 text-orange-500" />,
      entries: [
        { rank: 1, name: "狼 (Canis lupus)", value: "0.89 多樣性", change: 12 },
        { rank: 2, name: "棕熊 (Ursus arctos)", value: "0.87 多樣性", change: 8 },
        { rank: 3, name: "赤狐 (Vulpes vulpes)", value: "0.85 多樣性", change: 15 },
        { rank: 4, name: "野豬 (Sus scrofa)", value: "0.83 多樣性", change: 6 },
        { rank: 5, name: "歐洲狍 (Capreolus capreolus)", value: "0.81 多樣性", change: 9 },
        { rank: 6, name: "猞猁 (Lynx lynx)", value: "0.79 多樣性", change: 4 },
        { rank: 7, name: "松貂 (Martes martes)", value: "0.77 多樣性", change: 11 },
        { rank: 8, name: "獾 (Meles meles)", value: "0.75 多樣性", change: 7 },
        { rank: 9, name: "水獺 (Lutra lutra)", value: "0.73 多樣性", change: -2 },
        { rank: 10, name: "野貓 (Felis silvestris)", value: "0.71 多樣性", change: 13 },
        { rank: 11, name: "河狸 (Castor fiber)", value: "0.69 多樣性", change: 5 },
        { rank: 12, name: "貂熊 (Gulo gulo)", value: "0.67 多樣性", change: 3 },
        { rank: 13, name: "白鼬 (Mustela erminea)", value: "0.65 多樣性", change: 8 },
        { rank: 14, name: "雞貂 (Mustela putorius)", value: "0.63 多樣性", change: 2 },
        { rank: 15, name: "鼬 (Mustela nivalis)", value: "0.61 多樣性", change: 6 }
      ]
    },
    {
      title: "長壽冠軍",
      icon: <Medal className="w-5 h-5 text-red-500" />,
      entries: [
        { rank: 1, name: "弓頭鯨 (Balaena mysticetus)", value: "200+ 年", change: 0 },
        { rank: 2, name: "格陵蘭鯊 (Somniosus microcephalus)", value: "400+ 年", change: 0 },
        { rank: 3, name: "巨龜 (Aldabrachelys gigantea)", value: "150+ 年", change: 0 },
        { rank: 4, name: "楔齒蜥 (Sphenodon punctatus)", value: "100+ 年", change: 0 },
        { rank: 5, name: "錦鯉 (Cyprinus carpio)", value: "80+ 年", change: 0 },
        { rank: 6, name: "非洲象 (Loxodonta africana)", value: "70+ 年", change: 0 },
        { rank: 7, name: "金剛鸚鵡 (Ara macao)", value: "60+ 年", change: 0 },
        { rank: 8, name: "馬 (Equus caballus)", value: "50+ 年", change: 0 },
        { rank: 9, name: "黑猩猩 (Pan troglodytes)", value: "45+ 年", change: 0 },
        { rank: 10, name: "棕熊 (Ursus arctos)", value: "40+ 年", change: 0 },
        { rank: 11, name: "獅子 (Panthera leo)", value: "35+ 年", change: 0 },
        { rank: 12, name: "狗 (Canis familiaris)", value: "20+ 年", change: 0 },
        { rank: 13, name: "貓 (Felis catus)", value: "18+ 年", change: 0 },
        { rank: 14, name: "兔 (Oryctolagus cuniculus)", value: "12+ 年", change: 0 },
        { rank: 15, name: "小鼠 (Mus musculus)", value: "3+ 年", change: 0 }
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
    <div className="flex h-screen">
      <SidebarProvider>
        <AppSidebar />
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
      </SidebarProvider>
    </div>
  );
}