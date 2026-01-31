import { WorldGoldCard, VNGoldCard, PriceComparison, SpreadCalculator } from '@/components/price'
import { AIAnalysisCard } from '@/components/ai'

export default function Home() {
  return (
    <div className="space-y-4">
      {/* World Gold Price - Hero section */}
      <WorldGoldCard />

      {/* AI Analysis */}
      <AIAnalysisCard />

      {/* Price Comparison */}
      <PriceComparison />

      {/* Spread Calculator */}
      <SpreadCalculator />

      {/* VN Gold Prices */}
      <VNGoldCard />
    </div>
  )
}
