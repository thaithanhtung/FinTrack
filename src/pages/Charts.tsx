import { PriceChart } from "@/components/chart";
import { WorldGoldCard } from "@/components/price";
import { DateComparison } from "@/components/comparison";

export default function Charts() {
  return (
    <div className="space-y-4">
      <WorldGoldCard />
      <PriceChart />
      <DateComparison />
    </div>
  );
}
