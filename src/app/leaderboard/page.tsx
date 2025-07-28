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
      title: "Most Studied Species",
      icon: <Trophy className="w-5 h-5 text-yellow-500" />,
      entries: [
        { rank: 1, name: "House Mouse (Mus musculus)", value: "45,782 studies", change: 156 },
        { rank: 2, name: "Fruit Fly (Drosophila melanogaster)", value: "38,245 studies", change: 98 },
        { rank: 3, name: "Zebrafish (Danio rerio)", value: "32,156 studies", change: 134 },
        { rank: 4, name: "Norway Rat (Rattus norvegicus)", value: "28,934 studies", change: 67 },
        { rank: 5, name: "Rhesus Macaque (Macaca mulatta)", value: "24,567 studies", change: 89 },
        { rank: 6, name: "African Clawed Frog (Xenopus laevis)", value: "19,823 studies", change: 45 },
        { rank: 7, name: "Chimpanzee (Pan troglodytes)", value: "16,745 studies", change: 23 },
        { rank: 8, name: "Domestic Dog (Canis familiaris)", value: "14,892 studies", change: 78 },
        { rank: 9, name: "Domestic Cat (Felis catus)", value: "12,456 studies", change: 34 },
        { rank: 10, name: "Pig (Sus scrofa)", value: "11,234 studies", change: 56 },
        { rank: 11, name: "Chicken (Gallus gallus)", value: "9,876 studies", change: 43 },
        { rank: 12, name: "Cow (Bos taurus)", value: "8,765 studies", change: 29 },
        { rank: 13, name: "Horse (Equus caballus)", value: "7,432 studies", change: 18 },
        { rank: 14, name: "Sheep (Ovis aries)", value: "6,543 studies", change: 25 },
        { rank: 15, name: "Rabbit (Oryctolagus cuniculus)", value: "5,987 studies", change: 31 }
      ]
    },
    {
      title: "Genome Sequencing Progress",
      icon: <Award className="w-5 h-5 text-blue-500" />,
      entries: [
        { rank: 1, name: "Mouse (Mus musculus)", value: "99.8% complete", change: 2 },
        { rank: 2, name: "Rat (Rattus norvegicus)", value: "99.5% complete", change: 1 },
        { rank: 3, name: "Zebrafish (Danio rerio)", value: "99.2% complete", change: 3 },
        { rank: 4, name: "Fruit Fly (Drosophila melanogaster)", value: "98.9% complete", change: 0 },
        { rank: 5, name: "Chimpanzee (Pan troglodytes)", value: "98.7% complete", change: 4 },
        { rank: 6, name: "Dog (Canis familiaris)", value: "98.4% complete", change: 2 },
        { rank: 7, name: "Macaque (Macaca mulatta)", value: "98.1% complete", change: 1 },
        { rank: 8, name: "Pig (Sus scrofa)", value: "97.8% complete", change: 5 },
        { rank: 9, name: "Cat (Felis catus)", value: "97.5% complete", change: 3 },
        { rank: 10, name: "Chicken (Gallus gallus)", value: "97.2% complete", change: 2 },
        { rank: 11, name: "Cow (Bos taurus)", value: "96.9% complete", change: 1 },
        { rank: 12, name: "Frog (Xenopus laevis)", value: "96.6% complete", change: 4 },
        { rank: 13, name: "Horse (Equus caballus)", value: "96.3% complete", change: 2 },
        { rank: 14, name: "Sheep (Ovis aries)", value: "96.0% complete", change: 3 },
        { rank: 15, name: "Rabbit (Oryctolagus cuniculus)", value: "95.7% complete", change: 1 }
      ]
    }
  ],
  institutions: [
    {
      title: "Disease Research Models",
      icon: <Users className="w-5 h-5 text-green-500" />,
      entries: [
        { rank: 1, name: "Mouse (Mus musculus)", value: "Cancer, Diabetes, Alzheimer's", change: 23 },
        { rank: 2, name: "Rat (Rattus norvegicus)", value: "Hypertension, Neurological", change: 18 },
        { rank: 3, name: "Zebrafish (Danio rerio)", value: "Heart Disease, Development", change: 34 },
        { rank: 4, name: "Fruit Fly (Drosophila)", value: "Aging, Neurodegeneration", change: 12 },
        { rank: 5, name: "Macaque (Macaca mulatta)", value: "HIV, Immunology", change: 45 },
        { rank: 6, name: "Dog (Canis familiaris)", value: "Inherited Diseases", change: 8 },
        { rank: 7, name: "Pig (Sus scrofa)", value: "Organ Transplantation", change: 29 },
        { rank: 8, name: "Cat (Felis catus)", value: "Viral Infections", change: 15 },
        { rank: 9, name: "Rabbit (Oryctolagus cuniculus)", value: "Cardiovascular", change: 7 },
        { rank: 10, name: "Ferret (Mustela putorius)", value: "Respiratory Diseases", change: 19 },
        { rank: 11, name: "Guinea Pig (Cavia porcellus)", value: "Tuberculosis, Allergies", change: 11 },
        { rank: 12, name: "Chicken (Gallus gallus)", value: "Influenza, Development", change: 6 },
        { rank: 13, name: "Sheep (Ovis aries)", value: "Prion Diseases", change: 4 },
        { rank: 14, name: "Cow (Bos taurus)", value: "BSE, Metabolism", change: 9 },
        { rank: 15, name: "Horse (Equus caballus)", value: "Muscle Disorders", change: 3 }
      ]
    },
    {
      title: "Conservation Priority",
      icon: <TrendingUp className="w-5 h-5 text-purple-500" />,
      entries: [
        { rank: 1, name: "Giant Panda (Ailuropoda melanoleuca)", value: "Critical", change: 5 },
        { rank: 2, name: "Snow Leopard (Panthera uncia)", value: "Vulnerable", change: 8 },
        { rank: 3, name: "African Elephant (Loxodonta africana)", value: "Endangered", change: -2 },
        { rank: 4, name: "Amur Tiger (Panthera tigris altaica)", value: "Endangered", change: 12 },
        { rank: 5, name: "Polar Bear (Ursus maritimus)", value: "Vulnerable", change: -4 },
        { rank: 6, name: "Mountain Gorilla (Gorilla beringei)", value: "Critical", change: 15 },
        { rank: 7, name: "Orangutan (Pongo pygmaeus)", value: "Critical", change: 7 },
        { rank: 8, name: "Black Rhinoceros (Diceros bicornis)", value: "Critical", change: 9 },
        { rank: 9, name: "Cheetah (Acinonyx jubatus)", value: "Vulnerable", change: 3 },
        { rank: 10, name: "Blue Whale (Balaenoptera musculus)", value: "Endangered", change: 6 },
        { rank: 11, name: "Vaquita (Phocoena sinus)", value: "Critical", change: -8 },
        { rank: 12, name: "Javan Rhinoceros (Rhinoceros sondaicus)", value: "Critical", change: 2 },
        { rank: 13, name: "Hawksbill Turtle (Eretmochelys imbricata)", value: "Critical", change: 4 },
        { rank: 14, name: "Sumatran Elephant (Elephas maximus)", value: "Critical", change: 1 },
        { rank: 15, name: "Cross River Gorilla (Gorilla gorilla)", value: "Critical", change: 3 }
      ]
    }
  ],
  datasets: [
    {
      title: "Genetic Diversity Index",
      icon: <Database className="w-5 h-5 text-orange-500" />,
      entries: [
        { rank: 1, name: "Wolf (Canis lupus)", value: "0.89 diversity", change: 12 },
        { rank: 2, name: "Brown Bear (Ursus arctos)", value: "0.87 diversity", change: 8 },
        { rank: 3, name: "Red Fox (Vulpes vulpes)", value: "0.85 diversity", change: 15 },
        { rank: 4, name: "Wild Boar (Sus scrofa)", value: "0.83 diversity", change: 6 },
        { rank: 5, name: "European Roe Deer (Capreolus capreolus)", value: "0.81 diversity", change: 9 },
        { rank: 6, name: "Lynx (Lynx lynx)", value: "0.79 diversity", change: 4 },
        { rank: 7, name: "Pine Marten (Martes martes)", value: "0.77 diversity", change: 11 },
        { rank: 8, name: "Badger (Meles meles)", value: "0.75 diversity", change: 7 },
        { rank: 9, name: "Otter (Lutra lutra)", value: "0.73 diversity", change: -2 },
        { rank: 10, name: "Wildcat (Felis silvestris)", value: "0.71 diversity", change: 13 },
        { rank: 11, name: "Beaver (Castor fiber)", value: "0.69 diversity", change: 5 },
        { rank: 12, name: "Wolverine (Gulo gulo)", value: "0.67 diversity", change: 3 },
        { rank: 13, name: "Stoat (Mustela erminea)", value: "0.65 diversity", change: 8 },
        { rank: 14, name: "Polecat (Mustela putorius)", value: "0.63 diversity", change: 2 },
        { rank: 15, name: "Weasel (Mustela nivalis)", value: "0.61 diversity", change: 6 }
      ]
    },
    {
      title: "Longevity Champions",
      icon: <Medal className="w-5 h-5 text-red-500" />,
      entries: [
        { rank: 1, name: "Bowhead Whale (Balaena mysticetus)", value: "200+ years", change: 0 },
        { rank: 2, name: "Greenland Shark (Somniosus microcephalus)", value: "400+ years", change: 0 },
        { rank: 3, name: "Giant Tortoise (Aldabrachelys gigantea)", value: "150+ years", change: 0 },
        { rank: 4, name: "Tuatara (Sphenodon punctatus)", value: "100+ years", change: 0 },
        { rank: 5, name: "Koi Fish (Cyprinus carpio)", value: "80+ years", change: 0 },
        { rank: 6, name: "African Elephant (Loxodonta africana)", value: "70+ years", change: 0 },
        { rank: 7, name: "Macaw (Ara macao)", value: "60+ years", change: 0 },
        { rank: 8, name: "Horse (Equus caballus)", value: "50+ years", change: 0 },
        { rank: 9, name: "Chimpanzee (Pan troglodytes)", value: "45+ years", change: 0 },
        { rank: 10, name: "Brown Bear (Ursus arctos)", value: "40+ years", change: 0 },
        { rank: 11, name: "Lion (Panthera leo)", value: "35+ years", change: 0 },
        { rank: 12, name: "Dog (Canis familiaris)", value: "20+ years", change: 0 },
        { rank: 13, name: "Cat (Felis catus)", value: "18+ years", change: 0 },
        { rank: 14, name: "Rabbit (Oryctolagus cuniculus)", value: "12+ years", change: 0 },
        { rank: 15, name: "Mouse (Mus musculus)", value: "3+ years", change: 0 }
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
                <h2 className="text-3xl font-bold tracking-tight mb-2">Leaderboards</h2>
                <p className="text-muted-foreground">
                  Track top performers across researchers, institutions, and datasets
                </p>
              </div>
              
              {/* Tabs Section */}
              <Tabs defaultValue="researchers" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="researchers">Researchers</TabsTrigger>
                  <TabsTrigger value="institutions">Institutions</TabsTrigger>
                  <TabsTrigger value="datasets">Datasets</TabsTrigger>
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