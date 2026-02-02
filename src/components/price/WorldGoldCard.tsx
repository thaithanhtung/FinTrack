import { Globe } from "lucide-react";
import {
  Card,
  CardHeader,
  PriceChange,
  LastUpdated,
  ErrorMessage,
  WorldGoldCardSkeleton,
} from "@/components/common";
import { useWorldGoldPrice } from "@/hooks";
import { formatUSD } from "@/services/utils";
import { useTranslation } from "react-i18next";

export function WorldGoldCard() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useWorldGoldPrice();

  if (isLoading) {
    return <WorldGoldCardSkeleton />;
  }

  if (isError || !data) {
    return (
      <Card>
        <ErrorMessage message={t("price.errorWorld")} onRetry={refetch} />
      </Card>
    );
  }

  const isUp = data.change >= 0;

  return (
    <Card className="bg-gradient-to-br from-gold-50 to-amber-50 dark:from-gold-900/20 dark:to-amber-900/20 border-gold-200 dark:border-gold-800 animate-scale-in">
      <CardHeader
        title={t("price.worldGold")}
        subtitle="XAU/USD"
        action={
          <div className="flex items-center gap-1 text-gold-600 dark:text-gold-400">
            <Globe size={16} />
          </div>
        }
      />

      <div className="space-y-3">
        <div className="flex items-end justify-between animate-fade-in">
          <div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 price-value animate-scale-in">
              {formatUSD(data.price)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("price.usdPerOz")}
            </p>
          </div>
          <PriceChange
            change={data.change}
            changePercent={data.changePercent}
            size="md"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gold-200/50 dark:border-gold-800/50">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("price.high24h")}
            </p>
            <p
              className={`font-semibold ${
                isUp
                  ? "text-up dark:text-green-400"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {formatUSD(data.high24h)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("price.low24h")}
            </p>
            <p
              className={`font-semibold ${
                !isUp
                  ? "text-down dark:text-red-400"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {formatUSD(data.low24h)}
            </p>
          </div>
        </div>

        <LastUpdated
          timestamp={data.timestamp}
          fetchedAt={data.fetchedAt}
          warningThresholdMinutes={2}
        />
      </div>
    </Card>
  );
}
