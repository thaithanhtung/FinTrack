import { PriceChart } from '@/components/chart'
import { WorldGoldCard } from '@/components/price'

export default function Charts() {
  return (
    <div className="space-y-4">
      <WorldGoldCard />
      <PriceChart />
    </div>
  )
}
