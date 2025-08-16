import { LightPollutionDistributionChart } from "@/components/charts/light-pollution-distribution-chart";
import { LightPollutionTimelineChart } from "@/components/charts/light-pollution-timeline-chart";
import { LightPollutionSourceRatioChart } from "@/components/charts/light-pollution-source-ratio-chart";
import { AreaAnimalAmountChart } from "@/components/charts/area-animal-amount-chart";
import { AreaRatioBioChart } from "@/components/charts/area-ratio-bio-chart";
import { SpeciesTimelineChart } from "@/components/charts/species-timeline-chart";
import { CountyTotalAnimalsChart } from "@/components/charts/county-total-animals-chart";

export default function StatisticsPage() {
  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight mb-2">
                數據統計
              </h2>
              <p className="text-muted-foreground">
                生物數據的綜合統計分析和可視化。
              </p>
            </div>

            <div className="space-y-8">
              {/* Light Pollution Section */}
              <section>
                <div className="mb-6">
                  <h3 className="text-2xl font-semibold tracking-tight mb-2">光害</h3>
                  <p className="text-muted-foreground">光害強度分佈、時間趨勢和來源分析</p>
                </div>
                
                <div className="space-y-6">
                  <LightPollutionDistributionChart />
                  <LightPollutionTimelineChart />
                  <LightPollutionSourceRatioChart />
                </div>
              </section>

              {/* Night Animals Section */}
              <section>
                <div className="mb-6">
                  <h3 className="text-2xl font-semibold tracking-tight mb-2">夜間生物</h3>
                  <p className="text-muted-foreground">夜間動物數量、分佈比例和物種時間軸分析</p>
                </div>
                
                <div className="space-y-6">
                  <AreaAnimalAmountChart />
                  <AreaRatioBioChart />
                  <SpeciesTimelineChart />
                  <CountyTotalAnimalsChart />
                </div>
              </section>

            </div>
          </div>
        </div>
      </main>
    );
}