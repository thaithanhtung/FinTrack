import { WorldGoldCard, VNGoldCard, PriceComparison, SpreadCalculator } from '@/components/price'

export default function Home() {
  return (
    <div className="space-y-4">
      {/* World Gold Price - Hero section */}
      <WorldGoldCard />

      {/* Price Comparison */}
      <PriceComparison />

      {/* Spread Calculator */}
      <SpreadCalculator />

      {/* VN Gold Prices */}
      <VNGoldCard />
    </div>
  )
}