import {
  WorldGoldCard,
  VNGoldCard,
  PriceComparison,
  SpreadCalculator,
} from "@/components/price";
import { TrendAnalysisCard, TrendChart } from "@/components/trend";
import { useTrendAnalysis } from "@/hooks";

export default function Home() {
  // Fixed to 1 day (24 hours) - no period selector
  const { trendAnalysis, prediction, sma20, sma50, sma200, historyData } =
    useTrendAnalysis("day");

  return (
    <div className="space-y-4">
      {/* World Gold Price - Hero section */}
      <WorldGoldCard />

      {/* Trend Analysis - Fixed to 1 day */}
      {trendAnalysis && (
        <>
          <TrendAnalysisCard
            analysis={trendAnalysis}
            prediction={prediction || undefined}
          />
          <TrendChart
            historyData={historyData}
            sma20={sma20}
            sma50={sma50}
            sma200={sma200}
            supportLevel={trendAnalysis.supportLevel}
            resistanceLevel={trendAnalysis.resistanceLevel}
          />
        </>
      )}

      {/* Price Comparison */}
      <PriceComparison />

      {/* Spread Calculator */}
      <SpreadCalculator />

      {/* VN Gold Prices */}
      <VNGoldCard />
    </div>
  );
}
